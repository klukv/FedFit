-- FedFit: идемпотентное заполнение каталога (упражнения, тренировки, планы).
-- Повторный запуск безопасен — дубликаты не создаются, данные обновляются.
--
--   psql postgres://postgres:2002@localhost:5432/postgres -f backend/scripts/seed.sql
--
-- После seed:
--   python recomm_system/scripts/export_catalog.py
--   curl -X POST http://localhost:8001/retrain

BEGIN;

-- ── Дедупликация (после старых seed без upsert) ───────────────────────────────
-- Оставляем строку с минимальным id, переносим FK, удаляем лишнее.

-- exercise.name
WITH exercise_dup AS (
  SELECT id,
         MIN(id) OVER (PARTITION BY name) AS keep_id,
         ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) AS rn
  FROM exercise
)
UPDATE workout_exercise we
SET exercise_id = d.keep_id
FROM exercise_dup d
WHERE we.exercise_id = d.id AND d.rn > 1;

WITH exercise_dup AS (
  SELECT id,
         MIN(id) OVER (PARTITION BY name) AS keep_id,
         ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) AS rn
  FROM exercise
)
UPDATE workout_history_exercises whe
SET exercise_id = d.keep_id
FROM exercise_dup d
WHERE whe.exercise_id = d.id AND d.rn > 1;

DELETE FROM workout_exercise a
USING workout_exercise b
WHERE a.workout_id = b.workout_id
  AND a.exercise_id = b.exercise_id
  AND a.ctid > b.ctid;

WITH exercise_dup AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) AS rn
  FROM exercise
)
DELETE FROM exercise e
USING exercise_dup d
WHERE e.id = d.id AND d.rn > 1;

-- workout.value
WITH workout_dup AS (
  SELECT id,
         MIN(id) OVER (PARTITION BY value) AS keep_id,
         ROW_NUMBER() OVER (PARTITION BY value ORDER BY id) AS rn
  FROM workout
)
UPDATE workout_exercise we
SET workout_id = d.keep_id
FROM workout_dup d
WHERE we.workout_id = d.id AND d.rn > 1;

WITH workout_dup AS (
  SELECT id,
         MIN(id) OVER (PARTITION BY value) AS keep_id,
         ROW_NUMBER() OVER (PARTITION BY value ORDER BY id) AS rn
  FROM workout
)
UPDATE training_plan_workout tpw
SET workout_id = d.keep_id
FROM workout_dup d
WHERE tpw.workout_id = d.id AND d.rn > 1;

WITH workout_dup AS (
  SELECT id,
         MIN(id) OVER (PARTITION BY value) AS keep_id,
         ROW_NUMBER() OVER (PARTITION BY value ORDER BY id) AS rn
  FROM workout
)
DELETE FROM workout_history wh
USING workout_dup d
WHERE wh.workout_id = d.id
  AND d.rn > 1
  AND EXISTS (
    SELECT 1 FROM workout_history wh2
    WHERE wh2.user_id = wh.user_id AND wh2.workout_id = d.keep_id
  );

WITH workout_dup AS (
  SELECT id,
         MIN(id) OVER (PARTITION BY value) AS keep_id,
         ROW_NUMBER() OVER (PARTITION BY value ORDER BY id) AS rn
  FROM workout
)
UPDATE workout_history wh
SET workout_id = d.keep_id
FROM workout_dup d
WHERE wh.workout_id = d.id AND d.rn > 1;

DELETE FROM workout_exercise a
USING workout_exercise b
WHERE a.workout_id = b.workout_id
  AND a.exercise_id = b.exercise_id
  AND a.ctid > b.ctid;

DELETE FROM training_plan_workout a
USING training_plan_workout b
WHERE a.training_plan_id = b.training_plan_id
  AND a.workout_id = b.workout_id
  AND a.ctid > b.ctid;

WITH workout_dup AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY value ORDER BY id) AS rn
  FROM workout
)
DELETE FROM workout w
USING workout_dup d
WHERE w.id = d.id AND d.rn > 1;

-- training_plan: общие (user_id IS NULL) по name
WITH plan_dup AS (
  SELECT id,
         MIN(id) OVER (PARTITION BY name) AS keep_id,
         ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) AS rn
  FROM training_plan
  WHERE user_id IS NULL
)
UPDATE training_plan_workout tpw
SET training_plan_id = d.keep_id
FROM plan_dup d
WHERE tpw.training_plan_id = d.id AND d.rn > 1;

DELETE FROM training_plan_workout a
USING training_plan_workout b
WHERE a.training_plan_id = b.training_plan_id
  AND a.workout_id = b.workout_id
  AND a.ctid > b.ctid;

WITH plan_dup AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) AS rn
  FROM training_plan
  WHERE user_id IS NULL
)
DELETE FROM training_plan tp
USING plan_dup d
WHERE tp.id = d.id AND d.rn > 1;

