package models

import "time"

type Workout struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Value     string    `json:"value"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
