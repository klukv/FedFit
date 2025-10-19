package handlers

import "FedFit/internal/database/repositories"

type Handler struct {
	Repositories *repositories.Repositories
}

func NewHandler(repos *repositories.Repositories) *Handler {
	return &Handler{
		Repositories: repos,
	}
}
