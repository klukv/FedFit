"""
Rule-based компонент рекомендательной системы.

Отвечает за:
  1. Фильтрацию упражнений по доступному инвентарю и ограничениям здоровья
  2. Определение базовых параметров тренировки (сеты, повторения, количество упражнений)
  3. Формирование "задания" для ML-компонента — структурированного описания того,
     какие упражнения нужны и в каком количестве

Принцип работы: правила — это ЖЁСТКИЕ ограничения (безопасность, доступность),
ML — это ОПТИМИЗАЦИЯ внутри допустимого пространства.
"""

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.models.enums import Equipment, Goal, Level, MuscleGroup, Restriction
from app.models.schemas import UserQuestionnaire

logger = logging.getLogger(__name__)

# Путь к файлам данных относительно корня сервиса
DATA_DIR = Path(__file__).parent.parent / "data"


@dataclass
class WorkoutSlot:
    """
    Описание одной тренировки в плане — «слот» для ML-компонента.
    ML заполнит этот слот конкретными упражнениями из доступного пула.
    """
    day_number: int                          # Номер дня в плане
    name: str                                # Название тренировки
    target_muscle_groups: List[str]          # Целевые группы мышц
    exercise_count: int                      # Сколько упражнений нужно подобрать
    sets: int                                # Количество подходов для каждого упражнения
    reps_range: tuple                        # (min_reps, max_reps) или None если по времени
    duration_per_exercise: Optional[int]     # Секунды выполнения (для кардио)
    estimated_time: int                      # Ожидаемое время тренировки в минутах


@dataclass
class RuleEngineOutput:
    """
    Результат работы rule-based компонента.
    Передаётся в ML-компонент как «задание».
    """
    available_exercises: List[Dict[str, Any]]    # Пул упражнений после фильтрации
    workout_slots: List[WorkoutSlot]             # Структура плана (N тренировок)
    plan_name: str                               # Название плана
    plan_description: str                        # Описание плана
    goal_sets_range: tuple                       # (min, max) подходов для цели
    goal_reps_range: tuple                       # (min, max) повторений для цели
    level: str                                   # Уровень подготовки


