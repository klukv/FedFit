package models

import "time"

type Workout_History struct {
	Started_at     time.Time
	Finished_at    time.Time
	Total_calories int
	Total_duration int
	Is_completed   bool
}
