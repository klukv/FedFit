package api

import (
	"FedFit/internal/api/handlers"
	"FedFit/internal/database/repositories"
	"FedFit/internal/services"
	"net/http"
)

func Routes(repos *repositories.Repositories, services *services.Services) *http.ServeMux {
	mux := http.NewServeMux()

	handler := handlers.NewHandler(repos, services)

	mux.HandleFunc("GET /v1/training-plans", handler.GetTrainingPlansHandler)
	mux.HandleFunc("GET /v1/training-plans/personal/{user_id}", handler.GetPersonalTrainingPlansHandler)
	mux.HandleFunc("GET /v1/training-plans/{id}", handler.GetTrainingPlanHandler)
	mux.HandleFunc("POST /v1/training-plans", handler.CreateTrainingPlanHandler)
	mux.HandleFunc("POST /v1/training-plans/recommendation", handler.GetRecommendationTrainingPlan)

	mux.HandleFunc("GET /v1/workouts", handler.GetWorkoutsHandler)
	mux.HandleFunc("GET /v1/workouts/{id}", handler.GetWorkout)
	mux.HandleFunc("GET /v1/workouts/history/{user_id}", handler.GetHistoryByUserId)
	mux.HandleFunc("POST /v1/workouts", handler.CreateWorkoutsHandler)
	mux.HandleFunc("POST /v1/workouts/history/{id}/{user_id}", handler.AddWorkoutToHistory)
	mux.HandleFunc("PUT /v1/workouts/history/{workout_history_id}", handler.UpdateWorkoutHistory)

	mux.HandleFunc("POST /v1/add-workout-to-tp/{training_plan_id}/{workout_id}", handler.AddWorkoutToTrainingPlan)

	mux.HandleFunc("GET /v1/users/{user_id}/achievements", handler.GetUserAchievements)

	mux.HandleFunc("GET /v1/internal/catalog/export", handler.ExportCatalogHandler)

	mux.HandleFunc("GET /v1/exercises", handler.GetExercisesHandler)
	mux.HandleFunc("GET /v1/exercises/{id}", handler.GetExerciseHandler)
	mux.HandleFunc("PUT /v1/exercises/{id}/metadata", handler.UpsertExerciseMetadataHandler)
	mux.HandleFunc("DELETE /v1/exercises/{id}/metadata", handler.DeleteExerciseMetadataHandler)

	return mux
}
