"""
Pydantic-модели, описывающие структуру выходного JSON с планом тренировок.

Структура зеркалит бизнес-сущности БД приложения:
  WorkoutPlanResponse
    └── WorkoutResponse (список тренировок)
          └── WorkoutExerciseResponse (список упражнений с параметрами)

Такое соответствие упрощает сохранение плана на стороне основного бэкенда:
каждый объект ответа соответствует одной строке в таблице БД.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class WorkoutExerciseResponse(BaseModel):
    """
    Упражнение внутри тренировки с переопределёнными параметрами.
    Соответствует строке в таблице workout_exercises.
    """
    exercise_id: int = Field(..., description="ID упражнения из таблицы exercises")
    name: str = Field(..., description="Название упражнения")
    description: Optional[str] = Field(None, description="Описание техники выполнения")
    muscle_group: str = Field(..., description="Целевая группа мышц")
    order_index: int = Field(..., description="Порядковый номер упражнения в тренировке")

    # Параметры выполнения — могут быть переопределены относительно defaults из exercises
    sets: Optional[int] = Field(None, description="Количество подходов (null для кардио)")
    reps: Optional[int] = Field(None, description="Количество повторений (null для упражнений по времени)")
    duration: Optional[int] = Field(None, description="Длительность в секундах (null для упражнений по повторениям)")

    # Расчётная нагрузка (информационно, для отображения в UI)
    calories_per_set: Optional[float] = Field(None, description="Калорий за 1 подход/минуту")


class WorkoutResponse(BaseModel):
    """
    Одна тренировка в плане.
    Соответствует строке в таблице workouts.
    """
    name: str = Field(..., description="Название тренировки, например 'День 1: Грудь и трицепс'")
    description: Optional[str] = Field(None, description="Краткое описание тренировки")
    order_index: int = Field(..., description="Порядковый номер тренировки в плане")
    estimated_time: int = Field(..., description="Примерное время выполнения в минутах")
    exercises: List[WorkoutExerciseResponse] = Field(
        ...,
        description="Список упражнений в тренировке"
    )


class WorkoutPlanResponse(BaseModel):
    """
    Полный план тренировок — финальный ответ эндпоинта POST /recommend.
    Соответствует строке в таблице workout_plans + вложенные сущности.
    """
    name: str = Field(..., description="Название плана")
    description: str = Field(..., description="Описание плана и его особенностей")
    level: str = Field(..., description="Уровень сложности: beginner/intermediate/advanced")
    workouts: List[WorkoutResponse] = Field(
        ...,
        description="Список тренировок в плане (по одной на каждый день)"
    )

    # Мета-информация о плане (не хранится в БД, используется для UI)
    weekly_frequency: int = Field(..., description="Рекомендуемое количество тренировок в неделю")
    estimated_weekly_calories: Optional[float] = Field(
        None,
        description="Примерный расход калорий в неделю"
    )

    # Флаг источника рекомендации — для мониторинга и A/B тестирования
    recommendation_source: str = Field(
        default="hybrid",
        description="Источник рекомендации: 'hybrid' (rule+ml), 'rule_only', 'ml_only'"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "name": "План для похудения — Intermediate",
                "description": "3-дневный план с кардио и силовыми упражнениями",
                "level": "intermediate",
                "weekly_frequency": 3,
                "estimated_weekly_calories": 1200.0,
                "recommendation_source": "hybrid",
                "workouts": [
                    {
                        "name": "День 1: Кардио + Верх тела",
                        "description": "Сжигание жира через интервальные упражнения",
                        "order_index": 1,
                        "estimated_time": 45,
                        "exercises": [
                            {
                                "exercise_id": 1,
                                "name": "Прыжки на месте (Джампинг Джек)",
                                "description": "Прыжки с разведением рук и ног",
                                "muscle_group": "cardio",
                                "order_index": 1,
                                "sets": 3,
                                "reps": 30,
                                "duration": None,
                                "calories_per_set": 15.0
                            }
                        ]
                    }
                ]
            }
        }
