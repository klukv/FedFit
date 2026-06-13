-- Заполнение таблицы упражнений (20 строк)
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
('Молотки', 'Сгибание рук с гантелями нейтральным хватом. Бицепс и предплечья.', NULL);

-- Метаданные упражнений для ML/rule engine (согласовано с recomm_system/app/data/exercises.json)
INSERT INTO exercise_metadata (exercise_id, muscle_group, equipment, restrictions_excluded, level, calories_per_set) VALUES
(1,  'legs',      '["none"]',                    '["knee"]',              '["beginner","intermediate","advanced"]', 12.0),
(2,  'chest',     '["none"]',                    '["shoulder"]',          '["beginner","intermediate","advanced"]', 8.0),
(3,  'core',      '["none"]',                    '["shoulder"]',          '["beginner","intermediate","advanced"]', 5.0),
(4,  'legs',      '["none"]',                    '["knee"]',              '["beginner","intermediate","advanced"]', 10.0),
(5,  'cardio',    '["none"]',                    '["knee","back","shoulder"]', '["intermediate","advanced"]',         20.0),
(6,  'legs',      '["none"]',                    '[]',                    '["beginner","intermediate","advanced"]', 4.0),
(7,  'core',      '["none"]',                    '["back"]',              '["beginner","intermediate","advanced"]', 6.0),
(8,  'core',      '["none"]',                    '[]',                    '["beginner","intermediate","advanced"]', 7.0),
(9,  'cardio',    '["none"]',                    '["knee"]',              '["beginner","intermediate","advanced"]', 14.0),
(10, 'cardio',    '["none"]',                    '["knee"]',              '["beginner","intermediate","advanced"]', 12.0),
(11, 'glutes',    '["none"]',                    '[]',                    '["beginner","intermediate","advanced"]', 8.0),
(12, 'back',      '["pullup_bar"]',              '["shoulder"]',          '["intermediate","advanced"]',            15.0),
(13, 'glutes',    '["none"]',                    '[]',                    '["beginner","intermediate","advanced"]', 7.0),
(14, 'core',      '["none"]',                    '["shoulder"]',          '["beginner","intermediate","advanced"]', 5.0),
(15, 'cardio',    '["none"]',                    '["knee"]',              '["beginner","intermediate","advanced"]', 13.0),
(16, 'core',      '["none"]',                    '["back"]',              '["beginner","intermediate","advanced"]', 6.0),
(17, 'chest',     '["dumbbells"]',               '["shoulder"]',          '["beginner","intermediate","advanced"]', 9.0),
(18, 'shoulders', '["dumbbells"]',               '["shoulder"]',          '["beginner","intermediate","advanced"]', 10.0),
(19, 'back',      '["dumbbells","barbell"]',     '["back"]',              '["intermediate","advanced"]',            11.0),
(20, 'arms',      '["dumbbells"]',               '[]',                    '["beginner","intermediate","advanced"]', 7.0);

-- Заполнение таблицы тренировок (5 строк)
INSERT INTO workout (name, value, description, image, level, calories_min, calories_max, duration, muscle_groups) VALUES
('Утренняя зарядка', 'morning-warmup', 'Короткая тренировка для пробуждения и разогрева мышц.', NULL, 'beginner', 80, 120, 15, '["chest","core","cardio"]'),
('Силовая на всё тело', 'full-body-strength', 'Базовые упражнения на основные группы мышц.', NULL, 'intermediate', 200, 350, 40, '["legs","chest","back","shoulders"]'),
('Кардио и пресс', 'cardio-core', 'Интенсивное кардио в сочетании с упражнениями на пресс.', NULL, 'intermediate', 250, 400, 35, '["cardio","core"]'),
('Ноги и ягодицы', 'legs-glutes', 'Фокус на нижнюю часть тела: приседы, выпады, мостик.', NULL, 'beginner', 180, 300, 30, '["legs","glutes","core"]'),
('Интервальная тренировка', 'hiit', 'Высокоинтенсивные интервалы: бурпи, альпинист, прыжки.', NULL, 'advanced', 300, 500, 25, '["cardio","core","full_body"]');

-- Таблица связей workout_exercise (тренировка ↔ упражнение)
-- Тренировка 1 (Утренняя зарядка): 4 упражнения
INSERT INTO workout_exercise (workout_id, exercise_id, sets, reps, duration) VALUES
(1, 2, 2, 10, NULL),   -- Отжимания
(1, 3, 2, NULL, 30),   -- Планка 30 сек
(1, 6, 2, 15, NULL),   -- Подъём на носки
(1, 10, 1, NULL, 60);  -- Бег на месте 1 мин

-- Тренировка 2 (Силовая на всё тело): 5 упражнений
INSERT INTO workout_exercise (workout_id, exercise_id, sets, reps, duration) VALUES
(2, 1, 3, 12, NULL),   -- Приседания
(2, 2, 3, 10, NULL),   -- Отжимания
(2, 12, 2, 8, NULL),   -- Подтягивания
(2, 17, 3, 12, NULL),  -- Разведение рук
(2, 19, 3, 10, NULL);  -- Тяга к поясу

