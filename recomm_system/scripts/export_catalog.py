#!/usr/bin/env python3
"""
Экспорт каталога из Go-бэкенда в локальные JSON для recomm_system.

Использование:
  python scripts/export_catalog.py
  python scripts/export_catalog.py --url http://localhost:8000/v1/internal/catalog/export

После экспорта:
  1. POST http://localhost:8001/retrain — переобучить ML на каталоге
  2. Перезапустить recomm_system (или вызвать reload каталога при следующем старте)
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import httpx

# Добавляем корень recomm_system в PYTHONPATH при запуске как скрипта
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.services.catalog_convert import normalize_catalog_export  # noqa: E402

DATA_DIR = ROOT / "app" / "data"
DEFAULT_URL = "http://localhost:8000/v1/internal/catalog/export"


def export_catalog(backend_url: str, data_dir: Path) -> dict:
    """Загружает snapshot с бэкенда и записывает JSON-файлы."""
    print(f"Загрузка каталога: {backend_url}")
    response = httpx.get(backend_url, timeout=30.0)
    response.raise_for_status()
    raw_export = response.json()

    catalog = normalize_catalog_export(raw_export)

    data_dir.mkdir(parents=True, exist_ok=True)

    catalog_path = data_dir / "catalog.json"
    exercises_path = data_dir / "exercises.json"
    workouts_path = data_dir / "workouts.json"

    with open(catalog_path, "w", encoding="utf-8") as file:
        json.dump(catalog, file, ensure_ascii=False, indent=2)

    with open(exercises_path, "w", encoding="utf-8") as file:
        json.dump(catalog["exercises"], file, ensure_ascii=False, indent=2)

    with open(workouts_path, "w", encoding="utf-8") as file:
        json.dump(catalog["workouts"], file, ensure_ascii=False, indent=2)

    print(
        f"Сохранено: {len(catalog['exercises'])} упражнений, "
        f"{len(catalog['workouts'])} тренировок, "
        f"{len(catalog['training_plans'])} планов"
    )
    print(f"  → {catalog_path}")
    print(f"  → {exercises_path}")
    print(f"  → {workouts_path}")

    return catalog


def main() -> None:
    parser = argparse.ArgumentParser(description="Экспорт каталога FedFit для recomm_system")
    parser.add_argument(
        "--url",
        default=DEFAULT_URL,
        help=f"URL эндпоинта export (по умолчанию: {DEFAULT_URL})",
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DATA_DIR,
        help="Каталог для записи JSON",
    )
    args = parser.parse_args()

    try:
        export_catalog(args.url, args.data_dir)
    except httpx.HTTPError as exc:
        print(f"Ошибка HTTP: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
