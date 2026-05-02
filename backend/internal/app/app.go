package app

import (
	"FedFit/internal/clients"
	"FedFit/internal/database"
	"FedFit/internal/database/repositories"
	"FedFit/internal/services"
	"context"
	"flag"
	"log"
	"os"
)

type config struct {
	Port int
	Env  string
}

type Application struct {
	Cfg          config
	Logger       *log.Logger
	Repositories *repositories.Repositories
	Services     *services.Services
}

func InitApp() *Application {
	var cfg config

	flag.IntVar(&cfg.Port, "port", 8000, "API server port")
	flag.StringVar(&cfg.Env, "env", "development", "Environment (development|staging|production)")
	flag.Parse()

	ctx := context.Background()

	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	// Подключение к БД
	pool, err := database.ConnectToDB(ctx)
	if err != nil {
		log.Fatal("Ошибка подключения к БД: ", err)
	}

	// Инициализация репозиториев
	repositories, err := repositories.InitRepositories(pool, ctx)
	if err != nil {
		log.Fatal("Ошибка инициализации БД: ", err)
	}

	clients := clients.InitClients("http://localhost:8000")

	services := services.InitServices(pool, repositories, clients)

	// Инициализация приложения
	app := &Application{
		Cfg:          cfg,
		Logger:       logger,
		Repositories: repositories,
		Services:     services,
	}

	return app
}