-- Тренировка 3 (Кардио и пресс): 5 упражнений
INSERT INTO workout_exercise (workout_id, exercise_id, sets, reps, duration) VALUES
(3, 9, 2, NULL, 120),  -- Скакалка 2 мин
(3, 5, 3, 8, NULL),    -- Бурпи
(3, 7, 3, 15, NULL),   -- Скручивания
(3, 15, 3, NULL, 45),  -- Альпинист 45 сек
(3, 8, 3, 20, NULL);   -- Велосипед

-- Тренировка 4 (Ноги и ягодицы): 5 упражнений
INSERT INTO workout_exercise (workout_id, exercise_id, sets, reps, duration) VALUES
(4, 1, 4, 12, NULL),   -- Приседания
(4, 4, 3, 12, NULL),   -- Выпады
(4, 11, 3, 15, NULL),  -- Махи ногами
(4, 13, 3, 15, NULL),  -- Мостик ягодичный
(4, 14, 2, NULL, 30);  -- Боковая планка 30 сек

-- Тренировка 5 (Интервальная): 5 упражнений
INSERT INTO workout_exercise (workout_id, exercise_id, sets, reps, duration) VALUES
(5, 5, 4, 10, NULL),   -- Бурпи
(5, 15, 4, NULL, 40),  -- Альпинист
(5, 9, 3, NULL, 60),   -- Скакалка
(5, 3, 3, NULL, 45),   -- Планка
(5, 10, 2, NULL, 90);  -- Бег на месте

-- Планы тренировок (5 штук, user_id = NULL — общие планы для всех пользователей)
INSERT INTO training_plan (name, description, user_id, goal, target_level) VALUES
('Для начинающих', 'План для тех, кто только начинает. Лёгкие тренировки на всё тело и основы силы.', NULL, 'general_fitness', 'beginner'),
('Неделя силы', 'Фокус на силовых упражнениях и проработке основных мышечных групп.', NULL, 'muscle_gain', 'intermediate'),
('Кардио и кор', 'Сочетание кардио и упражнений на пресс. Подходит для сжигания калорий и укрепления кора.', NULL, 'weight_loss', 'intermediate'),
('Полный цикл', 'Недельный план: от утренней зарядки до HIIT. Разнообразие нагрузок.', NULL, 'endurance', 'intermediate'),
('Короткие тренировки', 'Планы на 15–25 минут для занятых. Зарядка и интервальные тренировки.', NULL, 'general_fitness', 'advanced');

-- Связь планов с тренировками (training_plan_workout)
-- План 1 (Для начинающих): тренировки 1, 4
INSERT INTO training_plan_workout (training_plan_id, workout_id) VALUES
(1, 1),
(1, 4);

-- План 2 (Неделя силы): тренировки 2, 4
INSERT INTO training_plan_workout (training_plan_id, workout_id) VALUES
(2, 2),
(2, 4);

-- План 3 (Кардио и кор): тренировки 1, 3, 5
INSERT INTO training_plan_workout (training_plan_id, workout_id) VALUES
(3, 1),
(3, 3),
(3, 5);

-- План 4 (Полный цикл): все 5 тренировок
INSERT INTO training_plan_workout (training_plan_id, workout_id) VALUES
(4, 1),
(4, 2),
(4, 3),
(4, 4),
(4, 5);

-- План 5 (Короткие тренировки): 1, 5
INSERT INTO training_plan_workout (training_plan_id, workout_id) VALUES
(5, 1),
(5, 5);

-- Тестовый пользователь (id = 1) для личных планов
INSERT INTO users (id, username, password) VALUES
(1, 'testuser', 'password')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', GREATEST((SELECT MAX(id) FROM users), 1));

-- Личные планы тренировок для пользователя id = 1
INSERT INTO training_plan (name, description, user_id) VALUES
('Мой план: сила и выносливость', 'Персональный план с акцентом на силовые упражнения и работу ног.', 1),
('Мой план: кардио-интенсив', 'Индивидуальный план для улучшения выносливости и сжигания калорий.', 1);

-- Связь личных планов с тренировками
INSERT INTO training_plan_workout (training_plan_id, workout_id)
SELECT tp.id, 2 FROM training_plan tp
WHERE tp.name = 'Мой план: сила и выносливость' AND tp.user_id = 1;

INSERT INTO training_plan_workout (training_plan_id, workout_id)
SELECT tp.id, 4 FROM training_plan tp
WHERE tp.name = 'Мой план: сила и выносливость' AND tp.user_id = 1;

INSERT INTO training_plan_workout (training_plan_id, workout_id)
SELECT tp.id, 3 FROM training_plan tp
WHERE tp.name = 'Мой план: кардио-интенсив' AND tp.user_id = 1;

INSERT INTO training_plan_workout (training_plan_id, workout_id)
SELECT tp.id, 5 FROM training_plan tp
WHERE tp.name = 'Мой план: кардио-интенсив' AND tp.user_id = 1;
