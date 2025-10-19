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

	return mux
}
