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
		AccessSecret: readSecretFile("access_secret"),
		OpenAIKey:    readSecretFile("openai_api_secret"),
		DBHost:       readSecretFile("chat_db_host"),
		DBUser:       readSecretFile("chat_db_user"),
		DBPassword:   readSecretFile("chat_db_password"),
		DBName:       readSecretFile("chat_db_name"),
		DBPort:       readSecretFile("chat_db_port"),
	}
}
