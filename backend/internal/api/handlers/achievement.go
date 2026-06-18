package handlers

import (
	"FedFit/internal/utils"
	"encoding/json"
	"net/http"
	"strconv"
)

func (handler *Handler) GetUserAchievements(w http.ResponseWriter, r *http.Request) {
	userIDParam := r.PathValue("user_id")
	if userIDParam == "" {
		utils.ResErrorJson(w, "user_id не указан в запросе", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDParam)
	if err != nil {
		utils.ResErrorJson(w, "user_id не корректен", http.StatusBadRequest)
		return
	}

	achievements, err := handler.Services.AchievementService.GetUserAchievements(r.Context(), userID)
	if err != nil {
		utils.ResErrorJson(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(achievements); err != nil {
		utils.ResErrorJson(w, "Ошибка кодирования данных", http.StatusInternalServerError)
		return
	}
}
