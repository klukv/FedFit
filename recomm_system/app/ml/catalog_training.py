"""
Генерация обучающей выборки из каталога БД (без фидбека пользователей).

Позитивы: упражнение ∈ workout_exercise для inferred profile workout.
Негативы: упражнение из пула с соблюдением hard constraints, но не в составе.
При малом каталоге — дополнение expert rules (semi-supervised).
"""

from __future__ import annotations

import random
from collections import Counter
from typing import Any, Dict, List, Optional, Set, Tuple

import numpy as np

from app.ml.features import (
    EQUIPMENT_COLUMNS,
    GOAL_ENCODING,
    LEVEL_ENCODING,
    RESTRICTION_COLUMNS,
    exercise_to_features,
)
from app.services.catalog_loader import CatalogData
from app.services.workout_matcher import GOAL_MUSCLE_AFFINITY

GOALS = list(GOAL_ENCODING.keys())
LEVELS = list(LEVEL_ENCODING.keys())
MIN_CATALOG_SAMPLES = 500


def infer_goal_from_workout(
    workout: Dict[str, Any],
    catalog: CatalogData,
    exercises_by_id: Dict[int, Dict[str, Any]],
) -> str:
    """
    Цель из training_plan (weak label) или эвристика по muscle_groups.
    """
    workout_id = int(workout["id"])
    linked_plans = catalog.plans_for_workout(workout_id)

    goals_from_plans: List[str] = []
    for plan in linked_plans:
        goal = plan.get("goal")
        if goal and goal in GOALS:
            goals_from_plans.append(goal)

    if goals_from_plans:
        return Counter(goals_from_plans).most_common(1)[0][0]

    # Эвристика: какая цель лучше всего объясняет muscle_groups тренировки
    groups = set(workout.get("muscle_groups") or [])
    if not groups:
        for item in workout.get("exercises") or []:
            meta = exercises_by_id.get(int(item["exercise_id"]))
            if meta:
                groups.add(meta.get("muscle_group", "full_body"))

    best_goal = "general_fitness"
    best_score = -1.0
    for goal, affinity in GOAL_MUSCLE_AFFINITY.items():
        score = sum(affinity.get(g, 0.3) for g in groups)
        if groups:
            score /= len(groups)
        if score > best_score:
            best_score = score
            best_goal = goal

    return best_goal


def infer_equipment_from_workout(
    workout: Dict[str, Any],
    exercises_by_id: Dict[int, Dict[str, Any]],
) -> List[str]:
    """Union equipment всех упражнений в тренировке."""
    equipment: Set[str] = set()
    for item in workout.get("exercises") or []:
        meta = exercises_by_id.get(int(item["exercise_id"]))
        if meta:
            equipment.update(meta.get("equipment") or ["none"])
    return sorted(equipment) if equipment else ["none"]


def infer_profile_from_workout(
    workout: Dict[str, Any],
    catalog: CatalogData,
    frequency_default: int = 3,
) -> Dict[str, Any]:
    """Синтетический профиль пользователя, типичный для данной workout."""
    exercises_by_id = catalog.exercises_by_id
    goal = infer_goal_from_workout(workout, catalog, exercises_by_id)

    return {
        "goal": goal,
        "level": str(workout["level"]),
        "duration_preference": int(workout["duration"]),
        "equipment": infer_equipment_from_workout(workout, exercises_by_id),
        "restrictions": [],
        "frequency": frequency_default,
    }


def _profile_to_features(profile: Dict[str, Any]) -> np.ndarray:
    features: List[float] = [
        float(GOAL_ENCODING[profile["goal"]]),
        float(LEVEL_ENCODING[profile["level"]]),
        float(profile.get("frequency", 3)),
        float(profile["duration_preference"]) / 60.0,
    ]
    user_equipment = set(profile.get("equipment") or ["none"])
    for col in EQUIPMENT_COLUMNS:
        features.append(1.0 if col in user_equipment else 0.0)
    user_restrictions = set(profile.get("restrictions") or [])
    for col in RESTRICTION_COLUMNS:
        features.append(1.0 if col in user_restrictions else 0.0)
    return np.array(features, dtype=np.float32)


