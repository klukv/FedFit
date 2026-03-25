"""
ML Pipeline для рейтинга упражнений.

АРХИТЕКТУРНОЕ РЕШЕНИЕ:
Вместо классификатора (предсказывающего одно упражнение) используется
подход «скоринга»: для каждого упражнения вычисляется числовой рейтинг
совместимости с профилем пользователя.

Почему не чистый классификатор:
  - Набор упражнений может меняться (добавление/удаление из БД)
  - После фильтрации rule-engine пул упражнений уже ограничен
  - Нам нужен РАНЖИРОВАННЫЙ список, а не одно предсказание

Модель: GradientBoostingRegressor, обученный на синтетических данных
(сгенерированных на основе экспертных правил). В продакшн нужно заменить
на данные реальных пользователей.

ВАЖНО: Синтетические данные здесь — временное решение для прототипа.
При накоплении реальных данных (например, какие планы пользователи выполняли
дольше всего / оценивали выше) модель следует переобучить.
"""

import json
import logging
import random
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.ml.features import (
    GOAL_ENCODING, LEVEL_ENCODING, EQUIPMENT_COLUMNS, RESTRICTION_COLUMNS,
    questionnaire_to_features, exercise_to_features,
)

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data"
MODELS_DIR = Path(__file__).parent.parent.parent / "models"
MODEL_PATH = MODELS_DIR / "exercise_selector.pkl"


# ──────────────────────────────────────────────
# ГЕНЕРАЦИЯ СИНТЕТИЧЕСКИХ ОБУЧАЮЩИХ ДАННЫХ
# ──────────────────────────────────────────────

