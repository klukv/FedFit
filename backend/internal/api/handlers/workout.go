package handlers

import (
	"FedFit/internal/models"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func (handler *Handler) GetWorkoutsHandler(w http.ResponseWriter, r *http.Request) {
	workouts, err := handler.Repositories.Workout.GetAllWorkouts(r.Context())
	if err != nil {
		http.Error(w, "Ошибка получения списка тренировок", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(workouts); err != nil {
		http.Error(w, "Ошибка кодирования данных", http.StatusInternalServerError)
		return
	}
}

func (handler *Handler) CreateWorkoutsHandler(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	defer r.Body.Close()

	var workout models.Workout

	if err := json.Unmarshal(body, &workout); err != nil {
		fmt.Println("Ошибка при разборе JSON: ", err)
	}

	if err := handler.Repositories.Workout.CreateWorkout(r.Context(), &workout); err != nil {
		http.Error(w, "Ошибка создания тренировки", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	message := map[string]string{"message": "Тренировка успешно добавлен"}

	if err := json.NewEncoder(w).Encode(message); err != nil {
		http.Error(w, "Ошибка кодирования данных", http.StatusInternalServerError)
		return
	}
}

func (handler *Handler) AddWorkoutToTrainingPlan(w http.ResponseWriter, r *http.Request) {
	tpId := r.PathValue("training_plan_id")
	workoutId := r.PathValue("workout_id")

	if err := handler.Repositories.TpWorkout.CreateNewLinkTrainingPlanWorkout(r.Context(), tpId, workoutId); err != nil {
		http.Error(w, "Ошибка связывания плана тренировки и тренировки", http.StatusInternalServerError)
		return
	}
}
