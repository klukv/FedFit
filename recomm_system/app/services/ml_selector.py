"""
ML-компонент: выбор и ранжирование упражнений с помощью sklearn Pipeline.

Роль в гибридной архитектуре:
  - Rule engine уже отфильтровал упражнения (убрал недоступные/противопоказанные)
  - ML selector из оставшегося пула выбирает ЛУЧШИЕ упражнения для каждого слота
  - Если ML-модель не загружена — используется детерминированный fallback

Fallback стратегия (без ML-модели):
  Упражнения сортируются по «жадному» score: соответствие группы мышц + калорийность.
  Это не ML, но результат воспроизводимый и прозрачный.
"""

import logging
import random
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from app.ml.features import questionnaire_to_features
from app.ml.pipeline import Pipeline, load_model, score_exercises, train_and_save_model
from app.models.schemas import UserQuestionnaire
from app.services.rule_engine import RuleEngineOutput, WorkoutSlot

logger = logging.getLogger(__name__)


class MLSelector:
    """
    Выбирает конкретные упражнения для каждого слота тренировки.

    При создании экземпляра пытается загрузить сохранённую модель.
    Если модель не найдена — обучает новую (на синтетических данных).
    """

    def __init__(self, force_retrain: bool = False):
        """
        Args:
            force_retrain: принудительно переобучить модель даже если она существует
        """
        self.model: Optional[Pipeline] = None
        self._load_or_train(force_retrain)

    def _load_or_train(self, force_retrain: bool) -> None:
        """Загружает модель или обучает новую."""
        if not force_retrain:
            self.model = load_model()

        if self.model is None:
            logger.info("Обучение новой модели на синтетических данных...")
            try:
                self.model = train_and_save_model()
                logger.info("Модель успешно обучена и сохранена")
            except Exception as e:
                logger.error(f"Ошибка при обучении модели: {e}. Переключаемся на rule-based fallback.")
                self.model = None

    def select(
        self,
        rule_output: RuleEngineOutput,
        questionnaire: UserQuestionnaire,
    ) -> List[Tuple[WorkoutSlot, List[Dict[str, Any]]]]:
        """
        Для каждого слота тренировки выбирает список упражнений.

        Args:
            rule_output: результат работы rule engine (доступные упражнения + слоты)
            questionnaire: оригинальная анкета (для генерации ML-признаков)

        Returns:
            Список пар (слот, список_выбранных_упражнений)
        """
        available = rule_output.available_exercises

        if self.model is not None:
            # ── ML-путь: используем обученную модель ──
            logger.info("Используется ML-модель для ранжирования упражнений")
            user_features = questionnaire_to_features(questionnaire)
            scores = score_exercises(self.model, user_features, available)
            source = "hybrid"
        else:
            # ── Fallback: детерминированное ранжирование ──
            logger.warning("ML-модель недоступна, используется rule-based ранжирование")
            scores = self._fallback_scores(available, questionnaire)
            source = "rule_only"

        self._recommendation_source = source

        # Создаём список (упражнение, score) и сортируем по убыванию рейтинга
        scored_exercises = list(zip(available, scores))
        scored_exercises.sort(key=lambda x: x[1], reverse=True)

        # Для каждого слота выбираем подходящие упражнения
        result = []
        for slot in rule_output.workout_slots:
            selected = self._select_for_slot(
                slot=slot,
                scored_exercises=scored_exercises,
                exercise_count=slot.exercise_count,
            )
            result.append((slot, selected))

        return result

    @property
    def recommendation_source(self) -> str:
        """Источник рекомендации для мета-информации в ответе."""
        return getattr(self, "_recommendation_source", "hybrid")

    def _select_for_slot(
        self,
        slot: WorkoutSlot,
        scored_exercises: List[Tuple[Dict[str, Any], float]],
        exercise_count: int,
    ) -> List[Dict[str, Any]]:
        """
        Выбирает упражнения для конкретного слота тренировки.

        Алгоритм выбора:
          1. Фильтруем по целевым группам мышц слота
          2. Берём top-N упражнений по рейтингу
          3. Если не хватает — добираем из смежных групп
          4. Обеспечиваем разнообразие (не все упражнения на одну группу)

        Args:
            slot: описание слота (целевые мышцы, количество упражнений)
            scored_exercises: все упражнения с рейтингами, отсортированные по убыванию
            exercise_count: сколько упражнений нужно выбрать

        Returns:
            Список выбранных упражнений (словари из exercises.json)
        """
        target_groups = set(slot.target_muscle_groups)

        # ── Первичный пул: упражнения на целевые мышцы ──
        primary_pool = [
            (ex, score) for ex, score in scored_exercises
            if ex.get("muscle_group") in target_groups
        ]

        # ── Вторичный пул: если мало упражнений — берём любые ──
        secondary_pool = [
            (ex, score) for ex, score in scored_exercises
            if ex.get("muscle_group") not in target_groups
        ]

        selected = []
        used_ids = set()
        used_groups = {}  # Считаем сколько упражнений на каждую группу

        # Сначала выбираем из первичного пула
        for ex, score in primary_pool:
            if len(selected) >= exercise_count:
                break
            if ex["id"] in used_ids:
                continue

            group = ex.get("muscle_group", "full_body")
            # Ограничиваем до 2 упражнений на одну группу мышц (разнообразие)
            if used_groups.get(group, 0) >= 2:
                continue

            selected.append(ex)
            used_ids.add(ex["id"])
            used_groups[group] = used_groups.get(group, 0) + 1

        # Если не набрали нужное количество — добираем из вторичного пула
        for ex, score in secondary_pool:
            if len(selected) >= exercise_count:
                break
            if ex["id"] in used_ids:
                continue

            selected.append(ex)
            used_ids.add(ex["id"])

        # Если ещё не хватает (крайне редкий случай) — повторно используем из первичного
        if len(selected) < exercise_count:
            for ex, score in primary_pool:
                if len(selected) >= exercise_count:
                    break
                if ex["id"] not in used_ids:
                    selected.append(ex)
                    used_ids.add(ex["id"])

        return selected

    def _fallback_scores(
        self,
        exercises: List[Dict[str, Any]],
        questionnaire: UserQuestionnaire,
    ) -> List[float]:
        """
        Детерминированное ранжирование без ML-модели.

        Используется простая эвристика:
          - Соответствие группы мышц цели тренировки
          - Калорийность упражнения

        ПРИМЕЧАНИЕ: это временный fallback. В продакшн всегда должна
        быть доступна обученная ML-модель.
        """
        GOAL_MUSCLE_SCORE = {
            "weight_loss":    {"cardio": 1.0, "full_body": 0.9, "core": 0.7, "legs": 0.8},
            "muscle_gain":    {"chest": 1.0, "back": 1.0, "legs": 1.0, "shoulders": 0.9, "arms": 0.8},
            "endurance":      {"cardio": 1.0, "legs": 0.9, "core": 0.8, "full_body": 0.9},
            "general_fitness":{"full_body": 1.0, "core": 0.9, "cardio": 0.8, "legs": 0.8},
        }

        goal = questionnaire.goal.value
        scores = []
        for ex in exercises:
            muscle = ex.get("muscle_group", "full_body")
            base = GOAL_MUSCLE_SCORE.get(goal, {}).get(muscle, 0.5)
            # Небольшая нормализованная калорийность как тай-брейкер
            cal_score = min(ex.get("calories_per_set", 10) / 25.0, 1.0) * 0.1
            scores.append(base + cal_score)

        return scores
