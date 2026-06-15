"""
Exercise Composer — сборка тренировки из упражнений, когда каталог не подошёл.

Пул = rule_output.available_exercises
ML ранжирует упражнения → выбор top-N под slot.target_muscle_groups
Сборка WorkoutInPlan с id=0 (или catalog_by_signature при совпадении)
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Tuple

from app.models.schemas import UserQuestionnaire
from app.services.ml_selector import MLSelector
from app.services.plan_assembler import PlanAssembler
from app.services.rule_engine import RuleEngineOutput, WorkoutSlot

logger = logging.getLogger(__name__)


class ExerciseComposer:
    """Обёртка над MLSelector + PlanAssembler для генерации тренировки."""

    def __init__(self, ml_selector: MLSelector, plan_assembler: PlanAssembler) -> None:
        self.ml_selector = ml_selector
        self.plan_assembler = plan_assembler

    def compose(
        self,
        slot: WorkoutSlot,
        rule_output: RuleEngineOutput,
        questionnaire: UserQuestionnaire,
    ) -> Tuple[Any, str]:
        """
        Подбирает упражнения для слота и собирает WorkoutInPlan.

        Returns:
            (WorkoutInPlan, source) — generated | catalog_by_signature
        """
        scored = self.ml_selector.rank_exercises(
            available=rule_output.available_exercises,
            questionnaire=questionnaire,
        )

        selected = self.ml_selector.select_for_slot(
            slot=slot,
            scored_exercises=scored,
            exercise_count=slot.exercise_count,
        )

        if not selected:
            logger.warning(
                "Слот '%s' (день %s): не удалось подобрать упражнения",
                slot.name,
                slot.day_number,
            )

        workout, source = self.plan_assembler.from_exercises(
            slot=slot,
            exercises=selected,
            level=rule_output.level,
        )
        return workout, source
