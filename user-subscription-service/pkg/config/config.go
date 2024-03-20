package config

import (
	"log"
	"os"
)

type Config struct {
	AccessSecret   string
	RefreshSecret  string
	UserDBHost     string
	UserDBUser     string
	UserDBPassword string
	UserDBName     string
	UserDBPort     string
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
		AccessSecret:   readSecretFile("ACCESS_SECRET"),
		RefreshSecret:  readSecretFile("REFRESH_SECRET"),
		UserDBHost:     readSecretFile("USER_DB_HOST"),
		UserDBUser:     readSecretFile("USER_DB_USER"),
		UserDBPassword: readSecretFile("USER_DB_PASSWORD"),
		UserDBName:     readSecretFile("USER_DB_NAME"),
		UserDBPort:     readSecretFile("USER_DB_PORT"),
	}
}
