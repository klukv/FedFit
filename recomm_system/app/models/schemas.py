"""
Pydantic-модели для входных и выходных данных эндпоинта POST /recommend.

Pydantic автоматически:
  - валидирует типы данных
  - проверяет допустимые значения через Enum и Field constraints
  - генерирует понятные сообщения об ошибках
  - формирует OpenAPI-документацию (доступна по /docs)
"""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

from app.models.enums import Goal, Level, Equipment, Restriction


# ──────────────────────────────────────────────
# ВХОДНАЯ МОДЕЛЬ (запрос от клиента)
# ──────────────────────────────────────────────

class UserQuestionnaire(BaseModel):
    """
    Анкета пользователя, заполняемая перед формированием плана.
    Все поля обязательны, кроме restrictions (может быть пустым списком).
    """

    goal: Goal = Field(
        ...,
        description="Цель тренировок",
        example="weight_loss"
    )

    level: Level = Field(
        ...,
        description="Уровень физической подготовки",
        example="intermediate"
    )

    equipment: List[Equipment] = Field(
        ...,
        description="Список доступного инвентаря. Укажите ['none'] если инвентаря нет.",
        min_length=1,
        example=["dumbbells", "pullup_bar"]
    )

    frequency: int = Field(
        ...,
        ge=1,
        le=7,
        description="Количество тренировок в неделю (от 1 до 7)",
        example=3
    )

    duration_preference: int = Field(
        ...,
        description="Предпочтительная длительность тренировки в минутах",
        example=45
    )

    restrictions: List[Restriction] = Field(
        default=[],
        description="Физические ограничения (травмы, болезни). Оставьте пустым если нет.",
        example=["knee"]
    )

    @field_validator("duration_preference")
    @classmethod
    def validate_duration(cls, v: int) -> int:
        """Допустимые значения длительности: 15, 30, 45, 60 минут."""
        allowed = {15, 30, 45, 60}
        if v not in allowed:
            raise ValueError(
                f"duration_preference должно быть одним из: {sorted(allowed)}. "
                f"Получено: {v}"
            )
        return v

    @field_validator("equipment")
    @classmethod
    def validate_equipment(cls, v: List[Equipment]) -> List[Equipment]:
        """
        Если указан 'none', убираем дубли — 'none' несовместим
        с конкретным инвентарём логически, но мы просто дедуплицируем.
        """
        return list(set(v))

    class Config:
        json_schema_extra = {
            "example": {
                "goal": "weight_loss",
                "level": "intermediate",
                "equipment": ["dumbbells", "pullup_bar"],
                "frequency": 3,
                "duration_preference": 45,
                "restrictions": ["knee"]
            }
        }
