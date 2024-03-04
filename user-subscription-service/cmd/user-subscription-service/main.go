package main

import (
	"log"
	"user-microservice/pkg/api"
	"user-microservice/pkg/config"
	"user-microservice/pkg/model"
	"user-microservice/pkg/repository"
	"user-microservice/pkg/service"
)

func main() {
	//Load Config
	cfg := config.LoadConfig()

	//Setup db connection
	db, err := repository.NewDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to db: %v", err)
	}

	//init repos, services and handlers
	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	authService := service.NewAuthService(cfg)
	handler := api.NewHandler(userService, authService)

	router := api.SetupRouter(handler)

	//migrate db
	if err := db.AutoMigrate(&model.User{}); err != nil {
		log.Fatalf("failed to auto-migrate: %v", err)
	}

	router.Run()
}
