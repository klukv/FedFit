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
from app.services.rule_engine import WorkoutSlot

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
        self._train_metrics: Dict[str, Any] = {}
        self._load_or_train(force_retrain)

    @property
    def train_metrics(self) -> Dict[str, Any]:
        """Метрики последнего обучения (для /retrain)."""
        return self._train_metrics

    def _load_or_train(self, force_retrain: bool) -> None:
        """Загружает модель или обучает новую."""
        if force_retrain:
            self.model = None
        elif self.model is None:
            self.model = load_model()

        if self.model is None:
            logger.info("Обучение новой модели (каталог + expert rules)...")
            try:
                self.model, self._train_metrics = train_and_save_model()
                logger.info("Модель успешно обучена и сохранена: %s", self._train_metrics)
            except Exception as e:
                logger.error(f"Ошибка при обучении модели: {e}. Переключаемся на rule-based fallback.")
                self.model = None

    def rank_exercises(
        self,
        available: List[Dict[str, Any]],
        questionnaire: UserQuestionnaire,
    ) -> List[Tuple[Dict[str, Any], float]]:
        """
        Ранжирует упражнения из отфильтрованного пула.

        Используется ExerciseComposer при сборке тренировки из упражнений.
        """
        if self.model is not None:
            logger.debug("ML-модель: ранжирование %s упражнений", len(available))
            user_features = questionnaire_to_features(questionnaire)
            scores = score_exercises(self.model, user_features, available)
            self._recommendation_source = "hybrid"
        else:
            logger.warning("ML-модель недоступна — rule-based ранжирование")
            scores = self._fallback_scores(available, questionnaire)
            self._recommendation_source = "rule_only"

        scored = list(zip(available, scores))
        scored.sort(key=lambda item: item[1], reverse=True)
        return scored

    def select_for_slot(
        self,
        slot: WorkoutSlot,
        scored_exercises: List[Tuple[Dict[str, Any], float]],
        exercise_count: int,
    ) -> List[Dict[str, Any]]:
        """Выбирает top-N упражнений для слота с учётом целевых групп мышц."""
        return self._select_for_slot(
            slot=slot,
            scored_exercises=scored_exercises,
            exercise_count=exercise_count,
        )

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
