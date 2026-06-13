package handlers

import (
	"FedFit/internal/models"
	"FedFit/internal/utils"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5"
)

func (handler *Handler) ExportCatalogHandler(w http.ResponseWriter, r *http.Request) {
	catalog, err := handler.Services.CatalogService.ExportCatalog(r.Context())
	if err != nil {
		log.Printf("Ошибка экспорта каталога: %s", err)
		utils.ResErrorJson(w, "Ошибка экспорта каталога", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(catalog); err != nil {
		log.Printf("Ошибка сериализации каталога: %s", err)
		utils.ResErrorJson(w, "Ошибка сериализации каталога", http.StatusInternalServerError)
	}
}

func (handler *Handler) GetExercisesHandler(w http.ResponseWriter, r *http.Request) {
	exercises, err := handler.Services.ExerciseService.GetAll(r.Context())
	if err != nil {
		log.Printf("Ошибка получения упражнений: %s", err)
		utils.ResErrorJson(w, "Ошибка получения упражнений", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(exercises)
}

func (handler *Handler) GetExerciseHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		utils.ResErrorJson(w, "Некорректный id упражнения", http.StatusBadRequest)
		return
	}

	exercise, err := handler.Services.ExerciseService.GetByID(r.Context(), id)
	if err != nil {
		log.Printf("Ошибка получения упражнения %d: %s", id, err)
		utils.ResErrorJson(w, "Ошибка получения упражнения", http.StatusInternalServerError)
		return
	}
	if exercise == nil {
		utils.ResErrorJson(w, "Упражнение не найдено", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(exercise)
}

func (handler *Handler) UpsertExerciseMetadataHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		utils.ResErrorJson(w, "Некорректный id упражнения", http.StatusBadRequest)
		return
	}

	var req models.ExerciseMetadataInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ResErrorJson(w, "Некорректное тело запроса", http.StatusBadRequest)
		return
	}

	if req.MuscleGroup == "" {
		utils.ResErrorJson(w, "Поле muscle_group обязательно", http.StatusBadRequest)
		return
	}
	if len(req.Equipment) == 0 {
		req.Equipment = json.RawMessage(`["none"]`)
	}
	if len(req.RestrictionsExcluded) == 0 {
		req.RestrictionsExcluded = json.RawMessage(`[]`)
	}
	if len(req.Level) == 0 {
		req.Level = json.RawMessage(`["beginner"]`)
	}
	if req.CaloriesPerSet == 0 {
		req.CaloriesPerSet = 10.0
	}

	if err := handler.Services.ExerciseService.UpsertMetadata(r.Context(), id, &req); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.ResErrorJson(w, "Упражнение не найдено", http.StatusNotFound)
			return
		}
		log.Printf("Ошибка сохранения метаданных упражнения %d: %s", id, err)
		utils.ResErrorJson(w, "Ошибка сохранения метаданных", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Метаданные сохранены"})
}

func (handler *Handler) DeleteExerciseMetadataHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		utils.ResErrorJson(w, "Некорректный id упражнения", http.StatusBadRequest)
		return
	}

	if err := handler.Services.ExerciseService.DeleteMetadata(r.Context(), id); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			utils.ResErrorJson(w, "Метаданные не найдены", http.StatusNotFound)
			return
		}
		log.Printf("Ошибка удаления метаданных упражнения %d: %s", id, err)
		utils.ResErrorJson(w, "Ошибка удаления метаданных", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
