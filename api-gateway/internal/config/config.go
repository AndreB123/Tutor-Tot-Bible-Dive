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
	userServiceURL := "http://user-subscription-service:8080"
	chatServiceURL := "chat-service:8080"

	return &Config{
		AccessSecret:   readSecretFile("ACCESS_SECRET"),
		RefreshSecret:  readSecretFile("REFRESH_SECRET"),
		UserServiceURL: userServiceURL,
		ChatServiceURL: chatServiceURL,
	}
}
