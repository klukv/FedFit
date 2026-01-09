package database

import (
	"FedFit/configs"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func ConnectToDB(ctx context.Context) (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(ctx, configs.GetDriverInfo())

	if err != nil {
		return nil, fmt.Errorf("не удалось подключиться к БД: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("не удалось пропинговать БД: %w", err)
	}

	fmt.Println("Успешное соединение с БД")
	return pool, nil
}
