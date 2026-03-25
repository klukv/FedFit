"""
Генерация признаков (features) для ML-компонента.

Машинное обучение работает с числовыми векторами, поэтому категориальные
данные анкеты нужно преобразовать в числовой формат.

Используется simple one-hot / ordinal encoding без внешних библиотек
(кроме numpy), чтобы избежать проблем совместимости при загрузке joblib.
"""

import numpy as np
from typing import Any, Dict, List

from app.models.schemas import UserQuestionnaire


# ──────────────────────────────────────────────
# Словари кодирования категориальных признаков
# ──────────────────────────────────────────────

GOAL_ENCODING = {
    "weight_loss": 0,
    "muscle_gain": 1,
    "endurance": 2,
    "general_fitness": 3,
}

LEVEL_ENCODING = {
    "beginner": 0,
    "intermediate": 1,
    "advanced": 2,
}

EQUIPMENT_COLUMNS = ["none", "dumbbells", "barbell", "pullup_bar", "kettlebell"]
RESTRICTION_COLUMNS = ["knee", "back", "shoulder"]


def questionnaire_to_features(questionnaire: UserQuestionnaire) -> np.ndarray:
    """
    Преобразует анкету пользователя в числовой вектор признаков.

    Структура вектора (10 признаков):
      [0]   goal (ordinal: 0-3)
      [1]   level (ordinal: 0-2)
      [2]   frequency (1-7)
      [3]   duration_preference (15/30/45/60)
      [4-8] equipment (one-hot: none, dumbbells, barbell, pullup_bar, kettlebell)
      [9-11] restrictions (one-hot: knee, back, shoulder)

    Args:
        questionnaire: анкета пользователя

    Returns:
        numpy array формы (12,)
    """
    features = []

    # Ordinal признаки
    features.append(GOAL_ENCODING[questionnaire.goal.value])
    features.append(LEVEL_ENCODING[questionnaire.level.value])
    features.append(float(questionnaire.frequency))

    # Нормализуем duration в диапазон [0, 1] для единообразия масштабов
    features.append(questionnaire.duration_preference / 60.0)

    # One-hot для инвентаря
    user_equipment = {e.value for e in questionnaire.equipment}
    for col in EQUIPMENT_COLUMNS:
        features.append(1.0 if col in user_equipment else 0.0)

    # One-hot для ограничений
    user_restrictions = {r.value for r in questionnaire.restrictions}
    for col in RESTRICTION_COLUMNS:
        features.append(1.0 if col in user_restrictions else 0.0)

    return np.array(features, dtype=np.float32)


def exercise_to_features(exercise: Dict[str, Any]) -> np.ndarray:
    """
    Преобразует характеристики упражнения в числовой вектор.

    Используется для вычисления «близости» упражнения к профилю пользователя.

    Структура вектора:
      [0]   muscle_group (ordinal)
      [1-5] equipment (one-hot)
      [2]   has_reps (1/0)
      [3]   has_duration (1/0)
      [4]   calories_per_set (нормализованные)

    Args:
        exercise: словарь с данными упражнения из exercises.json

    Returns:
        numpy array
    """
    MUSCLE_ENCODING = {
        "cardio": 0, "core": 1, "chest": 2, "back": 3,
        "shoulders": 4, "arms": 5, "legs": 6, "glutes": 7, "full_body": 8,
    }

    features = []
    features.append(MUSCLE_ENCODING.get(exercise.get("muscle_group", "full_body"), 8))

    # One-hot для инвентаря упражнения
    ex_equipment = set(exercise.get("equipment", ["none"]))
    for col in EQUIPMENT_COLUMNS:
        features.append(1.0 if col in ex_equipment else 0.0)

    features.append(1.0 if exercise.get("reps") is not None else 0.0)
    features.append(1.0 if exercise.get("duration") is not None else 0.0)

    # Нормализуем калорийность (обычно 5-25 кал за подход)
    calories = exercise.get("calories_per_set", 10.0)
    features.append(min(calories / 25.0, 1.0))

    return np.array(features, dtype=np.float32)


def get_feature_names() -> List[str]:
    """Возвращает имена признаков — для отладки и документирования модели."""
    names = ["goal", "level", "frequency", "duration_norm"]
    names += [f"equipment_{e}" for e in EQUIPMENT_COLUMNS]
    names += [f"restriction_{r}" for r in RESTRICTION_COLUMNS]
    return names
