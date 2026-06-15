"""
Workout Matcher — экспертные правила для подбора готовой тренировки из каталога.

Hard filters (fail → тренировка не подходит):
  - level: user_level >= workout.level
  - equipment: все exercise_id workout доступны по инвентарю
  - restrictions: ни одно упражнение не противопоказано
  - duration: |workout.duration - slot.estimated_time| <= threshold

Expert scoring (pass + score):
  - goal ↔ muscle_groups workout
  - overlap slot.target_muscle_groups ∩ workout.muscle_groups
  - goal ↔ dominant muscle groups упражнений в составе
  - cardio_ratio: доля cardio-упражнений vs templates[goal].cardio_ratio
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

from app.models.schemas import UserQuestionnaire
from app.services.catalog_loader import CatalogData
from app.services.rule_engine import WorkoutSlot

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data"

LEVEL_RANK = {"beginner": 0, "intermediate": 1, "advanced": 2}

# Порог expert score для выбора каталожной тренировки
MIN_MATCH_SCORE = 12.0
DURATION_THRESHOLD_MIN = 20

GOAL_MUSCLE_AFFINITY: Dict[str, Dict[str, float]] = {
    "weight_loss": {
        "cardio": 1.0,
        "full_body": 0.9,
        "core": 0.8,
        "legs": 0.7,
        "glutes": 0.7,
        "chest": 0.4,
        "back": 0.4,
        "shoulders": 0.3,
        "arms": 0.3,
    },
    "muscle_gain": {
        "chest": 1.0,
        "back": 1.0,
        "legs": 1.0,
        "shoulders": 0.9,
        "arms": 0.8,
        "glutes": 0.7,
        "core": 0.5,
        "full_body": 0.6,
        "cardio": 0.2,
    },
    "endurance": {
        "cardio": 1.0,
        "legs": 0.9,
        "core": 0.8,
        "full_body": 0.9,
        "glutes": 0.6,
        "chest": 0.4,
        "back": 0.5,
        "shoulders": 0.3,
        "arms": 0.3,
    },
    "general_fitness": {
        "full_body": 1.0,
        "core": 0.9,
        "legs": 0.8,
        "chest": 0.7,
        "back": 0.7,
        "cardio": 0.8,
        "glutes": 0.7,
        "shoulders": 0.6,
        "arms": 0.5,
    },
}


@dataclass
class MatchResult:
    """Результат проверки одной тренировки каталога."""

    passed: bool
    score: float
    workout: Optional[Dict[str, Any]] = None
    fail_reason: Optional[str] = None


@dataclass
class SlotMatchResult:
    """Лучший результат для слота (или отсутствие подходящей тренировки)."""

    passed: bool
    score: float
    workout: Optional[Dict[str, Any]] = None
    source: str = "none"


class WorkoutMatcher:
    """Подбирает готовую тренировку из каталога по экспертным правилам."""

    def __init__(self, catalog: CatalogData, templates: Optional[Dict[str, Any]] = None) -> None:
        self.catalog = catalog
        self.templates = templates or self._load_templates()
        self.exercises_by_id = catalog.exercises_by_id

    def _load_templates(self) -> Dict[str, Any]:
        templates_path = DATA_DIR / "templates.json"
        with open(templates_path, "r", encoding="utf-8") as file:
            return json.load(file)

    def find_best(
        self,
        slot: WorkoutSlot,
        questionnaire: UserQuestionnaire,
        available_exercise_ids: Set[int],
        used_catalog_ids: Set[int],
    ) -> SlotMatchResult:
        """Ищет лучшую каталожную тренировку для слота."""
        best: Optional[Dict[str, Any]] = None
        best_score = -1.0

        for workout in self.catalog.workouts:
            workout_id = int(workout["id"])
            if workout_id in used_catalog_ids:
                continue

            result = self.match_workout(
                slot=slot,
                questionnaire=questionnaire,
                workout=workout,
                available_exercise_ids=available_exercise_ids,
            )

            if not result.passed:
                continue

            if result.score > best_score:
                best_score = result.score
                best = workout

        if best is not None and best_score >= MIN_MATCH_SCORE:
            return SlotMatchResult(
                passed=True,
                score=best_score,
                workout=best,
                source="catalog",
            )

        return SlotMatchResult(passed=False, score=best_score, source="none")

    def match_workout(
        self,
        slot: WorkoutSlot,
        questionnaire: UserQuestionnaire,
        workout: Dict[str, Any],
        available_exercise_ids: Set[int],
    ) -> MatchResult:
        """Проверяет одну тренировку: hard filters + expert score."""
        goal = questionnaire.goal.value
        user_level = questionnaire.level.value
        restrictions = {r.value for r in questionnaire.restrictions}

        # ── Hard: уровень ──
        user_rank = LEVEL_RANK.get(user_level, 0)
        workout_rank = LEVEL_RANK.get(str(workout["level"]), 0)
        if user_rank < workout_rank:
            return MatchResult(False, 0.0, fail_reason="level")

        # ── Hard: инвентарь и ограничения ──
        catalog_exercise_ids: Set[int] = set()
        for item in workout.get("exercises") or []:
            ex_id = int(item["exercise_id"])
            catalog_exercise_ids.add(ex_id)

            if ex_id not in available_exercise_ids:
                return MatchResult(False, 0.0, fail_reason="equipment")

            meta = self.exercises_by_id.get(ex_id)
            if meta is None:
                return MatchResult(False, 0.0, fail_reason="missing_exercise")

            excluded = set(meta.get("restrictions_excluded") or [])
            if restrictions & excluded:
                return MatchResult(False, 0.0, fail_reason="restrictions")

        if not catalog_exercise_ids:
            return MatchResult(False, 0.0, fail_reason="empty_workout")

        # ── Hard: длительность ──
        duration_diff = abs(int(workout["duration"]) - slot.estimated_time)
        if duration_diff > DURATION_THRESHOLD_MIN:
            return MatchResult(False, 0.0, fail_reason="duration")

        # ── Hard: пересечение целевых групп мышц ──
        target_groups = set(slot.target_muscle_groups)
        catalog_groups = set(workout.get("muscle_groups") or [])
        overlap_count = len(catalog_groups & target_groups)
        if overlap_count == 0 and "full_body" not in catalog_groups:
            return MatchResult(False, 0.0, fail_reason="muscle_groups")

        # ── Expert scoring ──
        score = self._expert_score(
            goal=goal,
            slot=slot,
            workout=workout,
            catalog_groups=catalog_groups,
            overlap_count=overlap_count,
            duration_diff=duration_diff,
        )

        return MatchResult(passed=True, score=score, workout=workout)

    def _expert_score(
        self,
        goal: str,
        slot: WorkoutSlot,
        workout: Dict[str, Any],
        catalog_groups: Set[str],
        overlap_count: int,
        duration_diff: int,
    ) -> float:
        """Суммарный expert score (чем выше — тем лучше соответствие слоту)."""
        affinity_map = GOAL_MUSCLE_AFFINITY.get(goal, GOAL_MUSCLE_AFFINITY["general_fitness"])

        # goal ↔ muscle_groups workout
        goal_group_score = 0.0
        for group in catalog_groups:
            goal_group_score += affinity_map.get(group, 0.3)
        if catalog_groups:
            goal_group_score /= len(catalog_groups)

        # overlap slot ∩ workout
        overlap_score = overlap_count * 2.5

        # dominant muscle groups упражнений в составе
        muscle_counts: Dict[str, int] = {}
        cardio_count = 0
        total_ex = 0
        for item in workout.get("exercises") or []:
            meta = self.exercises_by_id.get(int(item["exercise_id"]))
            if meta is None:
                continue
            total_ex += 1
            mg = meta.get("muscle_group", "full_body")
            muscle_counts[mg] = muscle_counts.get(mg, 0) + 1
            if mg == "cardio":
                cardio_count += 1

        dominant_score = 0.0
        if muscle_counts:
            dominant = max(muscle_counts, key=muscle_counts.get)
            dominant_score = affinity_map.get(dominant, 0.5) * 3.0

        # cardio_ratio vs template
        template = self.templates.get(goal, {})
        target_cardio_ratio = float(template.get("cardio_ratio", 0.25))
        actual_cardio_ratio = cardio_count / total_ex if total_ex else 0.0
        cardio_penalty = abs(actual_cardio_ratio - target_cardio_ratio)
        cardio_score = max(0.0, 2.0 - cardio_penalty * 5.0)

        # Штраф за отклонение длительности (мягкий, внутри hard threshold)
        duration_score = max(0.0, 2.0 - duration_diff * 0.1)

        return (
            goal_group_score * 4.0
            + overlap_score
            + dominant_score
            + cardio_score
            + duration_score
        )
