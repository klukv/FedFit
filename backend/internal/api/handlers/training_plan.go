package handlers

import (
	"FedFit/internal/models"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func (handler *Handler) GetTrainingPlansHandler(w http.ResponseWriter, r *http.Request) {
	trainingPlans, err := handler.Repositories.TrainingPlan.GetAllTrainingPlans(r.Context())
	if err != nil {
		http.Error(w, "Ошибка получения планов тренировок", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(trainingPlans); err != nil {
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

	if err := handler.Repositories.TrainingPlan.CreateTrainingPlan(r.Context(), &trainingPlan); err != nil {
		http.Error(w, "Ошибка создания плана тренировки", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	message := map[string]string{"message": "План тренировки успешно добавлен"}

	if err := json.NewEncoder(w).Encode(message); err != nil {
		http.Error(w, "Ошибка кодирования данных", http.StatusInternalServerError)
		return
	}
}
