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
	mux.HandleFunc("POST /v1/training-plan", handler.CreateTrainingPlanHandler)

	mux.HandleFunc("GET /v1/workouts", handler.GetWorkoutsHandler)
	mux.HandleFunc("POST /v1/workout", handler.CreateWorkoutsHandler)
	mux.HandleFunc("GET /v1/workout/{workout_id}", handler.GetWorkout)

	mux.HandleFunc("POST /v1/add-workout-to-tp/{training_plan_id}/{workout_id}", handler.AddWorkoutToTrainingPlan)

	return mux
}
