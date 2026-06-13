package handlers

import (
	"FedFit/internal/models"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5"
)

func (handler *Handler) GetTrainingPlansHandler(w http.ResponseWriter, r *http.Request) {
	trainingPlans, err := handler.Repositories.TrainingPlan.GetCommonTrainingPlans(r.Context())

	if err != nil {
		log.Printf("Ошибка получения общих планов тренировок: %s", err.Error())
		http.Error(w, "Ошибка получения планов тренировок", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(trainingPlans); err != nil {
		http.Error(w, "Ошибка кодирования данных", http.StatusInternalServerError)
		return
	}
}

func (handler *Handler) GetPersonalTrainingPlansHandler(w http.ResponseWriter, r *http.Request) {
	userIDParam := r.PathValue("user_id")

	if userIDParam == "" {
		http.Error(w, "user_id не указан в запросе", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDParam)
	if err != nil {
		http.Error(w, "user_id не корректен", http.StatusBadRequest)
		return
	}

	trainingPlans, err := handler.Repositories.TrainingPlan.GetPersonalTrainingPlansByUserID(r.Context(), userID)
	if err != nil {
		log.Printf("Ошибка получения личных планов тренировок: %s", err.Error())
		http.Error(w, "Ошибка получения личных планов тренировок", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(trainingPlans); err != nil {
		http.Error(w, "Ошибка кодирования данных", http.StatusInternalServerError)
		return
	}
}

func (handler *Handler) GetTrainingPlanHandler(w http.ResponseWriter, r *http.Request) {
	workoutId := r.PathValue("id")

	if workoutId == "" {
		http.Error(w, "id плана тренировки не указан в запросе", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(workoutId)

	if err != nil {
		http.Error(w, "id не корректен", http.StatusInternalServerError)
		return
	}

	trainingPlan, err := handler.Repositories.TrainingPlan.GetTrainingPlan(r.Context(), id)

	if err != nil && errors.Is(err, pgx.ErrNoRows) {
		http.Error(w, "План тренировки не найден", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(trainingPlan); err != nil {
		http.Error(w, "Ошибка кодирования данных", http.StatusInternalServerError)
		return
	}
}

func (handler *Handler) CreateTrainingPlanHandler(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	defer r.Body.Close()

	var trainingPlan models.TrainingPlan

	if err := json.Unmarshal(body, &trainingPlan); err != nil {
		fmt.Println("Ошибка при разборе JSON: ", err)
	}

	if err := handler.Services.TrainingService.CreateTrainingPlan(r.Context(), &trainingPlan); err != nil {
		http.Error(w, "Ошибка создания плана тренировки", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	response := models.CreateTrainingPlanResponse{
		ID:      trainingPlan.ID,
		Message: "План тренировки успешно добавлен",
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Ошибка кодирования данных", http.StatusInternalServerError)
		return
	}
}
