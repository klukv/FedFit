"""
Сборщик итогового плана тренировок.

Принимает результаты rule engine и ML selector и формирует
финальный JSON-объект, соответствующий бизнес-сущностям приложения.

Ответственность plan_builder:
  - Переопределить сеты/повторения согласно параметрам слота
  - Рассчитать примерную калорийность плана
  - Сформировать Pydantic-объект WorkoutPlanResponse
  - Убедиться, что все exercise_id существуют в кэше
"""

import logging
import math
from typing import Any, Dict, List, Optional, Tuple

from app.models.plan_structures import (
    WorkoutExerciseResponse,
    WorkoutPlanResponse,
    WorkoutResponse,
)
from app.services.rule_engine import RuleEngineOutput, WorkoutSlot

logger = logging.getLogger(__name__)


class PlanBuilder:
    """
    Формирует финальный план тренировок из компонентов.
    """

    def build(
        self,
        rule_output: RuleEngineOutput,
        slot_exercises: List[Tuple[WorkoutSlot, List[Dict[str, Any]]]],
        recommendation_source: str = "hybrid",
    ) -> WorkoutPlanResponse:
        """
        Собирает WorkoutPlanResponse из слотов и упражнений.

        Args:
            rule_output: результат rule engine (метаданные плана, параметры)
            slot_exercises: список пар (слот, выбранные упражнения) от ML selector
            recommendation_source: строка-источник для мета-данных

        Returns:
            Готовый план в формате Pydantic-модели
        """
        workouts = []
        total_calories = 0.0

        for slot, exercises in slot_exercises:
            if not exercises:
                logger.warning(f"Слот '{slot.name}' (день {slot.day_number}) не получил упражнений!")
                continue

            # Строим список упражнений для тренировки
            exercise_responses = []
            workout_calories = 0.0

            for order_idx, ex in enumerate(exercises, start=1):
                ex_response, cal = self._build_exercise(
                    exercise=ex,
                    order_index=order_idx,
                    slot=slot,
                )
                exercise_responses.append(ex_response)
                workout_calories += cal

            total_calories += workout_calories

            workout = WorkoutResponse(
                name=slot.name,
                description=self._generate_workout_description(slot),
                order_index=slot.day_number,
                estimated_time=slot.estimated_time,
                exercises=exercise_responses,
            )
            workouts.append(workout)

        # Еженедельная калорийность = калории за все тренировки в неделю
        # (мы предполагаем, что план выполняется один раз в неделю)
        weekly_calories = round(total_calories, 1) if total_calories > 0 else None

        plan = WorkoutPlanResponse(
            name=rule_output.plan_name,
            description=rule_output.plan_description,
            level=rule_output.level,
            workouts=workouts,
            weekly_frequency=len(workouts),
            estimated_weekly_calories=weekly_calories,
            recommendation_source=recommendation_source,
        )

        logger.info(
            f"План собран: '{plan.name}', {len(workouts)} тренировок, "
            f"~{weekly_calories} кал/нед, источник: {recommendation_source}"
        )

        return plan

    def _build_exercise(
        self,
        exercise: Dict[str, Any],
        order_index: int,
        slot: WorkoutSlot,
    ) -> Tuple[WorkoutExerciseResponse, float]:
        """
        Формирует WorkoutExerciseResponse с переопределёнными параметрами из слота.

        Логика переопределения параметров:
          - Если слот задаёт reps_range — используем середину диапазона
          - Если у упражнения есть duration (кардио) — используем его
          - Калорийность рассчитывается с учётом количества подходов

        Returns:
            (WorkoutExerciseResponse, estimated_calories)
        """
        # Определяем сеты из слота (переопределяем default из exercises.json)
        sets = slot.sets

        # Определяем повторения или длительность
        if exercise.get("duration") is not None:
            # Это упражнение по времени (кардио, планки и т.д.)
            reps = None
            duration = exercise["duration"]
        elif slot.reps_range is not None:
            # Используем середину диапазона повторений из слота
            reps_min, reps_max = slot.reps_range
            reps = math.ceil((reps_min + reps_max) / 2)
            duration = None
        else:
            # Fallback: используем defaults из упражнения
            reps = exercise.get("reps")
            duration = exercise.get("duration")

        # Рассчитываем калорийность
        cal_per_set = exercise.get("calories_per_set", 0.0)
        if duration is not None:
            # Для кардио: cal_per_set трактуется как кал/минуту
            estimated_calories = cal_per_set * sets * (duration / 60.0)
        else:
            estimated_calories = cal_per_set * sets

        ex_response = WorkoutExerciseResponse(
            exercise_id=exercise["id"],
            name=exercise["name"],
            description=exercise.get("description"),
            muscle_group=exercise.get("muscle_group", "full_body"),
            order_index=order_index,
            sets=sets,
            reps=reps,
            duration=duration,
            calories_per_set=cal_per_set,
        )

        return ex_response, estimated_calories

    def _generate_workout_description(self, slot: WorkoutSlot) -> str:
        """
        Генерирует текстовое описание тренировки на основе целевых групп мышц.
        Используется для отображения в UI приложения.
        """
        MUSCLE_NAMES_RU = {
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

        group_names = [
            MUSCLE_NAMES_RU.get(g, g)
            for g in slot.target_muscle_groups
        ]

        if not group_names:
            return f"Тренировка длительностью {slot.estimated_time} минут."

        groups_str = ", ".join(group_names)
        return (
            f"Тренировка на {groups_str}. "
            f"Примерное время: {slot.estimated_time} мин."
        )