def _generate_synthetic_data(
    exercises: List[Dict[str, Any]],
    n_samples: int = 2000
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Генерирует синтетические обучающие данные на основе экспертных правил.

    Идея: если бы мы были экспертом-тренером, мы бы оценили каждую
    пару (профиль пользователя, упражнение) по шкале 0-1.
    Эта функция имитирует такую оценку.

    Args:
        exercises: список упражнений из exercises.json
        n_samples: количество синтетических примеров

    Returns:
        X: матрица признаков [n_samples, n_features]
        y: вектор оценок [n_samples] в диапазоне [0, 1]
    """

    # Правила оценки совместимости упражнения с профилем (экспертные знания)
    GOAL_MUSCLE_AFFINITY = {
        # (цель, группа мышц) -> базовый рейтинг
        "weight_loss":    {"cardio": 1.0, "full_body": 0.9, "core": 0.7, "legs": 0.8, "glutes": 0.7,
                           "chest": 0.5, "back": 0.5, "shoulders": 0.4, "arms": 0.3},
        "muscle_gain":    {"chest": 1.0, "back": 1.0, "legs": 1.0, "shoulders": 0.9, "arms": 0.8,
                           "glutes": 0.7, "core": 0.5, "full_body": 0.6, "cardio": 0.2},
        "endurance":      {"cardio": 1.0, "legs": 0.9, "core": 0.8, "full_body": 0.9,
                           "glutes": 0.6, "chest": 0.4, "back": 0.5, "shoulders": 0.3, "arms": 0.3},
        "general_fitness":{"full_body": 1.0, "core": 0.9, "legs": 0.8, "chest": 0.7, "back": 0.7,
                           "cardio": 0.8, "glutes": 0.7, "shoulders": 0.6, "arms": 0.5},
    }

    X_list = []
    y_list = []

    goals = list(GOAL_ENCODING.keys())
    levels = list(LEVEL_ENCODING.keys())
    durations = [15, 30, 45, 60]

    random.seed(42)  # Воспроизводимость

    for _ in range(n_samples):
        # Генерируем случайный профиль пользователя
        goal = random.choice(goals)
        level = random.choice(levels)
        frequency = random.randint(1, 7)
        duration = random.choice(durations)

        # Случайный набор инвентаря
        n_equipment = random.randint(1, 3)
        equipment = random.sample(EQUIPMENT_COLUMNS, n_equipment)

        # Случайные ограничения (чаще без ограничений)
        restrictions = []
        if random.random() < 0.2:
            restrictions = [random.choice(RESTRICTION_COLUMNS)]

        # Случайное упражнение из списка
        exercise = random.choice(exercises)

        # ── Вычисляем экспертную оценку ──

        # 1. Совместимость цели и группы мышц
        muscle_group = exercise.get("muscle_group", "full_body")
        affinity = GOAL_MUSCLE_AFFINITY[goal].get(muscle_group, 0.5)

        # 2. Штраф за недоступный инвентарь
        ex_equipment = set(exercise.get("equipment", ["none"]))
        user_equipment = set(equipment)
        if "none" in ex_equipment:
            equipment_score = 1.0
        elif ex_equipment & user_equipment:
            equipment_score = 1.0
        else:
            equipment_score = 0.0  # Упражнение недоступно — нулевой рейтинг

        # 3. Штраф за ограничения здоровья
        restrictions_excluded = set(exercise.get("restrictions_excluded", []))
        user_restrictions = set(restrictions)
        if restrictions_excluded & user_restrictions:
            restriction_score = 0.0
        else:
            restriction_score = 1.0

        # 4. Совместимость уровня
        ex_levels = exercise.get("level", ["beginner"])
        level_order = {"beginner": 0, "intermediate": 1, "advanced": 2}
        user_level_num = level_order[level]
        ex_level_nums = [level_order.get(l, 0) for l in ex_levels]
        if any(l <= user_level_num for l in ex_level_nums):
            level_score = 1.0
        else:
            level_score = 0.3  # Слишком сложное для уровня

        # 5. Бонус за кардио при коротких тренировках
        if duration <= 30 and muscle_group == "cardio":
            cardio_bonus = 0.2
        else:
            cardio_bonus = 0.0

        # Итоговый рейтинг — взвешенная сумма
        score = (
            0.40 * affinity +
            0.25 * equipment_score +
            0.20 * restriction_score +
            0.10 * level_score +
            0.05 * random.gauss(1.0, 0.1)  # Небольшой шум для разнообразия
        ) + cardio_bonus

        # Зажимаем в [0, 1]
        score = max(0.0, min(1.0, score))

        # Умножаем на 0 если упражнение недоступно (hard constraint)
        if equipment_score == 0.0 or restriction_score == 0.0:
            score = 0.0

        # ── Формируем вектор признаков ──
        # Конкатенируем признаки пользователя и упражнения
        user_feat = np.array([
            GOAL_ENCODING[goal],
            LEVEL_ENCODING[level],
            float(frequency),
            duration / 60.0,
        ] + [1.0 if e in equipment else 0.0 for e in EQUIPMENT_COLUMNS]
          + [1.0 if r in restrictions else 0.0 for r in RESTRICTION_COLUMNS],
            dtype=np.float32)

        ex_feat = exercise_to_features(exercise)
        combined = np.concatenate([user_feat, ex_feat])

        X_list.append(combined)
        y_list.append(score)

    return np.array(X_list), np.array(y_list)


def train_and_save_model(exercises: Optional[List[Dict[str, Any]]] = None) -> Pipeline:
    """
    Обучает sklearn Pipeline и сохраняет его в файл.

    Pipeline состоит из:
      1. StandardScaler — нормализация признаков (важно для gradient boosting)
      2. GradientBoostingRegressor — предсказание рейтинга упражнения

    Args:
        exercises: список упражнений (загружается из файла если не передан)

    Returns:
        обученный Pipeline
    """
    if exercises is None:
        exercises_path = DATA_DIR / "exercises.json"
        with open(exercises_path, "r", encoding="utf-8") as f:
            exercises = json.load(f)

    logger.info("Генерация синтетических обучающих данных...")
    X, y = _generate_synthetic_data(exercises, n_samples=3000)
    logger.info(f"Сгенерировано {len(X)} примеров. X.shape={X.shape}")

    # Создаём и обучаем Pipeline
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("regressor", GradientBoostingRegressor(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            random_state=42,
            # Небольшое количество деревьев — достаточно для прототипа
            # и обеспечивает быстрый inference (< 50 мс)
        )),
    ])

    pipeline.fit(X, y)

    # Оцениваем модель на тренировочных данных (для информации)
    train_score = pipeline.score(X, y)
    logger.info(f"R² на обучающих данных: {train_score:.3f}")

    # Сохраняем модель
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    logger.info(f"Модель сохранена: {MODEL_PATH}")

    return pipeline


def load_model() -> Optional[Pipeline]:
    """
    Загружает сохранённую модель из joblib файла.

    Returns:
        Pipeline если файл существует, иначе None.
        Вызывающий код должен обработать случай None (fallback на rule-based).
    """
    if not MODEL_PATH.exists():
        logger.warning(f"Файл модели не найден: {MODEL_PATH}. Используется rule-based fallback.")
        return None

    try:
        pipeline = joblib.load(MODEL_PATH)
        logger.info(f"Модель загружена: {MODEL_PATH}")
        return pipeline
    except Exception as e:
        logger.error(f"Ошибка загрузки модели: {e}")
        return None


def score_exercises(
    pipeline: Pipeline,
    questionnaire_features: np.ndarray,
    exercises: List[Dict[str, Any]],
) -> List[float]:
    """
    Вычисляет рейтинг каждого упражнения из списка для данного пользователя.

    Args:
        pipeline: обученный sklearn Pipeline
        questionnaire_features: вектор признаков пользователя (из features.py)
        exercises: список кандидатов-упражнений

    Returns:
        Список рейтингов (float 0-1) в том же порядке, что и exercises
    """
    if not exercises:
        return []

    # Формируем матрицу: каждая строка = конкатенация признаков пользователя + упражнения
    X = []
    for exercise in exercises:
        ex_feat = exercise_to_features(exercise)
        combined = np.concatenate([questionnaire_features, ex_feat])
        X.append(combined)

    X_matrix = np.array(X)
    scores = pipeline.predict(X_matrix)

    # Зажимаем предсказания в [0, 1]
    scores = np.clip(scores, 0.0, 1.0)
    return scores.tolist()
