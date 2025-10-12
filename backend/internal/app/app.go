package app

import (
	"FedFit/internal/database"
	"FedFit/internal/database/repositories"
	"context"
	"log"
)

func InitApp() {
	ctx := context.Background()

	pool, err := database.ConnectToDB(ctx)
	if err != nil {
		log.Fatal("Ошибка подключения к БД: ", err)
	}
	defer pool.Close()

	trainingPlanRepository := repositories.NewTrainingPlanRepository(pool)
	workoutRepository := repositories.NewWorkoutRepository(pool)

	if err := trainingPlanRepository.CreateTrainingPlanTable(ctx); err != nil {
		log.Fatal("Ошибка создания таблицы планов тренировок: ", err)
	}

	if err := workoutRepository.CreateWorkoutTable(ctx); err != nil {
		log.Fatal("Ошибка создания таблицы тренировок: ", err)
	}
}
