"""Тесты гибридного pipeline recomm_system."""

from __future__ import annotations

import pytest

from app.models.enums import Equipment, Goal, Level, Restriction
from app.models.schemas import UserQuestionnaire
from app.services.catalog_loader import CatalogLoader
from app.services.exercise_composer import ExerciseComposer
from app.services.ml_selector import MLSelector
from app.services.plan_assembler import PlanAssembler
from app.services.recommendation_service import RecommendationService
from app.services.rule_engine import RuleEngine
from app.services.workout_matcher import WorkoutMatcher


@pytest.fixture(scope="module")
def components():
    catalog_loader = CatalogLoader()
    rule_engine = RuleEngine(exercises=catalog_loader.catalog.exercises)
    ml_selector = MLSelector()
    workout_matcher = WorkoutMatcher(catalog_loader.catalog)
    plan_assembler = PlanAssembler(catalog_loader.catalog)
    exercise_composer = ExerciseComposer(ml_selector, plan_assembler)
    service = RecommendationService(
        rule_engine=rule_engine,
        catalog_loader=catalog_loader,
        workout_matcher=workout_matcher,
        exercise_composer=exercise_composer,
        plan_assembler=plan_assembler,
    )
    return service


def _questionnaire(**kwargs) -> UserQuestionnaire:
    defaults = {
        "goal": Goal.WEIGHT_LOSS,
        "level": Level.BEGINNER,
        "equipment": [Equipment.NONE],
        "frequency": 3,
        "duration_preference": 30,
        "restrictions": [],
    }
    defaults.update(kwargs)
    return UserQuestionnaire(**defaults)


def test_recommend_returns_plan(components):
    plan, sources = components.recommend(_questionnaire())
    assert plan.name
    assert len(plan.workouts) == 3
    assert len(sources) == 3
    for workout in plan.workouts:
        assert workout.exercises_count == len(workout.exercises)
        assert workout.exercises_count > 0


def test_slot_sources_are_valid(components):
    _, sources = components.recommend(_questionnaire(frequency=2, duration_preference=15))
    valid = {"catalog", "generated", "catalog_by_signature"}
    for item in sources:
        assert item["source"] in valid


def test_restrictions_may_force_generated(components):
    """При жёстких ограничениях каталог может не подойти — план всё равно строится."""
    plan, sources = components.recommend(
        _questionnaire(restrictions=[Restriction.KNEE, Restriction.BACK, Restriction.SHOULDER])
    )
    assert len(plan.workouts) >= 1
    assert all(s["source"] in ("catalog", "generated", "catalog_by_signature") for s in sources)


def test_frequency_seven_no_duplicate_catalog_ids(components):
    plan, sources = components.recommend(
        _questionnaire(frequency=7, level=Level.INTERMEDIATE, duration_preference=45)
    )
    catalog_ids = [w.id for w in plan.workouts if w.id > 0]
    assert len(catalog_ids) == len(set(catalog_ids))


def test_workout_matcher_hard_filter_level():
    catalog_loader = CatalogLoader()
    matcher = WorkoutMatcher(catalog_loader.catalog)
    from app.services.rule_engine import WorkoutSlot

    slot = WorkoutSlot(
        day_number=1,
        name="Test",
        target_muscle_groups=["legs"],
        exercise_count=5,
        sets=3,
        reps_range=(10, 12),
        duration_per_exercise=None,
        estimated_time=40,
    )
    q = _questionnaire(level=Level.BEGINNER)
    advanced_workout = next(w for w in catalog_loader.catalog.workouts if w["level"] == "advanced")
    result = matcher.match_workout(
        slot=slot,
        questionnaire=q,
        workout=advanced_workout,
        available_exercise_ids={int(ex["id"]) for ex in catalog_loader.catalog.exercises},
    )
    assert not result.passed
    assert result.fail_reason == "level"
