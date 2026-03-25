"""
Перечисления (Enum) для всех категориальных полей анкеты пользователя.
Использование Enum вместо строк даёт:
  - автодополнение в IDE
  - явную документацию допустимых значений
  - валидацию на уровне типов (Pydantic использует их автоматически)
"""

from enum import Enum


class Goal(str, Enum):
    """Цель тренировок пользователя."""
    WEIGHT_LOSS = "weight_loss"          # Похудение / сжигание жира
    MUSCLE_GAIN = "muscle_gain"          # Набор мышечной массы
    ENDURANCE = "endurance"              # Развитие выносливости
    GENERAL_FITNESS = "general_fitness"  # Общая физическая форма


class Level(str, Enum):
    """Уровень физической подготовки."""
    BEGINNER = "beginner"           # Начинающий (до 6 месяцев опыта)
    INTERMEDIATE = "intermediate"   # Средний (6 месяцев – 2 года)
    ADVANCED = "advanced"           # Продвинутый (2+ лет)


class Equipment(str, Enum):
    """Доступный спортивный инвентарь."""
    NONE = "none"                   # Без инвентаря (только вес тела)
    DUMBBELLS = "dumbbells"         # Гантели
    BARBELL = "barbell"             # Штанга
    PULLUP_BAR = "pullup_bar"       # Турник
    KETTLEBELL = "kettlebell"       # Гиря


class Restriction(str, Enum):
    """Физические ограничения/травмы пользователя."""
    KNEE = "knee"           # Проблемы с коленями
    BACK = "back"           # Проблемы со спиной
    SHOULDER = "shoulder"   # Проблемы с плечами


class MuscleGroup(str, Enum):
    """Группы мышц — используются внутри сервиса для фильтрации упражнений."""
    CHEST = "chest"         # Грудь
    BACK = "back"           # Спина
    LEGS = "legs"           # Ноги
    SHOULDERS = "shoulders" # Плечи
    ARMS = "arms"           # Руки (бицепс/трицепс)
    CORE = "core"           # Пресс и кор
    CARDIO = "cardio"       # Кардио (не группа мышц, но категория упражнений)
    GLUTES = "glutes"       # Ягодицы
    FULL_BODY = "full_body" # Всё тело
