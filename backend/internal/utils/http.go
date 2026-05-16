package utils

import (
	"encoding/json"
	"net/http"
)

func ResErrorJson(w http.ResponseWriter, message string, status int) {
	w.WriteHeader(status)

	json.NewEncoder(w).Encode(map[string]any{
		"message": message,
		"code":    status,
	})
}
