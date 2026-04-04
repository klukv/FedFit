package handlers

import (
	"FedFit/internal/models"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func (handler *Handler) AddWorkoutToHistory(w http.ResponseWriter, r *http.Request) {
	userId := r.PathValue("user_id")
	workoutId := r.PathValue("id")
	body, err := io.ReadAll(r.Body)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	defer r.Body.Close()

	var workoutHistory models.WorkoutHistoryDTO

	if err := json.Unmarshal(body, &workoutHistory); err != nil {
		fmt.Println("Ошибка при разборе JSON: ", err)
	}

	if err := handler.Services.WorkoutHistoryService.AddWorkoutToHistory(
		r.Context(),
		userId,
		workoutId,
		&workoutHistory,
	); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": err.Error(),
			"code":    500,
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	message := map[string]string{"message": "Тренировку успешно добавлена в историю"}

	if err := json.NewEncoder(w).Encode(message); err != nil {
		http.Error(w, "Ошибка кодирования данных", http.StatusInternalServerError)
		return
	}
}
