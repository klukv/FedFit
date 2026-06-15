"""
Загрузка и кэш каталога упражнений и тренировок.

Источники (по приоритету):
  1. app/data/catalog.json — полный snapshot после export_catalog.py
  2. app/data/exercises.json + workouts.json — legacy-формат без планов
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data"


@dataclass
class CatalogData:
    """In-memory snapshot каталога для inference и обучения."""

    exercises: List[Dict[str, Any]] = field(default_factory=list)
    workouts: List[Dict[str, Any]] = field(default_factory=list)
    training_plans: List[Dict[str, Any]] = field(default_factory=list)
    training_plan_workout_links: List[Dict[str, Any]] = field(default_factory=list)

    @property
    def exercises_by_id(self) -> Dict[int, Dict[str, Any]]:
        return {int(ex["id"]): ex for ex in self.exercises}

    @property
    def workouts_by_id(self) -> Dict[int, Dict[str, Any]]:
        return {int(w["id"]): w for w in self.workouts}

    def plans_for_workout(self, workout_id: int) -> List[Dict[str, Any]]:
        """Планы, в которые входит тренировка (для infer_goal)."""
        plan_ids = {
            link["training_plan_id"]
            for link in self.training_plan_workout_links
            if int(link["workout_id"]) == workout_id
        }
        return [p for p in self.training_plans if int(p["id"]) in plan_ids]


class CatalogLoader:
    """Загружает каталог из локальных JSON-файлов при старте сервиса."""

    def __init__(self, data_dir: Path | None = None) -> None:
        self.data_dir = data_dir or DATA_DIR
        self.catalog = self._load()

        logger.info(
            "CatalogLoader: %s упражнений, %s тренировок, %s планов",
            len(self.catalog.exercises),
            len(self.catalog.workouts),
            len(self.catalog.training_plans),
        )

    def _load(self) -> CatalogData:
        catalog_path = self.data_dir / "catalog.json"
        if catalog_path.exists():
            with open(catalog_path, "r", encoding="utf-8") as file:
                raw = json.load(file)
            return CatalogData(
                exercises=raw.get("exercises") or [],
                workouts=raw.get("workouts") or [],
                training_plans=raw.get("training_plans") or [],
                training_plan_workout_links=raw.get("training_plan_workout_links") or [],
            )

        exercises_path = self.data_dir / "exercises.json"
        workouts_path = self.data_dir / "workouts.json"

        exercises: List[Dict[str, Any]] = []
        workouts: List[Dict[str, Any]] = []

        if exercises_path.exists():
            with open(exercises_path, "r", encoding="utf-8") as file:
                exercises = json.load(file)

        if workouts_path.exists():
            with open(workouts_path, "r", encoding="utf-8") as file:
                workouts = json.load(file)

        logger.warning(
            "catalog.json не найден — используются exercises.json + workouts.json "
            "(training_plans недоступны для обучения на связях планов)"
        )
        return CatalogData(exercises=exercises, workouts=workouts)

    def reload(self) -> CatalogData:
        """Перечитывает каталог с диска (после export_catalog.py)."""
        self.catalog = self._load()
        return self.catalog
