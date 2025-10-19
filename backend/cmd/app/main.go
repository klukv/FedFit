package main

import (
	"FedFit/internal/api"
	"FedFit/internal/app"
	"fmt"
	"net/http"
)

func main() {
	app := app.InitApp()

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", app.Cfg.Port),
		Handler: api.Routes(app.Repositories),
	}

	app.Logger.Printf("starting %s server on %s", app.Cfg.Env, srv.Addr)
	err := srv.ListenAndServe()
	app.Logger.Fatal(err)
}
