"""
Сборщик итогового плана тренировок.

Каждая тренировка в ответе: метаданные + массив exercises (JSON-объекты).
"""

from __future__ import annotations

import logging
import math
from typing import Any, Dict, List, Tuple

from app.models.plan_structures import (
    TrainingPlanResponse,
    WorkoutExerciseLink,
    WorkoutInPlan,
)
from app.services.rule_engine import RuleEngineOutput, WorkoutSlot

logger = logging.getLogger(__name__)


def _calorie_bounds(total: float) -> Tuple[int, int]:
    """Диапазон калорий для полей caloriesMin / caloriesMax (целые числа)."""
    if total <= 0:
        return 0, 0
    low = max(0, int(math.floor(total * 0.9)))
    high = max(low + 1, int(math.ceil(total * 1.1)))
    return low, high


class PlanBuilder:
    """Собирает TrainingPlanResponse из выхода rule engine и выбранных упражнений."""

    def build(
        self,
        rule_output: RuleEngineOutput,
        slot_exercises: List[Tuple[WorkoutSlot, List[Dict[str, Any]]]],
    ) -> TrainingPlanResponse:
        workouts_out: List[WorkoutInPlan] = []

        for slot, exercises in slot_exercises:
            if not exercises:
                logger.warning(
                    "Слот '%s' (день %s) не получил упражнений",
                    slot.name,
                    slot.day_number,
                )
                continue

            links: List[WorkoutExerciseLink] = []
            workout_calories = 0.0

            for ex in exercises:
                link, cal = self._build_exercise_link(exercise=ex, slot=slot)
                links.append(link)
                workout_calories += cal

            cmin, cmax = _calorie_bounds(workout_calories)

            workouts_out.append(
                WorkoutInPlan(
                    id=0,
                    name=slot.name,
                    description=self._generate_workout_description(slot),
                    image=None,
                    level=rule_output.level,
                    calories_min=cmin,
                    calories_max=cmax,
                    duration=slot.estimated_time,
                    exercises_count=len(links),
                    exercises=links,
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

    def _build_exercise_link(
        self,
        exercise: Dict[str, Any],
        slot: WorkoutSlot,
    ) -> Tuple[WorkoutExerciseLink, float]:
        """Только FK + параметры серии; калории — для диапазона тренировки."""
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

        return link, estimated_calories

    def _generate_workout_description(self, slot: WorkoutSlot) -> str:
        """Краткое описание тренировки."""
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

        groups_str = ", ".join(group_names)
        return (
            f"Тренировка на {groups_str}. Примерное время: {slot.estimated_time} мин."
        )
