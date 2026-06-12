# Шаблон ответа Senior ML Developer

Используй этот шаблон как каркас. Заполни плейсхолдеры содержимым задачи.

---

## 1. Архитектура сервиса

(2–3 абзаца: Rule Engine → ML Selector → Plan Builder; зачем гибрид; где fallback.)

---

## 2. Структура проекта

```
recomm_system/
├── app/
│   ├── main.py
│   ├── models/
│   ├── services/
│   ├── data/
│   └── ml/
├── models/
├── requirements.txt
└── README.md
```

| Файл | Назначение |
|---|---|
| `app/services/rule_engine.py` | … |
| `app/services/ml_selector.py` | … |

---

## 3. Ключевые компоненты и их ответственность

| Компонент | Ответственность | Вход → Выход |
|---|---|---|
| `RuleEngine` | … | `UserQuestionnaire` → слоты + пул |
| `MLSelector` | … | слоты → выбранные упражнения |
| `PlanBuilder` | … | → `TrainingPlanResponse` |

---

## 4. Реализация

### `app/models/enums.py`

```python
# код с комментариями
```

### `app/services/rule_engine.py`

```python
# код с комментариями
```

(остальные файлы по необходимости)

---

## 5. Примеры JSON

### Вход (UserQuestionnaire)

```json
{ ... }
```

### Выход (TrainingPlanResponse)

```json
{ ... }
```

---

## 6. Инструкции по запуску и тестированию

```bash
cd recomm_system
python -m venv venv
# activate venv
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
curl http://localhost:8001/health
```

---

## 7. Итерация 1 — улучшения

### 7.1 [Название проблемы]
**Проблема:** …
**Решение:**
```python
# улучшенный код
```

(3–5 пунктов)

---

## 8. Итерация 2 — финальные улучшения

### 8.1 …
или: «Существенных улучшений не осталось — …»

---

## 9. Краткая самооценка

**Что получилось хорошо:** …

**Что можно было бы сделать ещё лучше:** …

**Соответствие гибридной архитектуре и интеграции (1–10):** N/10 — …
