package database

import (
	"FedFit/configs"
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

var ctx = context.Background()

func ConnectToDB() {
	pool, err := pgxpool.New(ctx, configs.GetDriverInfo())

	if err != nil {
		log.Fatal("Не удалось подключиться к БД ", err)
	}

	if err := pool.Ping(ctx); err != nil {
		log.Fatal("Не удалось пропинговать БД ", err)
	}

	fmt.Println("Успешное соединение с БД")
}
