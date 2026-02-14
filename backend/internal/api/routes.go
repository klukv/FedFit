package api

import (
	"FedFit/internal/api/handlers"
	"FedFit/internal/database/repositories"
	"net/http"
)

func Routes(repos *repositories.Repositories) *http.ServeMux {
	mux := http.NewServeMux()

	handler := handlers.NewHandler(repos)

	mux.HandleFunc("GET /v1/training-plans", handler.GetTrainingPlansHandler)
	mux.HandleFunc("GET /v1/training-plans/{id}", handler.GetTrainingPlanHandler)
	mux.HandleFunc("POST /v1/training-plans", handler.CreateTrainingPlanHandler)

	mux.HandleFunc("GET /v1/workouts", handler.GetWorkoutsHandler)
	mux.HandleFunc("GET /v1/workouts/{id}", handler.GetWorkout)
	mux.HandleFunc("POST /v1/workouts", handler.CreateWorkoutsHandler)

	mux.HandleFunc("POST /v1/add-workout-to-tp/{training_plan_id}/{workout_id}", handler.AddWorkoutToTrainingPlan)

	return mux
}
