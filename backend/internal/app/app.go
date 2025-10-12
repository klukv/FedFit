package app

import "FedFit/internal/database"

func InitApp() {
	database.ConnectToDB()
}
