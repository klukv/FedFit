"""
Оркестратор гибридного pipeline: Rule Engine → Workout Matcher / Exercise Composer → Plan Assembler.
"""

from __future__ import annotations

import logging
from typing import Dict, List, Tuple

from app.models.plan_structures import TrainingPlanResponse
from app.models.schemas import UserQuestionnaire
from app.services.catalog_loader import CatalogLoader
from app.services.exercise_composer import ExerciseComposer
from app.services.plan_assembler import PlanAssembler
from app.services.rule_engine import RuleEngine, RuleEngineOutput
from app.services.workout_matcher import WorkoutMatcher

logger = logging.getLogger(__name__)


class RecommendationService:
    """
    Координирует компоненты inference:

      1. Rule Engine — слоты и фильтрация
      2. Для каждого слота: Workout Matcher (каталог) или Exercise Composer (ML)
      3. Plan Assembler — итоговый план
    """

    def __init__(
        self,
        rule_engine: RuleEngine,
        catalog_loader: CatalogLoader,
        workout_matcher: WorkoutMatcher,
        exercise_composer: ExerciseComposer,
        plan_assembler: PlanAssembler,
    ) -> None:
        self.rule_engine = rule_engine
        self.catalog_loader = catalog_loader
        self.workout_matcher = workout_matcher
        self.exercise_composer = exercise_composer
        self.plan_assembler = plan_assembler

    def recommend(
        self,
        questionnaire: UserQuestionnaire,
    ) -> Tuple[TrainingPlanResponse, List[Dict[str, str]]]:
        """
        Генерирует план и метаданные по источнику каждого слота.

        Returns:
            (plan, slot_sources) — slot_sources: [{day, name, source}, ...]
        """
        rule_output = self.rule_engine.apply(questionnaire)

        if not rule_output.available_exercises:
            raise ValueError("empty_exercise_pool")

        available_ids = {int(ex["id"]) for ex in rule_output.available_exercises}
        used_catalog_ids: set[int] = set()
        workouts_out = []
        slot_sources: List[Dict[str, str]] = []

        for slot in rule_output.workout_slots:
            match = self.workout_matcher.find_best(
                slot=slot,
                questionnaire=questionnaire,
                available_exercise_ids=available_ids,
                used_catalog_ids=used_catalog_ids,
            )

            if match.passed and match.workout is not None:
                used_catalog_ids.add(int(match.workout["id"]))
                workouts_out.append(self.plan_assembler.from_catalog(match.workout))
                source = match.source
                logger.info(
                    "Слот день %s '%s': каталог id=%s (score=%.1f)",
                    slot.day_number,
                    slot.name,
                    match.workout["id"],
                    match.score,
                )
            else:
                workout, source = self.exercise_composer.compose(
                    slot=slot,
                    rule_output=rule_output,
                    questionnaire=questionnaire,
                )
                workouts_out.append(workout)
                logger.info(
                    "Слот день %s '%s': %s",
                    slot.day_number,
                    slot.name,
                    source,
                )

            slot_sources.append(
                {
                    "day": str(slot.day_number),
                    "name": slot.name,
                    "source": source,
                }
            )

        plan = self.plan_assembler.assemble_plan(rule_output, workouts_out)
        return plan, slot_sources
