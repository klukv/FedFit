package repositories

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UsersRepositry struct {
	pool *pgxpool.Pool
}

func NewUsersRepositry(pool *pgxpool.Pool) *UsersRepositry {
	return &UsersRepositry{pool: pool}
}

func (r *UsersRepositry) CreateUsersTable(ctx context.Context) error {
	if _, err := r.pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			username VARCHAR(50) NOT NULL,
			password VARCHAR NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`); err != nil {
		return fmt.Errorf("Создание таблицы пользователей провалено")
	}
	return nil
}
