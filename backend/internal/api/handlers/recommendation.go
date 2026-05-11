package handlers

import (
	"FedFit/internal/models"
	"bytes"
	"encoding/json"
	"log"
	"net/http"
)

func resErrorJson(w http.ResponseWriter, message string, status int) {
	w.WriteHeader(status)

	json.NewEncoder(w).Encode(map[string]any{
		"message": message,
		"code":    status,
	})
}

func (handler *Handler) GetRecommendationTrainingPlan(w http.ResponseWriter, r *http.Request) {
	var surveyResult models.SurveyResult

	if err := json.NewDecoder(r.Body).Decode(&surveyResult); err != nil {
		log.Printf("Некорректное тело запроса: %s", err.Error())

		resErrorJson(w, "Некорректное тело запроса", http.StatusBadRequest)
		return
	}

	trainingPlan, err := handler.Services.RecommendationService.GetRecommendationForUser(r.Context(), surveyResult)

	if err != nil {
		resErrorJson(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var buf bytes.Buffer

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(&buf).Encode(trainingPlan); err != nil {
		log.Printf("Ошибка сериализации итоговых данных в ответ запроса: %s", err.Error())

		w.WriteHeader(http.StatusInternalServerError)

		resErrorJson(w, "Ошибка сериализации итоговых данных в ответ запроса", http.StatusInternalServerError)
		return
	}

	buf.WriteTo(w)
}
