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
		AccessSecret:   readSecretFile("access_secret"),
		RefreshSecret:  readSecretFile("refresh_secret"),
		UserDBHost:     readSecretFile("user_db_host"),
		UserDBUser:     readSecretFile("user_db_user"),
		UserDBPassword: readSecretFile("user_db_password"),
		UserDBName:     readSecretFile("user_db_name"),
		UserDBPort:     readSecretFile("user_db_port"),
	}
}
