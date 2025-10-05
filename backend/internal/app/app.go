package app

import (
	"FedFit/configs"
	"context"
	"log"

	"github.com/jackc/pgx/v5"
)

func InitApp() {
	conn, err := pgx.Connect(context.Background(), configs.GetDriverInfo())

	if err != nil {
		log.Fatal("Не удалось подключиться к БД ", err)
	}

	defer conn.Close(context.Background())
}
