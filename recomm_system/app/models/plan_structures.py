"""
Модели ответа POST /recommend.

Корень: как план приложения — id, name, description, workouts, даты.

Каждый элемент workouts: тренировка с метаданными и массивом exercises
как []models.Exercise (см. backend/internal/models/workout.go): id, name, description,
icon, sets, reps, duration.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class WorkoutExerciseLink(BaseModel):
    """
    Элемент массива exercises — зеркало models.Exercise (workout.go).
    Поля sets/reps/duration совпадают с колонками workout_exercise для этой серии.
    """

    model_config = ConfigDict(extra="ignore", serialization_exclude_none=True)

    id: int = Field(..., description="Как в exercise.id")
    name: str = Field(..., description="Как в exercise.name")
    description: str = Field("", description="Как в exercise.description")
    icon: Optional[str] = Field(None, description="Как в exercise.icon, omitempty")
    sets: Optional[int] = Field(None, description="Подходы для этой тренировки")
    reps: Optional[int] = Field(None, description="Повторения, если не по времени")
    duration: Optional[int] = Field(
        None,
        description="Секунды на подход, если упражнение по времени",
    )


class WorkoutInPlan(BaseModel):
    """
    Тренировка внутри плана — по полям близко к models.WorkoutDetail
    (без обязательного exercisesCount: его можно вычислить как len(exercises)).
    """

    model_config = ConfigDict(
        extra="ignore",
        serialization_exclude_none=True,
        populate_by_name=True,
    )

    id: int = Field(
        0,
        description="0 — тренировка сгенерирована recomm_system; >0 — id из БД без изменений",
    )
    name: str
    description: Optional[str] = Field(None, description="Как WorkoutDetail.description")
    image: Optional[str] = Field(None, description="Как WorkoutDetail.image")
    level: str = Field(..., description="Как WorkoutDetail.level")
    calories_min: int = Field(..., alias="caloriesMin")
    calories_max: int = Field(..., alias="caloriesMax")
    duration: int = Field(
        ...,
        description="Минуты, как WorkoutDetail.duration в API",
    )
    exercises_count: int = Field(
        ...,
        alias="exercisesCount",
        description="Как WorkoutDetail.exercisesCount",
    )
    exercises: List[WorkoutExerciseLink]
    created_at: Optional[datetime] = Field(
        default=None,
        description="После сохранения на бэкенде",
    )
    updated_at: Optional[datetime] = None


class TrainingPlanResponse(BaseModel):
    """Тело ответа POST /recommend — план тренировок."""

    model_config = ConfigDict(
        extra="ignore",
        serialization_exclude_none=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": 0,
                "name": "План для похудения",
                "description": "Три тренировки в неделю",
                "workouts": [
                    {
                        "id": 0,
                        "name": "День 1: Кардио",
                        "description": "Кардио и кор.",
                        "level": "intermediate",
                        "caloriesMin": 100,
                        "caloriesMax": 120,
                        "duration": 45,
                        "exercisesCount": 1,
                        "exercises": [
                            {
                                "id": 1,
                                "name": "Прыжки",
                                "description": "",
                                "sets": 3,
                                "reps": 30,
                            }
                        ],
                    }
                ],
            }
        },
    )

    id: int = Field(0, description="0 до записи плана в БД")
    name: str
    description: str
    workouts: List[WorkoutInPlan]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