-- training_plan: личные по (name, user_id)
WITH plan_dup AS (
  SELECT id,
         MIN(id) OVER (PARTITION BY name, user_id) AS keep_id,
         ROW_NUMBER() OVER (PARTITION BY name, user_id ORDER BY id) AS rn
  FROM training_plan
  WHERE user_id IS NOT NULL
)
UPDATE training_plan_workout tpw
SET training_plan_id = d.keep_id
FROM plan_dup d
WHERE tpw.training_plan_id = d.id AND d.rn > 1;

DELETE FROM training_plan_workout a
USING training_plan_workout b
WHERE a.training_plan_id = b.training_plan_id
  AND a.workout_id = b.workout_id
  AND a.ctid > b.ctid;

WITH plan_dup AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY name, user_id ORDER BY id) AS rn
  FROM training_plan
  WHERE user_id IS NOT NULL
)
DELETE FROM training_plan tp
USING plan_dup d
WHERE tp.id = d.id AND d.rn > 1;

-- ── Уникальные индексы для upsert ─────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS idx_exercise_name ON exercise (name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workout_value ON workout (value);
CREATE UNIQUE INDEX IF NOT EXISTS idx_training_plan_name_common
  ON training_plan (name) WHERE user_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_training_plan_name_user
  ON training_plan (name, user_id) WHERE user_id IS NOT NULL;

-- ── Упражнения (35) ───────────────────────────────────────────────────────────

INSERT INTO exercise (name, description, icon) VALUES
('Приседания', 'Классические приседания для проработки квадрицепсов и ягодиц. Спина прямая, колени не выходят за носки.', NULL),
('Отжимания', 'Упражнение на грудь и трицепс. Корпус в одну линию, опускание до касания грудью пола.', NULL),
('Планка', 'Удержание тела в статичном положении на предплечьях и носках. Укрепляет кор.', NULL),
('Выпады', 'Поочерёдные выпады вперёд. Работают бёдра и ягодицы.', NULL),
('Бурпи', 'Комплексное упражнение: присед, упор лёжа, отжимание, прыжок. Кардио и сила.', NULL),
('Подъём на носки', 'Стоя или в тренажёре. Проработка икроножных мышц.', NULL),
('Скручивания', 'Лёжа на спине, подъём корпуса к коленям. Мышцы пресса.', NULL),
('Велосипед', 'Лёжа, имитация езды на велосипеде ногами. Пресс и косые мышцы.', NULL),
('Прыжки со скакалкой', 'Кардио-упражнение. Развивает выносливость и координацию.', NULL),
('Бег на месте', 'Высокие подъёмы коленей на месте. Кардио и разогрев.', NULL),
('Махи ногами', 'Стоя или лёжа на боку. Проработка ягодиц и бёдер.', NULL),
('Подтягивания', 'Вис на перекладине, подъём подбородка выше грифа. Спина и бицепс.', NULL),
('Мостик ягодичный', 'Лёжа на спине, подъём таза вверх. Ягодицы и задняя поверхность бедра.', NULL),
('Боковая планка', 'Удержание на одной руке и ребре стопы. Косые мышцы и кор.', NULL),
('Альпинист', 'Упор лёжа, поочерёдное подтягивание коленей к груди. Пресс и кардио.', NULL),
('Подъём ног лёжа', 'Лёжа на спине, подъём прямых ног вверх. Нижний пресс.', NULL),
('Разведение рук с гантелями', 'Стоя или лёжа. Гантели в стороны. Средняя часть груди и плечи.', NULL),
('Жим гантелей стоя', 'Гантели от плеч вверх. Плечи и трицепс.', NULL),
('Тяга к поясу', 'Наклон, тяга рук к поясу (гантель или штанга). Спина.', NULL),
('Молотки', 'Сгибание рук с гантелями нейтральным хватом. Бицепс и предплечья.', NULL),
('Жим штанги лёжа', 'Базовое упражнение на грудь. Штанга опускается к груди и выжимается вверх.', NULL),
('Присед со штангой', 'Приседания со штангой на плечах. База для ног и ягодиц.', NULL),
('Становая тяга', 'Подъём штанги с пола. Спина, задняя поверхность бедра, кор.', NULL),
('Махи гирей', 'Свинг гирей между ног и до уровня груди. Кардио и всё тело.', NULL),
('Тяга гири к поясу', 'Наклон, тяга гири одной рукой. Средняя часть спины.', NULL),
('Выпады с гантелями', 'Выпады вперёд с гантелями в руках. Ноги и ягодицы.', NULL),
('Русский твист', 'Сидя, повороты корпуса с отягощением или без. Косые мышцы.', NULL),
('Прыжки на месте', 'Прыжки с мягкой посадкой. Разогрев и кардио.', NULL),
('Отжимания узким хватом', 'Узкая постановка рук. Акцент на трицепс и внутреннюю часть груди.', NULL),
('Подъём штанги на бицепс', 'Сгибание рук со штангой стоя. Бицепс.', NULL),
('Жим гантелей лёжа', 'Жим гантелей на скамье. Грудь и стабилизаторы.', NULL),
('Разгибания на трицепс', 'Разгибание рук с гантелью за головой или в наклоне. Трицепс.', NULL),
('Подтягивания обратным хватом', 'Хват снизу, акцент на бицепс и нижнюю часть широчайших.', NULL),
('Присед гоблет', 'Присед с гирей у груди. Ноги, кор, безопасная альтернатива приседу со штангой.', NULL),
('Планка с касанием плеча', 'Планка с поочерёдным касанием плеча. Кор и стабилизация.', NULL)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  updated_at = CURRENT_TIMESTAMP;

-- Метаданные для ML / rule engine
INSERT INTO exercise_metadata (exercise_id, muscle_group, equipment, restrictions_excluded, level, calories_per_set)
SELECT e.id, v.muscle_group, v.equipment::jsonb, v.restrictions_excluded::jsonb, v.level::jsonb, v.calories_per_set
FROM (VALUES
  ('Приседания',                  'legs',      '["none"]',                    '["knee"]',                   '["beginner","intermediate","advanced"]', 12.0),
  ('Отжимания',                   'chest',     '["none"]',                    '["shoulder"]',               '["beginner","intermediate","advanced"]',  8.0),
  ('Планка',                      'core',      '["none"]',                    '["shoulder"]',               '["beginner","intermediate","advanced"]',  5.0),
  ('Выпады',                      'legs',      '["none"]',                    '["knee"]',                   '["beginner","intermediate","advanced"]', 10.0),
  ('Бурпи',                       'cardio',    '["none"]',                    '["knee","back","shoulder"]', '["intermediate","advanced"]',            20.0),
  ('Подъём на носки',             'legs',      '["none"]',                    '[]',                         '["beginner","intermediate","advanced"]',  4.0),
  ('Скручивания',                 'core',      '["none"]',                    '["back"]',                   '["beginner","intermediate","advanced"]',  6.0),
  ('Велосипед',                   'core',      '["none"]',                    '[]',                         '["beginner","intermediate","advanced"]',  7.0),
  ('Прыжки со скакалкой',         'cardio',    '["none"]',                    '["knee"]',                   '["beginner","intermediate","advanced"]', 14.0),
  ('Бег на месте',                'cardio',    '["none"]',                    '["knee"]',                   '["beginner","intermediate","advanced"]', 12.0),
  ('Махи ногами',                 'glutes',    '["none"]',                    '[]',                         '["beginner","intermediate","advanced"]',  8.0),
  ('Подтягивания',                'back',      '["pullup_bar"]',              '["shoulder"]',               '["intermediate","advanced"]',            15.0),
  ('Мостик ягодичный',            'glutes',    '["none"]',                    '[]',                         '["beginner","intermediate","advanced"]',  7.0),
  ('Боковая планка',              'core',      '["none"]',                    '["shoulder"]',               '["beginner","intermediate","advanced"]',  5.0),
  ('Альпинист',                   'cardio',    '["none"]',                    '["knee"]',                   '["beginner","intermediate","advanced"]', 13.0),
  ('Подъём ног лёжа',             'core',      '["none"]',                    '["back"]',                   '["beginner","intermediate","advanced"]',  6.0),
  ('Разведение рук с гантелями',  'chest',     '["dumbbells"]',               '["shoulder"]',               '["beginner","intermediate","advanced"]',  9.0),
  ('Жим гантелей стоя',           'shoulders', '["dumbbells"]',               '["shoulder"]',               '["beginner","intermediate","advanced"]', 10.0),
  ('Тяга к поясу',                'back',      '["dumbbells","barbell"]',     '["back"]',                   '["intermediate","advanced"]',            11.0),
  ('Молотки',                     'arms',      '["dumbbells"]',               '[]',                         '["beginner","intermediate","advanced"]',  7.0),
  ('Жим штанги лёжа',             'chest',     '["barbell"]',                 '["shoulder","back"]',        '["intermediate","advanced"]',            14.0),
  ('Присед со штангой',           'legs',      '["barbell"]',                 '["knee","back"]',            '["intermediate","advanced"]',            16.0),
  ('Становая тяга',               'back',      '["barbell"]',                 '["back"]',                   '["advanced"]',                           18.0),
  ('Махи гирей',                  'full_body', '["kettlebell"]',              '["knee","back"]',            '["beginner","intermediate","advanced"]', 16.0),
  ('Тяга гири к поясу',           'back',      '["kettlebell"]',              '["back"]',                   '["beginner","intermediate","advanced"]', 11.0),
  ('Выпады с гантелями',          'legs',      '["dumbbells"]',               '["knee"]',                   '["beginner","intermediate","advanced"]', 11.0),
  ('Русский твист',               'core',      '["none"]',                    '["back"]',                   '["beginner","intermediate","advanced"]',  6.0),
  ('Прыжки на месте',             'cardio',    '["none"]',                    '["knee"]',                   '["beginner","intermediate","advanced"]', 10.0),
  ('Отжимания узким хватом',      'chest',     '["none"]',                    '["shoulder"]',               '["intermediate","advanced"]',             9.0),
  ('Подъём штанги на бицепс',     'arms',      '["barbell"]',                 '[]',                         '["beginner","intermediate","advanced"]',  8.0),
  ('Жим гантелей лёжа',           'chest',     '["dumbbells"]',               '["shoulder"]',               '["beginner","intermediate","advanced"]', 10.0),
  ('Разгибания на трицепс',       'arms',      '["dumbbells"]',               '["shoulder"]',               '["beginner","intermediate","advanced"]',  7.0),
  ('Подтягивания обратным хватом','back',      '["pullup_bar"]',              '["shoulder"]',               '["intermediate","advanced"]',            14.0),
  ('Присед гоблет',               'legs',      '["kettlebell"]',              '["knee"]',                   '["beginner","intermediate"]',            12.0),
  ('Планка с касанием плеча',     'core',      '["none"]',                    '["shoulder"]',               '["intermediate","advanced"]',             6.0)
) AS v(exercise_name, muscle_group, equipment, restrictions_excluded, level, calories_per_set)
JOIN exercise e ON e.name = v.exercise_name
ON CONFLICT (exercise_id) DO UPDATE SET
  muscle_group = EXCLUDED.muscle_group,
  equipment = EXCLUDED.equipment,
  restrictions_excluded = EXCLUDED.restrictions_excluded,
  level = EXCLUDED.level,
  calories_per_set = EXCLUDED.calories_per_set;

-- ── Тренировки (30) ───────────────────────────────────────────────────────────

INSERT INTO workout (name, value, description, image, level, calories_min, calories_max, duration, muscle_groups) VALUES
('Утренняя зарядка',           'morning-warmup',       'Короткая тренировка для пробуждения и разогрева мышц.', NULL, 'beginner',     80,  120, 15, '["chest","core","cardio"]'),
('Силовая на всё тело',        'full-body-strength',   'Базовые упражнения на основные группы мышц.', NULL, 'intermediate', 200, 350, 40, '["legs","chest","back","shoulders"]'),
('Кардио и пресс',             'cardio-core',          'Интенсивное кардио в сочетании с упражнениями на пресс.', NULL, 'intermediate', 250, 400, 35, '["cardio","core"]'),
('Ноги и ягодицы',             'legs-glutes',          'Фокус на нижнюю часть тела: приседы, выпады, мостик.', NULL, 'beginner', 180, 300, 30, '["legs","glutes","core"]'),
('Интервальная тренировка',    'hiit',                 'Высокоинтенсивные интервалы: бурпи, альпинист, прыжки.', NULL, 'advanced', 300, 500, 25, '["cardio","core","full_body"]'),
('Верх тела: гантели',         'upper-dumbbells',      'Грудь, плечи, руки с гантелями.', NULL, 'beginner',     120, 200, 30, '["chest","shoulders","arms"]'),
('Верх тела: штанга',          'upper-barbell',        'Базовые жимы и тяги со штангой.', NULL, 'intermediate', 220, 380, 45, '["chest","back","arms"]'),
('Ноги: штанга',               'legs-barbell',         'Присед и вспомогательные для ног.', NULL, 'intermediate', 250, 400, 40, '["legs","glutes"]'),
('Кардио 15 мин',              'cardio-15',            'Короткое кардио без инвентаря.', NULL, 'beginner',     100, 160, 15, '["cardio"]'),
('Кардио 45 мин',              'cardio-45',            'Длительное кардио и выносливость.', NULL, 'intermediate', 300, 480, 45, '["cardio","legs"]'),
('Кор и стабильность',         'core-stability',       'Планки, скручивания, русский твист.', NULL, 'beginner',   90, 150, 25, '["core"]'),
('Full body без инвентаря',    'full-body-none',       'Всё тело с весом собственного тела.', NULL, 'beginner',  150, 250, 35, '["full_body","core","legs"]'),
('Full body с гирей',          'full-body-kettlebell', 'Свинги, гоблет, тяги гирей.', NULL, 'intermediate',     200, 340, 35, '["full_body","legs","back"]'),
('Спина и бицепс',             'back-biceps',          'Подтягивания, тяги, бицепс.', NULL, 'intermediate',       180, 300, 40, '["back","arms"]'),
('Грудь и трицепс',            'chest-triceps',        'Жимы и разгибания на верх тела.', NULL, 'intermediate', 190, 320, 40, '["chest","arms"]'),
('Плечи и пресс',              'shoulders-core',       'Жимы над головой и кор.', NULL, 'beginner',           130, 220, 30, '["shoulders","core"]'),
('Ягодицы и ноги',             'glutes-legs-focus',    'Мостик, выпады, приседы.', NULL, 'beginner',          170, 280, 35, '["glutes","legs"]'),
('HIIT начинающий',            'hiit-beginner',        'Интервалы без сложных прыжков.', NULL, 'beginner',     140, 220, 20, '["cardio","core"]'),
('HIIT продвинутый',           'hiit-advanced',        'Бурпи, альпинист, интенсив.', NULL, 'advanced',         320, 520, 30, '["cardio","full_body"]'),
('Силовая: только турник',     'pullup-only',          'Подтягивания и вспомогательные.', NULL, 'intermediate', 160, 260, 30, '["back","arms"]'),
('Разминка 10 мин',            'warmup-10',            'Лёгкая разминка перед тренировкой.', NULL, 'beginner',  50,  80,  10, '["cardio","core"]'),
('Восстановительная',          'recovery-light',       'Низкая интенсивность, мобильность.', NULL, 'beginner', 60, 100, 20, '["core","legs"]'),
('Силовая продвинутая',        'strength-advanced',    'Становая, присед, жим — тяжёлая база.', NULL, 'advanced', 350, 550, 50, '["legs","back","chest"]'),
('Похудение: табата',          'weight-loss-tabata',   'Короткие интервалы высокой интенсивности.', NULL, 'intermediate', 280, 420, 25, '["cardio","full_body"]'),
('Выносливость: длинное кардио','endurance-long',      'Бег, скакалка, прыжки — 50 мин.', NULL, 'intermediate', 350, 500, 50, '["cardio","legs"]'),
('Набор массы: ноги',          'mass-legs',            'Тяжёлые ноги со штангой и гирей.', NULL, 'advanced',   300, 480, 45, '["legs","glutes"]'),
('Набор массы: верх',          'mass-upper',           'Жимы и тяги для гипертрофии.', NULL, 'advanced',        280, 450, 45, '["chest","back","shoulders"]'),
('Офисная зарядка',            'office-quick',         '15 минут без инвентаря за столом.', NULL, 'beginner',   70, 110, 15, '["core","cardio"]'),
('Короткий кор',               'core-short',           'Пресс за 20 минут.', NULL, 'intermediate',             100, 170, 20, '["core"]'),
('Смешанная 60 мин',           'mixed-60',             'Силовая + кардио полный час.', NULL, 'advanced',        400, 600, 60, '["full_body","cardio","legs"]')
ON CONFLICT (value) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  level = EXCLUDED.level,
  calories_min = EXCLUDED.calories_min,
  calories_max = EXCLUDED.calories_max,
  duration = EXCLUDED.duration,
  muscle_groups = EXCLUDED.muscle_groups,
  updated_at = CURRENT_TIMESTAMP;

-- ── Состав тренировок (workout_exercise) ──────────────────────────────────────
-- Ключи: workout.value + exercise.name

INSERT INTO workout_exercise (workout_id, exercise_id, sets, reps, duration)
SELECT w.id, e.id, v.sets, v.reps, v.duration
FROM (VALUES
  ('morning-warmup',       'Отжимания',                  2, 10,    NULL),
  ('morning-warmup',       'Планка',                     2, NULL,  30),
  ('morning-warmup',       'Подъём на носки',            2, 15,    NULL),
  ('morning-warmup',       'Бег на месте',               1, NULL,  60),
  ('full-body-strength',   'Приседания',                 3, 12,    NULL),
  ('full-body-strength',   'Отжимания',                  3, 10,    NULL),
  ('full-body-strength',   'Подтягивания',               2, 8,     NULL),
  ('full-body-strength',   'Разведение рук с гантелями', 3, 12,    NULL),
  ('full-body-strength',   'Тяга к поясу',               3, 10,    NULL),
  ('cardio-core',          'Прыжки со скакалкой',        2, NULL, 120),
  ('cardio-core',          'Бурпи',                      3, 8,     NULL),
  ('cardio-core',          'Скручивания',                3, 15,    NULL),
  ('cardio-core',          'Альпинист',                  3, NULL,  45),
  ('cardio-core',          'Велосипед',                  3, 20,    NULL),
  ('legs-glutes',          'Приседания',                 4, 12,    NULL),
  ('legs-glutes',          'Выпады',                     3, 12,    NULL),
  ('legs-glutes',          'Махи ногами',                3, 15,    NULL),
  ('legs-glutes',          'Мостик ягодичный',           3, 15,    NULL),
  ('legs-glutes',          'Боковая планка',             2, NULL,  30),
  ('hiit',                 'Бурпи',                      4, 10,    NULL),
  ('hiit',                 'Альпинист',                  4, NULL,  40),
  ('hiit',                 'Прыжки со скакалкой',        3, NULL,  60),
  ('hiit',                 'Планка',                     3, NULL,  45),
  ('hiit',                 'Бег на месте',               2, NULL,  90),
  ('upper-dumbbells',      'Разведение рук с гантелями', 3, 12,    NULL),
  ('upper-dumbbells',      'Жим гантелей стоя',          3, 10,    NULL),
  ('upper-dumbbells',      'Жим гантелей лёжа',          3, 10,    NULL),
  ('upper-dumbbells',      'Молотки',                    3, 12,    NULL),
  ('upper-dumbbells',      'Разгибания на трицепс',      3, 12,    NULL),
  ('upper-barbell',        'Жим штанги лёжа',            4, 8,     NULL),
  ('upper-barbell',        'Тяга к поясу',               3, 10,    NULL),
  ('upper-barbell',        'Подъём штанги на бицепс',    3, 10,    NULL),
  ('upper-barbell',        'Отжимания',                  3, 12,    NULL),
  ('upper-barbell',        'Подтягивания',               3, 8,     NULL),
  ('legs-barbell',         'Присед со штангой',          4, 8,     NULL),
  ('legs-barbell',         'Приседания',                 3, 12,    NULL),
  ('legs-barbell',         'Выпады',                     3, 10,    NULL),
  ('legs-barbell',         'Мостик ягодичный',           3, 15,    NULL),
  ('legs-barbell',         'Подъём на носки',            4, 15,    NULL),
  ('cardio-15',            'Бег на месте',               2, NULL, 120),
  ('cardio-15',            'Прыжки на месте',            3, NULL,  45),
  ('cardio-15',            'Прыжки со скакалкой',        1, NULL, 180),
  ('cardio-15',            'Планка',                     2, NULL,  30),
  ('cardio-15',            'Альпинист',                  2, NULL,  30),
  ('cardio-45',            'Прыжки со скакалкой',        3, NULL, 300),
  ('cardio-45',            'Бег на месте',               3, NULL, 180),
  ('cardio-45',            'Бурпи',                      3, 10,    NULL),
  ('cardio-45',            'Прыжки на месте',            4, NULL,  60),
  ('cardio-45',            'Альпинист',                  3, NULL,  45),
  ('core-stability',       'Планка',                     3, NULL,  45),
  ('core-stability',       'Боковая планка',             2, NULL,  30),
  ('core-stability',       'Скручивания',                3, 15,    NULL),
  ('core-stability',       'Русский твист',              3, 20,    NULL),
  ('core-stability',       'Планка с касанием плеча',    3, NULL,  40),
  ('full-body-none',       'Приседания',                 3, 15,    NULL),
  ('full-body-none',       'Отжимания',                  3, 12,    NULL),
  ('full-body-none',       'Выпады',                     3, 12,    NULL),
  ('full-body-none',       'Планка',                     2, NULL,  40),
  ('full-body-none',       'Мостик ягодичный',           3, 15,    NULL),
  ('full-body-kettlebell', 'Махи гирей',                 4, 15,    NULL),
  ('full-body-kettlebell', 'Присед гоблет',              3, 12,    NULL),
  ('full-body-kettlebell', 'Тяга гири к поясу',          3, 10,    NULL),
  ('full-body-kettlebell', 'Планка',                     2, NULL,  30),
  ('full-body-kettlebell', 'Махи ногами',                3, 15,    NULL),
  ('back-biceps',          'Подтягивания',               3, 8,     NULL),
  ('back-biceps',          'Подтягивания обратным хватом',3, 8,    NULL),
  ('back-biceps',          'Тяга к поясу',               3, 10,    NULL),
  ('back-biceps',          'Молотки',                    3, 12,    NULL),
  ('back-biceps',          'Подъём штанги на бицепс',    3, 10,    NULL),
  ('chest-triceps',        'Отжимания',                  3, 12,    NULL),
  ('chest-triceps',        'Отжимания узким хватом',     3, 10,    NULL),
  ('chest-triceps',        'Жим гантелей лёжа',          3, 10,    NULL),
  ('chest-triceps',        'Разгибания на трицепс',      3, 12,    NULL),
  ('chest-triceps',        'Разведение рук с гантелями', 3, 12,    NULL),
  ('shoulders-core',       'Жим гантелей стоя',          3, 10,    NULL),
  ('shoulders-core',       'Скручивания',                3, 15,    NULL),
  ('shoulders-core',       'Велосипед',                  3, 20,    NULL),
  ('shoulders-core',       'Планка',                     2, NULL,  30),
  ('shoulders-core',       'Боковая планка',             2, NULL,  25),
  ('glutes-legs-focus',    'Мостик ягодичный',           3, 15,    NULL),
  ('glutes-legs-focus',    'Выпады',                     3, 12,    NULL),
  ('glutes-legs-focus',    'Махи ногами',                3, 15,    NULL),
  ('glutes-legs-focus',    'Выпады с гантелями',         3, 10,    NULL),
  ('glutes-legs-focus',    'Приседания',                 3, 12,    NULL),
  ('hiit-beginner',        'Прыжки на месте',            3, NULL,  30),
  ('hiit-beginner',        'Бег на месте',               2, NULL,  60),
  ('hiit-beginner',        'Планка',                     2, NULL,  25),
  ('hiit-beginner',        'Скручивания',                2, 12,    NULL),
  ('hiit-beginner',        'Подъём на носки',            3, 15,    NULL),
  ('hiit-advanced',        'Бурпи',                      4, 12,    NULL),
  ('hiit-advanced',        'Альпинист',                  4, NULL,  45),
  ('hiit-advanced',        'Прыжки со скакалкой',        3, NULL,  90),
  ('hiit-advanced',        'Махи гирей',                 3, 20,    NULL),
  ('hiit-advanced',        'Планка с касанием плеча',    3, NULL,  40),
  ('pullup-only',          'Подтягивания',               4, 6,     NULL),
  ('pullup-only',          'Подтягивания обратным хватом',3, 8,    NULL),
  ('pullup-only',          'Отжимания',                  3, 15,    NULL),
  ('pullup-only',          'Планка',                     2, NULL,  40),
  ('pullup-only',          'Подъём ног лёжа',            3, 12,    NULL),
  ('warmup-10',            'Бег на месте',               1, NULL, 120),
  ('warmup-10',            'Подъём на носки',            2, 12,    NULL),
  ('warmup-10',            'Планка',                     1, NULL,  30),
  ('warmup-10',            'Махи ногами',                2, 10,    NULL),
  ('warmup-10',            'Велосипед',                  2, 15,    NULL),
  ('recovery-light',       'Планка',                     2, NULL,  30),
  ('recovery-light',       'Мостик ягодичный',           2, 12,    NULL),
  ('recovery-light',       'Подъём на носки',            2, 15,    NULL),
  ('recovery-light',       'Велосипед',                  2, 15,    NULL),
  ('recovery-light',       'Боковая планка',             2, NULL,  20),
  ('strength-advanced',    'Становая тяга',              4, 5,     NULL),
  ('strength-advanced',    'Присед со штангой',          4, 6,     NULL),
  ('strength-advanced',    'Жим штанги лёжа',            4, 6,     NULL),
  ('strength-advanced',    'Подтягивания',               3, 8,     NULL),
  ('strength-advanced',    'Бурпи',                      3, 8,     NULL),
  ('weight-loss-tabata',   'Бурпи',                      4, 8,     NULL),
  ('weight-loss-tabata',   'Альпинист',                  4, NULL,  30),
  ('weight-loss-tabata',   'Прыжки на месте',            4, NULL,  30),
  ('weight-loss-tabata',   'Прыжки со скакалкой',        2, NULL, 120),
  ('weight-loss-tabata',   'Скручивания',                3, 15,    NULL),
  ('endurance-long',       'Прыжки со скакалкой',        2, NULL, 600),
  ('endurance-long',       'Бег на месте',               2, NULL, 300),
  ('endurance-long',       'Прыжки на месте',            4, NULL,  60),
  ('endurance-long',       'Бурпи',                      2, 10,    NULL),
  ('endurance-long',       'Приседания',                 3, 20,    NULL),
  ('mass-legs',            'Присед со штангой',          5, 5,     NULL),
  ('mass-legs',            'Присед гоблет',              4, 10,    NULL),
  ('mass-legs',            'Выпады',                     4, 10,    NULL),
  ('mass-legs',            'Мостик ягодичный',           4, 12,    NULL),
  ('mass-legs',            'Подъём на носки',            4, 20,    NULL),
  ('mass-upper',           'Жим штанги лёжа',            4, 6,     NULL),
  ('mass-upper',           'Тяга к поясу',               4, 8,     NULL),
  ('mass-upper',           'Жим гантелей стоя',          4, 8,     NULL),
  ('mass-upper',           'Подтягивания',               4, 6,     NULL),
  ('mass-upper',           'Подъём штанги на бицепс',    3, 10,    NULL),
  ('office-quick',         'Планка',                     2, NULL,  30),
  ('office-quick',         'Подъём на носки',            2, 15,    NULL),
  ('office-quick',         'Отжимания',                  2, 8,     NULL),
  ('office-quick',         'Бег на месте',               1, NULL,  60),
  ('office-quick',         'Скручивания',                2, 12,    NULL),
  ('core-short',           'Скручивания',                3, 20,    NULL),
  ('core-short',           'Велосипед',                  3, 25,    NULL),
  ('core-short',           'Русский твист',              3, 20,    NULL),
  ('core-short',           'Подъём ног лёжа',            3, 12,    NULL),
  ('core-short',           'Планка с касанием плеча',    3, NULL,  35),
  ('mixed-60',             'Присед со штангой',          4, 8,     NULL),
  ('mixed-60',             'Жим штанги лёжа',            3, 8,     NULL),
  ('mixed-60',             'Прыжки со скакалкой',        2, NULL, 300),
  ('mixed-60',             'Бурпи',                      3, 10,    NULL),
  ('mixed-60',             'Планка',                     3, NULL,  45)
) AS v(workout_value, exercise_name, sets, reps, duration)
JOIN workout w ON w.value = v.workout_value
JOIN exercise e ON e.name = v.exercise_name
ON CONFLICT (workout_id, exercise_id) DO UPDATE SET
  sets = EXCLUDED.sets,
  reps = EXCLUDED.reps,
  duration = EXCLUDED.duration,
  updated_at = CURRENT_TIMESTAMP;

-- ── Общие планы (user_id IS NULL, с goal — для ML export) ─────────────────────

INSERT INTO training_plan (name, description, user_id, goal, target_level) VALUES
('Для начинающих', 'План для тех, кто только начинает. Лёгкие тренировки на всё тело и основы силы.', NULL, 'general_fitness', 'beginner'),
('Неделя силы', 'Фокус на силовых упражнениях и проработке основных мышечных групп.', NULL, 'muscle_gain', 'intermediate'),
('Кардио и кор', 'Сочетание кардио и упражнений на пресс. Подходит для сжигания калорий и укрепления кора.', NULL, 'weight_loss', 'intermediate'),
('Полный цикл', 'Недельный план: от утренней зарядки до HIIT. Разнообразие нагрузок.', NULL, 'endurance', 'intermediate'),
('Короткие тренировки', 'Планы на 15–25 минут для занятых. Зарядка и интервальные тренировки.', NULL, 'general_fitness', 'advanced'),
('Старт без инвентаря', 'Планы на вес тела для новичков.', NULL, 'general_fitness', 'beginner'),
('Гипертрофия', 'Набор массы: штанга, гантели, турник.', NULL, 'muscle_gain', 'advanced'),
('Жиросжигание интенсив', 'Короткие HIIT и табата для похудения.', NULL, 'weight_loss', 'intermediate'),
('Марафонская база', 'Длинное кардио и выносливость.', NULL, 'endurance', 'intermediate')
ON CONFLICT (name) WHERE user_id IS NULL DO UPDATE SET
  description = EXCLUDED.description,
  goal = EXCLUDED.goal,
  target_level = EXCLUDED.target_level,
  updated_at = CURRENT_TIMESTAMP;

-- Связи план ↔ тренировка (по имени плана и workout.value)

INSERT INTO training_plan_workout (training_plan_id, workout_id)
SELECT tp.id, w.id
FROM (VALUES
  ('Для начинающих',       'morning-warmup'),
  ('Для начинающих',       'legs-glutes'),
  ('Неделя силы',          'full-body-strength'),
  ('Неделя силы',          'legs-glutes'),
  ('Кардио и кор',         'morning-warmup'),
  ('Кардио и кор',         'cardio-core'),
  ('Кардио и кор',         'hiit'),
  ('Полный цикл',          'morning-warmup'),
  ('Полный цикл',          'full-body-strength'),
  ('Полный цикл',          'cardio-core'),
  ('Полный цикл',          'legs-glutes'),
  ('Полный цикл',          'hiit'),
  ('Короткие тренировки',  'morning-warmup'),
  ('Короткие тренировки',  'hiit'),
  ('Старт без инвентаря',  'full-body-none'),
  ('Старт без инвентаря',  'glutes-legs-focus'),
  ('Старт без инвентаря',  'warmup-10'),
  ('Старт без инвентаря',  'office-quick'),
  ('Гипертрофия',          'upper-barbell'),
  ('Гипертрофия',          'legs-barbell'),
  ('Гипертрофия',          'strength-advanced'),
  ('Гипертрофия',          'mass-legs'),
  ('Гипертрофия',          'mass-upper'),
  ('Жиросжигание интенсив','cardio-15'),
  ('Жиросжигание интенсив','hiit-beginner'),
  ('Жиросжигание интенсив','weight-loss-tabata'),
  ('Жиросжигание интенсив','cardio-core'),
  ('Жиросжигание интенсив','hiit'),
  ('Марафонская база',     'cardio-45'),
  ('Марафонская база',     'endurance-long'),
  ('Марафонская база',     'legs-glutes'),
  ('Марафонская база',     'mixed-60')
) AS v(plan_name, workout_value)
JOIN training_plan tp ON tp.name = v.plan_name AND tp.user_id IS NULL
JOIN workout w ON w.value = v.workout_value
ON CONFLICT (training_plan_id, workout_id) DO NOTHING;

-- ── Тестовый пользователь и личные планы ─────────────────────────────────────

INSERT INTO users (id, username, password) VALUES
(1, 'testuser', 'password')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO training_plan (name, description, user_id) VALUES
('Мой план: сила и выносливость', 'Персональный план с акцентом на силовые упражнения и работу ног.', 1),
('Мой план: кардио-интенсив', 'Индивидуальный план для улучшения выносливости и сжигания калорий.', 1)
ON CONFLICT (name, user_id) WHERE user_id IS NOT NULL DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO training_plan_workout (training_plan_id, workout_id)
SELECT tp.id, w.id
FROM (VALUES
  ('Мой план: сила и выносливость', 'full-body-strength'),
  ('Мой план: сила и выносливость', 'legs-glutes'),
  ('Мой план: кардио-интенсив',     'cardio-core'),
  ('Мой план: кардио-интенсив',     'hiit')
) AS v(plan_name, workout_value)
JOIN training_plan tp ON tp.name = v.plan_name AND tp.user_id = 1
JOIN workout w ON w.value = v.workout_value
ON CONFLICT (training_plan_id, workout_id) DO NOTHING;

-- ── Синхронизация sequences ───────────────────────────────────────────────────

SELECT setval('exercise_id_seq',        (SELECT COALESCE(MAX(id), 1) FROM exercise));
SELECT setval('workout_id_seq',         (SELECT COALESCE(MAX(id), 1) FROM workout));
SELECT setval('training_plan_id_seq',   (SELECT COALESCE(MAX(id), 1) FROM training_plan));
SELECT setval('users_id_seq',           GREATEST((SELECT COALESCE(MAX(id), 1) FROM users), 1));

COMMIT;
