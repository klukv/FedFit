"""
Сборщик итогового плана тренировок.

ID тренировки в ответе:
  - id > 0 — тренировка взята из кэша БД (workouts.json) без изменений;
  - id = 0 — тренировка собрана рекомендательной системой из подобранных упражнений.
"""

from __future__ import annotations

import json
import logging
import math
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

from app.models.plan_structures import (
    TrainingPlanResponse,
    WorkoutExerciseLink,
    WorkoutInPlan,
)
from app.services.rule_engine import RuleEngineOutput, WorkoutSlot

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data"

LEVEL_RANK = {"beginner": 0, "intermediate": 1, "advanced": 2}


def _calorie_bounds(total: float) -> Tuple[int, int]:
    """Диапазон калорий для полей caloriesMin / caloriesMax (целые числа)."""
    if total <= 0:
        return 0, 0
    low = max(0, int(math.floor(total * 0.9)))
    high = max(low + 1, int(math.ceil(total * 1.1)))
    return low, high


def _exercise_signature(
    exercises: Sequence[Dict[str, Any]],
) -> Tuple[Tuple[int, Optional[int], Optional[int], Optional[int]], ...]:
    """Сигнатура состава тренировки для сравнения с каталогом."""
    return tuple(
        (
            int(item["exercise_id"]),
            item.get("sets"),
            item.get("reps"),
            item.get("duration"),
        )
        for item in exercises
    )


