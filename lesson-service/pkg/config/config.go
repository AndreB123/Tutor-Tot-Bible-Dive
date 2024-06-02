package config

import (
	"log"
	"os"
)

type Config struct {
	OpenAIKey    string
	DBHost       string
	DBUser       string
	DBPassword   string
	DBName       string
	DBPort       string
	AccessSecret string
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
	return &Config{
		AccessSecret: readSecretFile("ACCESS_SECRET"),
		OpenAIKey:    readSecretFile("OPENAI_API_KEY"),
		DBHost:       readSecretFile("CHAT_DB_HOST"),
		DBUser:       readSecretFile("CHAT_DB_USER"),
		DBPassword:   readSecretFile("CHAT_DB_PASSWORD"),
		DBName:       readSecretFile("CHAT_DB_NAME"),
		DBPort:       readSecretFile("CHAT_DB_PORT"),
	}
}