def _passes_hard_constraints(
    exercise: Dict[str, Any],
    profile: Dict[str, Any],
) -> bool:
    """Инвентарь, ограничения, уровень — как в rule engine."""
    user_equipment = set(profile.get("equipment") or ["none"])
    ex_equipment = set(exercise.get("equipment") or ["none"])
    if "none" not in ex_equipment and not (ex_equipment & user_equipment):
        return False

    user_restrictions = set(profile.get("restrictions") or [])
    excluded = set(exercise.get("restrictions_excluded") or [])
    if user_restrictions & excluded:
        return False

    level_order = {"beginner": 0, "intermediate": 1, "advanced": 2}
    user_level = level_order.get(profile["level"], 0)
    ex_levels = exercise.get("level") or ["beginner"]
    ex_level_nums = [level_order.get(str(l), 0) for l in ex_levels]
    if not any(l <= user_level for l in ex_level_nums):
        return False

    return True


def generate_catalog_data(
    catalog: CatalogData,
    negatives_per_positive: int = 3,
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Строит X, y из workout_exercise связей каталога.

    Returns:
        X, y, stats — статистика для /retrain
    """
    exercises_by_id = catalog.exercises_by_id
    all_exercises = catalog.exercises

    X_list: List[np.ndarray] = []
    y_list: List[float] = []
    positive_count = 0
    negative_count = 0

    random.seed(42)

    for workout in catalog.workouts:
        if not workout.get("exercises"):
            continue

        profile = infer_profile_from_workout(workout, catalog)
        user_feat = _profile_to_features(profile)

        positive_ids = {int(item["exercise_id"]) for item in workout["exercises"]}

        # Позитивы
        for ex_id in positive_ids:
            exercise = exercises_by_id.get(ex_id)
            if exercise is None:
                continue
            combined = np.concatenate([user_feat, exercise_to_features(exercise)])
            X_list.append(combined)
            y_list.append(1.0)
            positive_count += 1

        # Негативы из пула с hard constraints
        negative_pool = [
            ex
            for ex in all_exercises
            if int(ex["id"]) not in positive_ids and _passes_hard_constraints(ex, profile)
        ]
        random.shuffle(negative_pool)
        n_neg = min(len(negative_pool), len(positive_ids) * negatives_per_positive)

        for exercise in negative_pool[:n_neg]:
            combined = np.concatenate([user_feat, exercise_to_features(exercise)])
            X_list.append(combined)
            y_list.append(random.uniform(0.0, 0.3))
            negative_count += 1

    total = len(X_list)
    stats = {
        "n_samples": total,
        "n_positive": positive_count,
        "n_negative": negative_count,
        "n_workouts": len(catalog.workouts),
        "catalog_ratio": 1.0 if total > 0 else 0.0,
        "augmented": False,
    }

    if total == 0:
        return np.array([]), np.array([]), stats

    return np.array(X_list), np.array(y_list), stats


def augment_with_expert_data(
    X: np.ndarray,
    y: np.ndarray,
    exercises: List[Dict[str, Any]],
    target_samples: int = MIN_CATALOG_SAMPLES,
) -> Tuple[np.ndarray, np.ndarray, bool]:
    """
    Дополняет выборку синтетическими expert rules, если каталог мал.
    """
    if len(X) >= target_samples:
        return X, y, False

    from app.ml.pipeline import _generate_synthetic_data

    needed = target_samples - len(X)
    X_syn, y_syn = _generate_synthetic_data(exercises, n_samples=needed)

    if len(X) == 0:
        return X_syn, y_syn, True

    X_combined = np.vstack([X, X_syn])
    y_combined = np.concatenate([y, y_syn])
    return X_combined, y_combined, True
