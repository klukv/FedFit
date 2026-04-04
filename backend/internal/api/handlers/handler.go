package handlers

import (
	"FedFit/internal/database/repositories"
	"FedFit/internal/services"
)

type Handler struct {
	Repositories *repositories.Repositories
	Services     *services.Services
}

func NewHandler(repos *repositories.Repositories, services *services.Services) *Handler {
	return &Handler{
		Repositories: repos,
		Services:     services,
	}
}
