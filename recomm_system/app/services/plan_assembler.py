"""
Plan Assembler — сборка TrainingPlanResponse из каталожных и сгенерированных тренировок.

Не выбирает тренировки (это WorkoutMatcher / ExerciseComposer),
только формирует контракт API и метаданные плана.
"""

from __future__ import annotations

import logging
import math
from typing import Any, Dict, List, Optional, Sequence, Tuple

from app.models.plan_structures import (
    TrainingPlanResponse,
    WorkoutExerciseLink,
    WorkoutInPlan,
)
from app.services.catalog_loader import CatalogData
from app.services.rule_engine import RuleEngineOutput, WorkoutSlot

logger = logging.getLogger(__name__)


def _calorie_bounds(total: float) -> Tuple[int, int]:
    if total <= 0:
        return 0, 0
    low = max(0, int(math.floor(total * 0.9)))
    high = max(low + 1, int(math.ceil(total * 1.1)))
    return low, high


def _exercise_signature(
    exercises: Sequence[Dict[str, Any]],
) -> Tuple[Tuple[int, Optional[int], Optional[int], Optional[int]], ...]:
    return tuple(
        (
            int(item["exercise_id"]),
            item.get("sets"),
            item.get("reps"),
            item.get("duration"),
        )
        for item in exercises
    )


class PlanAssembler:
    """Объединяет слоты в итоговый план и собирает WorkoutInPlan."""

    def __init__(self, catalog: CatalogData) -> None:
        self.catalog = catalog
        self.exercises_by_id = catalog.exercises_by_id

    def assemble_plan(
        self,
        rule_output: RuleEngineOutput,
        workouts: List[WorkoutInPlan],
    ) -> TrainingPlanResponse:
        plan = TrainingPlanResponse(
            id=0,
            name=rule_output.plan_name,
            description=rule_output.plan_description,
            workouts=workouts,
        )
        logger.info("План собран: '%s', %s тренировок", plan.name, len(workouts))
        return plan

    def from_catalog(self, catalog_workout: Dict[str, Any]) -> WorkoutInPlan:
        """Тренировка из каталога БД — id сохраняется."""
        links = self._build_links_from_catalog(catalog_workout["exercises"])
        return WorkoutInPlan(
            id=int(catalog_workout["id"]),
            name=str(catalog_workout["name"]),
            description=catalog_workout.get("description"),
            image=catalog_workout.get("image"),
            level=str(catalog_workout["level"]),
            calories_min=int(catalog_workout["calories_min"]),
            calories_max=int(catalog_workout["calories_max"]),
            duration=int(catalog_workout["duration"]),
            exercises_count=len(links),
            exercises=links,
        )

    def from_exercises(
        self,
        slot: WorkoutSlot,
        exercises: List[Dict[str, Any]],
        level: str,
    ) -> Tuple[WorkoutInPlan, str]:
        """
        Собирает тренировку из подобранных упражнений (id=0).

        Returns:
            (WorkoutInPlan, source) — source: generated | catalog_by_signature
        """
        links: List[WorkoutExerciseLink] = []
        workout_calories = 0.0
        generated_items: List[Dict[str, Any]] = []

        for exercise in exercises:
            link, calories, item = self._build_exercise_link(exercise=exercise, slot=slot)
            links.append(link)
            workout_calories += calories
            generated_items.append(item)

        matched = self._find_catalog_by_signature(generated_items)
        if matched is not None:
            logger.debug(
                "Сгенерированный состав совпал с каталогом id=%s",
                matched["id"],
            )
            return self.from_catalog(matched), "catalog_by_signature"

        cmin, cmax = _calorie_bounds(workout_calories)
        workout = WorkoutInPlan(
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
        return workout, "generated"

    def _find_catalog_by_signature(
        self,
        generated_items: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        signature = _exercise_signature(generated_items)
        for workout in self.catalog.workouts:
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
                logger.warning("Упражнение id=%s не найдено в каталоге", exercise_id)
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
        group_names = [muscle_names.get(g, g) for g in slot.target_muscle_groups]
        if not group_names:
            return f"Тренировка длительностью {slot.estimated_time} минут."
        return (
            f"Тренировка на {', '.join(group_names)}. "
            f"Примерное время: {slot.estimated_time} мин."
        )