class RuleEngine:
    """
    Движок правил для фильтрации и структурирования рекомендаций.

    Загружает упражнения и шаблоны при инициализации, затем применяет
    правила к анкете пользователя.
    """

    def __init__(self):
        self.exercises: List[Dict[str, Any]] = self._load_exercises()
        self.templates: Dict[str, Any] = self._load_templates()
        logger.info(f"RuleEngine: загружено {len(self.exercises)} упражнений")

    def _load_exercises(self) -> List[Dict[str, Any]]:
        """Загрузка базы упражнений из JSON-кэша."""
        exercises_path = DATA_DIR / "exercises.json"
        with open(exercises_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _load_templates(self) -> Dict[str, Any]:
        """Загрузка шаблонов планов для разных целей."""
        templates_path = DATA_DIR / "templates.json"
        with open(templates_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def apply(self, questionnaire: UserQuestionnaire) -> RuleEngineOutput:
        """
        Главный метод: применяет все правила к анкете пользователя.

        Порядок применения правил:
          1. Фильтрация по инвентарю
          2. Фильтрация по ограничениям здоровья
          3. Фильтрация по уровню подготовки
          4. Определение параметров тренировки (сеты, повторения)
          5. Построение слотов тренировок

        Returns:
            RuleEngineOutput — структурированное задание для ML-компонента
        """
        goal = questionnaire.goal.value
        level = questionnaire.level.value
        equipment = [e.value for e in questionnaire.equipment]
        restrictions = [r.value for r in questionnaire.restrictions]
        frequency = questionnaire.frequency
        duration = questionnaire.duration_preference

        # ── Шаг 1: Получаем шаблон для цели ──
        template = self.templates[goal]
        level_modifier = self.templates["level_modifiers"][level]

        # ── Шаг 2: Фильтруем упражнения ──
        filtered = self._filter_by_equipment(self.exercises, equipment)
        filtered = self._filter_by_restrictions(filtered, restrictions)
        filtered = self._filter_by_level(filtered, level)

        logger.info(
            f"После фильтрации: {len(filtered)} упражнений "
            f"(инвентарь: {equipment}, ограничения: {restrictions}, уровень: {level})"
        )

        # Если после фильтрации упражнений слишком мало — расширяем пул
        if len(filtered) < 8:
            logger.warning("Пул упражнений слишком мал, расширяем за счёт упражнений без инвентаря")
            no_equipment = self._filter_by_restrictions(
                self._filter_by_level(
                    [e for e in self.exercises if "none" in e["equipment"]],
                    level
                ),
                restrictions
            )
            # Добавляем только те, которых ещё нет в filtered
            existing_ids = {e["id"] for e in filtered}
            filtered += [e for e in no_equipment if e["id"] not in existing_ids]

        # ── Шаг 3: Вычисляем параметры тренировки ──
        base_sets_min = template["sets_range"]["min"]
        base_sets_max = template["sets_range"]["max"]
        base_reps_min = template["reps_range"]["min"]
        base_reps_max = template["reps_range"]["max"]

        # Применяем модификатор уровня к сетам
        sets = round(base_sets_min * level_modifier["sets_multiplier"])
        sets = max(2, min(sets, base_sets_max))  # Зажимаем в диапазон

        # Применяем модификатор к повторениям
        reps_min = round(base_reps_min * level_modifier["reps_multiplier"])
        reps_max = round(base_reps_max * level_modifier["reps_multiplier"])

        # ── Шаг 4: Строим слоты тренировок ──
        workout_slots = self._build_workout_slots(
            goal=goal,
            level=level,
            frequency=frequency,
            duration=duration,
            template=template,
            level_modifier=level_modifier,
            sets=sets,
            reps_min=reps_min,
            reps_max=reps_max,
        )

        # ── Шаг 5: Формируем название плана ──
        level_ru = {"beginner": "Начинающий", "intermediate": "Средний", "advanced": "Продвинутый"}
        plan_name = template["plan_name_template"].format(level=level_ru.get(level, level))

        return RuleEngineOutput(
            available_exercises=filtered,
            workout_slots=workout_slots,
            plan_name=plan_name,
            plan_description=template["plan_description"],
            goal_sets_range=(base_sets_min, base_sets_max),
            goal_reps_range=(base_reps_min, base_reps_max),
            level=level,
        )

    # ──────────────────────────────────────────────
    # ФИЛЬТРЫ (правила безопасности и доступности)
    # ──────────────────────────────────────────────

    def _filter_by_equipment(
        self, exercises: List[Dict], equipment: List[str]
    ) -> List[Dict]:
        """
        Оставляем только упражнения, для которых у пользователя есть инвентарь.

        Логика: упражнение подходит, если хотя бы ОДИН из его требуемых
        инвентарных элементов есть у пользователя. "none" означает инвентарь
        не нужен — такие упражнения доступны всегда.
        """
        result = []
        for ex in exercises:
            ex_equipment = ex.get("equipment", ["none"])
            # Упражнение без инвентаря — всегда доступно
            if "none" in ex_equipment:
                result.append(ex)
                continue
            # Проверяем пересечение требуемого и доступного инвентаря
            if any(e in equipment for e in ex_equipment):
                result.append(ex)
        return result

    def _filter_by_restrictions(
        self, exercises: List[Dict], restrictions: List[str]
    ) -> List[Dict]:
        """
        Исключаем упражнения, противопоказанные при имеющихся ограничениях здоровья.

        Это правило безопасности — оно не может быть обойдено ML-компонентом.
        Упражнение содержит поле restrictions_excluded: список ограничений,
        при которых оно противопоказано.
        """
        if not restrictions:
            return exercises

        result = []
        for ex in exercises:
            excluded_for = ex.get("restrictions_excluded", [])
            # Если у упражнения есть противопоказание, совпадающее с ограничениями пользователя
            if any(r in restrictions for r in excluded_for):
                continue
            result.append(ex)
        return result

    def _filter_by_level(
        self, exercises: List[Dict], level: str
    ) -> List[Dict]:
        """
        Оставляем упражнения, подходящие для уровня пользователя.

        Правило: начинающий не получает упражнения уровня advanced,
        продвинутый получает все уровни (включает упражнения своего и более низких уровней).
        """
        level_hierarchy = {"beginner": 0, "intermediate": 1, "advanced": 2}
        user_level_num = level_hierarchy.get(level, 0)

        result = []
        for ex in exercises:
            ex_levels = ex.get("level", ["beginner"])
            # Упражнение подходит, если оно рассчитано на уровень <= уровню пользователя
            ex_level_nums = [level_hierarchy.get(l, 0) for l in ex_levels]
            if any(l <= user_level_num for l in ex_level_nums):
                result.append(ex)
        return result

    # ──────────────────────────────────────────────
    # ПОСТРОЕНИЕ СЛОТОВ ТРЕНИРОВОК
    # ──────────────────────────────────────────────

    def _build_workout_slots(
        self,
        goal: str,
        level: str,
        frequency: int,
        duration: int,
        template: Dict,
        level_modifier: Dict,
        sets: int,
        reps_min: int,
        reps_max: int,
    ) -> List[WorkoutSlot]:
        """
        Строит список слотов тренировок согласно частоте и цели.

        Слоты описывают структуру плана без привязки к конкретным упражнениям.
        Каждый слот получит название и целевые группы мышц.
        """
        # Определяем количество упражнений на тренировку в зависимости от длительности
        exercises_by_duration = {
            15: level_modifier["min_exercises_per_workout"],
            30: level_modifier["min_exercises_per_workout"] + 1,
            45: round((level_modifier["min_exercises_per_workout"] + level_modifier["max_exercises_per_workout"]) / 2),
            60: level_modifier["max_exercises_per_workout"],
        }
        exercise_count = exercises_by_duration.get(duration, 5)

        # Приоритет групп мышц для цели
        muscle_priority = template["muscle_group_priority"]

        slots = []
        workout_names = self._get_workout_names(goal, frequency)

        for i in range(frequency):
            day_num = i + 1

            # Определяем целевые мышцы для этого дня
            # Циклически перебираем приоритетные группы
            target_groups = self._get_target_groups_for_day(
                goal=goal,
                day_num=day_num,
                frequency=frequency,
                muscle_priority=muscle_priority,
            )

            # Кардио-тренировки используют duration вместо reps
            is_cardio_day = "cardio" in target_groups and len(target_groups) <= 2

            slot = WorkoutSlot(
                day_number=day_num,
                name=workout_names[i],
                target_muscle_groups=target_groups,
                exercise_count=exercise_count,
                sets=sets,
                reps_range=(reps_min, reps_max) if not is_cardio_day else None,
                duration_per_exercise=30 if is_cardio_day else None,
                estimated_time=duration,
            )
            slots.append(slot)

        return slots

    def _get_workout_names(self, goal: str, frequency: int) -> List[str]:
        """Генерирует названия тренировок в зависимости от цели и частоты."""
        # Шаблоны названий для разных целей
        name_templates = {
            "weight_loss": [
                "День {n}: Кардио + Кор",
                "День {n}: Верх тела",
                "День {n}: Низ тела + Кардио",
                "День {n}: Всё тело",
                "День {n}: Кардио-интервалы",
                "День {n}: Сила + Кардио",
                "День {n}: Активное восстановление",
            ],
            "muscle_gain": [
                "День {n}: Грудь и Трицепс",
                "День {n}: Спина и Бицепс",
                "День {n}: Ноги",
                "День {n}: Плечи и Руки",
                "День {n}: Грудь",
                "День {n}: Спина",
                "День {n}: Восстановление",
            ],
            "endurance": [
                "День {n}: Кардио-основа",
                "День {n}: Нижняя + Выносливость",
                "День {n}: Интервалы",
                "День {n}: Функциональный кор",
                "День {n}: Длинное кардио",
                "День {n}: Верх + Выносливость",
                "День {n}: Лёгкое кардио",
            ],
            "general_fitness": [
                "День {n}: Всё тело",
                "День {n}: Верх тела",
                "День {n}: Низ тела",
                "День {n}: Кардио + Кор",
                "День {n}: Грудь и Спина",
                "День {n}: Ноги и Ягодицы",
                "День {n}: Восстановление",
            ],
        }

        templates = name_templates.get(goal, name_templates["general_fitness"])
        # Если дней больше, чем шаблонов — циклически повторяем
        return [templates[i % len(templates)].format(n=i+1) for i in range(frequency)]

    def _get_target_groups_for_day(
        self,
        goal: str,
        day_num: int,
        frequency: int,
        muscle_priority: List[str],
    ) -> List[str]:
        """
        Определяет целевые группы мышц для конкретного дня.

        Логика: для высокой частоты тренировок (4+) используется
        сплит-система. Для низкой (1-3) — преимущественно тренировки
        всего тела или верх/низ.
        """
        idx = (day_num - 1) % len(muscle_priority)

        if frequency <= 2:
            # Низкая частота: тренируем всё тело или основные группы
            return muscle_priority[:3]
        elif frequency == 3:
            # 3 дня: чередуем приоритетные группы
            base = muscle_priority[idx % len(muscle_priority)]
            next_group = muscle_priority[(idx + 1) % len(muscle_priority)]
            return [base, next_group, "core"]
        else:
            # 4+ дней: сплит по группам мышц
            base = muscle_priority[idx % len(muscle_priority)]
            # Добавляем вспомогательную группу
            secondary = muscle_priority[(idx + 2) % len(muscle_priority)]
            groups = [base, secondary]
            # Кор добавляем всегда кроме чисто кардио-дней
            if "cardio" not in groups:
                groups.append("core")
            return groups