class PlanBuilder:
    """Собирает TrainingPlanResponse из выхода rule engine и выбранных упражнений."""

    def __init__(self) -> None:
        self.exercises_by_id: Dict[int, Dict[str, Any]] = self._load_exercises_index()
        self.catalog_workouts: List[Dict[str, Any]] = self._load_catalog_workouts()

    def _load_exercises_index(self) -> Dict[int, Dict[str, Any]]:
        exercises_path = DATA_DIR / "exercises.json"
        with open(exercises_path, "r", encoding="utf-8") as file:
            exercises = json.load(file)
        return {int(exercise["id"]): exercise for exercise in exercises}

    def _load_catalog_workouts(self) -> List[Dict[str, Any]]:
        workouts_path = DATA_DIR / "workouts.json"
        with open(workouts_path, "r", encoding="utf-8") as file:
            return json.load(file)

    def build(
        self,
        rule_output: RuleEngineOutput,
        slot_exercises: List[Tuple[WorkoutSlot, List[Dict[str, Any]]]],
    ) -> TrainingPlanResponse:
        workouts_out: List[WorkoutInPlan] = []
        used_catalog_ids: set[int] = set()
        available_ids = {int(exercise["id"]) for exercise in rule_output.available_exercises}

        for slot, exercises in slot_exercises:
            catalog_workout = self._pick_catalog_workout(
                slot=slot,
                user_level=rule_output.level,
                available_exercise_ids=available_ids,
                used_catalog_ids=used_catalog_ids,
            )

            if catalog_workout is not None:
                used_catalog_ids.add(int(catalog_workout["id"]))
                workouts_out.append(self._build_catalog_workout(catalog_workout))
                logger.debug(
                    "Слот '%s': использована тренировка из каталога id=%s",
                    slot.name,
                    catalog_workout["id"],
                )
                continue

            if not exercises:
                logger.warning(
                    "Слот '%s' (день %s) не получил упражнений",
                    slot.name,
                    slot.day_number,
                )
                continue

            workouts_out.append(
                self._build_generated_workout(
                    slot=slot,
                    exercises=exercises,
                    level=rule_output.level,
                )
            )

        plan = TrainingPlanResponse(
            id=0,
            name=rule_output.plan_name,
            description=rule_output.plan_description,
            workouts=workouts_out,
        )

        logger.info("План собран: '%s', %s тренировок", plan.name, len(workouts_out))

        return plan

    def _pick_catalog_workout(
        self,
        slot: WorkoutSlot,
        user_level: str,
        available_exercise_ids: set[int],
        used_catalog_ids: set[int],
    ) -> Optional[Dict[str, Any]]:
        """Подбирает готовую тренировку из кэша БД без изменений."""
        user_rank = LEVEL_RANK.get(user_level, 0)
        target_groups = set(slot.target_muscle_groups)
        best: Optional[Dict[str, Any]] = None
        best_score = -1.0

        for workout in self.catalog_workouts:
            workout_id = int(workout["id"])
            if workout_id in used_catalog_ids:
                continue

            workout_rank = LEVEL_RANK.get(str(workout["level"]), 0)
            if user_rank < workout_rank:
                continue

            catalog_exercise_ids = {
                int(item["exercise_id"]) for item in workout["exercises"]
            }
            if not catalog_exercise_ids.issubset(available_exercise_ids):
                continue

            duration_diff = abs(int(workout["duration"]) - slot.estimated_time)
            if duration_diff > 20:
                continue

            catalog_groups = set(workout.get("muscle_groups", []))
            overlap = len(catalog_groups & target_groups)
            if overlap == 0 and "full_body" not in catalog_groups:
                continue

            score = overlap * 10 - duration_diff
            if score > best_score:
                best_score = score
                best = workout

        return best

    def _build_catalog_workout(self, catalog: Dict[str, Any]) -> WorkoutInPlan:
        """Тренировка из каталога БД — id сохраняется."""
        links = self._build_links_from_catalog(catalog["exercises"])

        return WorkoutInPlan(
            id=int(catalog["id"]),
            name=str(catalog["name"]),
            description=catalog.get("description"),
            image=catalog.get("image"),
            level=str(catalog["level"]),
            calories_min=int(catalog["calories_min"]),
            calories_max=int(catalog["calories_max"]),
            duration=int(catalog["duration"]),
            exercises_count=len(links),
            exercises=links,
        )

    def _build_generated_workout(
        self,
        slot: WorkoutSlot,
        exercises: List[Dict[str, Any]],
        level: str,
    ) -> WorkoutInPlan:
        """Тренировка, собранная из подобранных упражнений — id=0."""
        links: List[WorkoutExerciseLink] = []
        workout_calories = 0.0
        generated_items: List[Dict[str, Any]] = []

        for exercise in exercises:
            link, calories, item = self._build_exercise_link(exercise=exercise, slot=slot)
            links.append(link)
            workout_calories += calories
            generated_items.append(item)

        matched_catalog = self._find_catalog_by_signature(generated_items)
        if matched_catalog is not None:
            logger.debug(
                "Сгенерированный состав совпал с каталогом id=%s",
                matched_catalog["id"],
            )
            return self._build_catalog_workout(matched_catalog)

        cmin, cmax = _calorie_bounds(workout_calories)

        return WorkoutInPlan(
            id=0,
            name=slot.name,
            description=self._generate_workout_description(slot),
            image=None,
            level=level,
            calories_min=cmin,
            calories_max=cmax,
            duration=slot.estimated_time,
            exercises_count=len(links),
            exercises=links,
        )

    def _find_catalog_by_signature(
        self,
        generated_items: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        signature = _exercise_signature(generated_items)
        for workout in self.catalog_workouts:
            if _exercise_signature(workout["exercises"]) == signature:
                return workout
        return None

    def _build_links_from_catalog(
        self,
        catalog_exercises: List[Dict[str, Any]],
    ) -> List[WorkoutExerciseLink]:
        links: List[WorkoutExerciseLink] = []

        for item in catalog_exercises:
            exercise_id = int(item["exercise_id"])
            meta = self.exercises_by_id.get(exercise_id)
            if meta is None:
                logger.warning("Упражнение id=%s не найдено в exercises.json", exercise_id)
                continue

            raw_icon = meta.get("icon")
            links.append(
                WorkoutExerciseLink(
                    id=exercise_id,
                    name=str(meta["name"]),
                    description=str(meta.get("description") or ""),
                    icon=str(raw_icon) if raw_icon is not None else None,
                    sets=item.get("sets"),
                    reps=item.get("reps"),
                    duration=item.get("duration"),
                )
            )

        return links

    def _build_exercise_link(
        self,
        exercise: Dict[str, Any],
        slot: WorkoutSlot,
    ) -> Tuple[WorkoutExerciseLink, float, Dict[str, Any]]:
        """Собирает серию упражнения и данные для сравнения с каталогом."""
        sets = slot.sets

        if exercise.get("duration") is not None:
            reps = None
            duration = int(exercise["duration"])
        elif slot.reps_range is not None:
            reps_min, reps_max = slot.reps_range
            reps = int(math.ceil((reps_min + reps_max) / 2))
            duration = None
        else:
            reps = exercise.get("reps")
            if reps is not None:
                reps = int(reps)
            raw_dur = exercise.get("duration")
            duration = int(raw_dur) if raw_dur is not None else None

        cal_per_set = float(exercise.get("calories_per_set") or 0.0)
        if duration is not None:
            estimated_calories = cal_per_set * sets * (duration / 60.0)
        else:
            estimated_calories = cal_per_set * sets

        raw_icon = exercise.get("icon")
        icon = str(raw_icon) if raw_icon is not None else None

        link = WorkoutExerciseLink(
            id=int(exercise["id"]),
            name=str(exercise["name"]),
            description=str(exercise.get("description") or ""),
            icon=icon,
            sets=sets,
            reps=reps,
            duration=duration,
        )

        catalog_item = {
            "exercise_id": int(exercise["id"]),
            "sets": sets,
            "reps": reps,
            "duration": duration,
        }

        return link, estimated_calories, catalog_item

    def _generate_workout_description(self, slot: WorkoutSlot) -> str:
        """Краткое описание сгенерированной тренировки."""
        muscle_names = {
            "cardio": "кардио",
            "core": "пресс и кор",
            "chest": "грудь",
            "back": "спина",
            "shoulders": "плечи",
            "arms": "руки",
            "legs": "ноги",
            "glutes": "ягодицы",
            "full_body": "всё тело",
        }

        group_names = [muscle_names.get(group, group) for group in slot.target_muscle_groups]

        if not group_names:
            return f"Тренировка длительностью {slot.estimated_time} минут."

        groups_str = ", ".join(group_names)
        return (
            f"Тренировка на {groups_str}. Примерное время: {slot.estimated_time} мин."
        )
