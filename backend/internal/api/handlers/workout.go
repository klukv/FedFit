package handlers

import (
	"FedFit/internal/models"
	"FedFit/internal/utils"
	"encoding/json"
	"io"
	"log"
	"net/http"
)

func (handler *Handler) GetWorkoutsHandler(w http.ResponseWriter, r *http.Request) {
	workouts, err := handler.Services.WorkoutService.GetWorkouts(r.Context())

	if err != nil {
		utils.ResErrorJson(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(workouts); err != nil {
		log.Printf("Ошибка кодирования данных: %s", err.Error())
		utils.ResErrorJson(w, "Ошибка кодирования данных", http.StatusBadRequest)
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
		log.Printf("Ошибка при разборе JSON: %s", err)
		utils.ResErrorJson(w, "Ошибка кодирования данных", http.StatusBadRequest)
	}

	if _, err := handler.Services.WorkoutService.CreateWorkout(r.Context(), &workout); err != nil {
		utils.ResErrorJson(w, "Ошибка создания тренировки", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	message := map[string]string{"message": "Тренировка успешно добавлена"}

	if err := json.NewEncoder(w).Encode(message); err != nil {
		utils.ResErrorJson(w, "Ошибка кодирования данных", http.StatusBadRequest)
		return
	}
}

func (handler *Handler) AddWorkoutToTrainingPlan(w http.ResponseWriter, r *http.Request) {
	tpId := r.PathValue("training_plan_id")
	workoutId := r.PathValue("workout_id")

	if err := handler.Services.WorkoutService.AddWorkoutToTrainingPlan(r.Context(), tpId, workoutId); err != nil {
		utils.ResErrorJson(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (handler *Handler) GetWorkout(w http.ResponseWriter, r *http.Request) {
	workoutId := r.PathValue("id")

	if workoutId == "" {
		http.Error(w, "id тренировки не указан в запросе", http.StatusBadRequest)
		return
	}

	workout, err := handler.Services.WorkoutService.GetWorkout(r.Context(), workoutId)

	if err != nil {
		utils.ResErrorJson(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if workout == nil {
		utils.ResErrorJson(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(workout); err != nil {
		log.Printf("Ошибка кодирования данных: %s", err)
		utils.ResErrorJson(w, "Ошибка кодирования данных", http.StatusBadRequest)
		return
	}
}
