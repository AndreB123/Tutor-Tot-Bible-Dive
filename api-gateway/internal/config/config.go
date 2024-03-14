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

func readSecretFile(secretName string) string {
	secretPath := "/run/secrets/" + secretName
	content, err := os.ReadFile(secretPath)
	if err != nil {
		log.Fatalf("Failed to read secret file %s, error: %v", secretPath, err)
	}
	return string(content)
}

func LoadConfig() *Config {
	userServiceURL := "http://user-subscription-service"
	/*TODO get the keys to enable Https and WSS via Certificate Authority, and add them to the config
	to reference them from the inits of the connection in main.go */

	chatServiceURL := "http://chat-service"

	return &Config{
		AccessSecret:   readSecretFile("access_secret"),
		RefreshSecret:  readSecretFile("refresh_secret"),
		UserServiceURL: userServiceURL,
		ChatServiceURL: chatServiceURL,
	}
}
