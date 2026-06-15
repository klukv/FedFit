"""
Нормализация snapshot каталога с бэкенда (GET /v1/internal/catalog/export)
в единый формат для recomm_system.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional


def _parse_json_field(value: Any, default: Any) -> Any:
    """Парсит JSON-поле из ответа бэкенда (строка, list или null)."""
    if value is None:
        return default
    if isinstance(value, (list, dict)):
        return value
    if isinstance(value, str):
        if not value.strip():
            return default
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return default
    return default


def normalize_exercise(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Приводит Exercise из CatalogExport к формату exercises.json."""
    muscle_group = raw.get("muscle_group")
    if muscle_group is None:
        muscle_group = "full_body"
    else:
        muscle_group = str(muscle_group)

    equipment = _parse_json_field(raw.get("equipment"), ["none"])
    restrictions = _parse_json_field(raw.get("restrictions_excluded"), [])
    level = _parse_json_field(raw.get("level"), ["beginner"])

    calories = raw.get("calories_per_set")
    if calories is None:
        calories = 10.0

    return {
        "id": int(raw["id"]),
        "name": str(raw["name"]),
        "description": str(raw.get("description") or ""),
        "icon": raw.get("icon"),
        "muscle_group": muscle_group,
        "equipment": equipment,
        "restrictions_excluded": restrictions,
        "level": level,
        "sets": raw.get("sets"),
        "reps": raw.get("reps"),
        "duration": raw.get("duration"),
        "calories_per_set": float(calories),
    }


def normalize_workout(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Приводит CatalogWorkout к формату workouts.json."""
    muscle_groups = _parse_json_field(raw.get("muscle_groups"), [])
    if not isinstance(muscle_groups, list):
        muscle_groups = []

    exercises_out: List[Dict[str, Any]] = []
    for item in raw.get("exercises") or []:
        exercises_out.append(
            {
                "exercise_id": int(item["exercise_id"]),
                "sets": item.get("sets"),
                "reps": item.get("reps"),
                "duration": item.get("duration"),
            }
        )

    return {
        "id": int(raw["id"]),
        "name": str(raw["name"]),
        "value": str(raw.get("value") or ""),
        "description": raw.get("description"),
        "image": raw.get("image"),
        "level": str(raw["level"]),
        "calories_min": int(raw["calories_min"]),
        "calories_max": int(raw["calories_max"]),
        "duration": int(raw["duration"]),
        "muscle_groups": muscle_groups,
        "exercises": exercises_out,
    }


def normalize_training_plan(raw: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": int(raw["id"]),
        "name": str(raw["name"]),
        "description": str(raw.get("description") or ""),
        "goal": raw.get("goal"),
        "target_level": raw.get("target_level"),
    }


def normalize_catalog_export(export: Dict[str, Any]) -> Dict[str, Any]:
    """
    Конвертирует тело CatalogExport в единый catalog.json.

    Конвертация выполняется на стороне recomm_system (не на бэкенде).
    """
    exercises = [normalize_exercise(ex) for ex in export.get("exercises") or []]
    workouts = [normalize_workout(w) for w in export.get("workouts") or []]
    training_plans = [
        normalize_training_plan(p) for p in export.get("training_plans") or []
    ]
    links = [
        {
            "training_plan_id": int(link["training_plan_id"]),
            "workout_id": int(link["workout_id"]),
        }
        for link in export.get("training_plan_workout_links") or []
    ]

    return {
        "exercises": exercises,
        "workouts": workouts,
        "training_plans": training_plans,
        "training_plan_workout_links": links,
    }
