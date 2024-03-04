package config

import (
	"log"
	"os"
)

type Config struct {
	AccessSecret   string
	RefreshSecret  string
	UserServiceURL string
	ChatServiceURL string
}

func LoadConfig() *Config {
	accessSecret, exists := os.LookupEnv("ACCESS_SECRET")
	if !exists {
		log.Fatal("Missing env var: ACCESS_SECRET")
	}

	refreshSecret, exists := os.LookupEnv("REFRESH_SECRET")
	if !exists {
		log.Fatal("Missing env var: REFRESH_SECRET")
	}

	userServiceURL := "http://user-subscription-microservice"
	/*TODO get the keys to enable Https and WSS via Certificate Authority, and add them to the config
	to reference them from the inits of the connection in main.go */

	chatServiceURL := "http://chat-service"

	return &Config{
		AccessSecret:   accessSecret,
		RefreshSecret:  refreshSecret,
		UserServiceURL: userServiceURL,
		ChatServiceURL: chatServiceURL,
	}
}
