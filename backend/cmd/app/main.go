package main

import (
	"FedFit/internal/api"
	"FedFit/internal/app"
	"FedFit/internal/middlewares"
	"fmt"
	"net/http"
)

func main() {
	app := app.InitApp()
	mux := api.Routes(app.Repositories, app.Services)

	allowed := map[string]struct{}{
		"http://localhost:3000": {},
	}

	handler := middlewares.CORS(allowed)(mux)

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", app.Cfg.Port),
		Handler: handler,
	}

	app.Logger.Printf("starting %s server on %s", app.Cfg.Env, srv.Addr)
	err := srv.ListenAndServe()
	app.Logger.Fatal(err)
}
