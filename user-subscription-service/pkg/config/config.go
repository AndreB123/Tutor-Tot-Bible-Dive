package config

import (
	"log"
	"os"
)

type Config struct {
	AccessSecret  string
	RefreshSecret string
	DBHost        string
	DBUser        string
	DBPassword    string
	DBName        string
	DBPort        string
}

func LoadConfig() *Config {
	accessSecret, exists := os.LookupEnv("ACCESS_SECRET")
	if !exists {
		log.Fatal("Missing Env for ACCESS_SECRET")
	}

	refreshSecret, exists := os.LookupEnv("REFRESH_SECRET")
	if !exists {
		log.Fatal("Missing Env for REFRESH_SECRET")
	}

	dbHost, exists := os.LookupEnv("DB_HOST")
	if !exists {
		log.Fatal("Missing env for DB_HOST")
	}

	dbUser, exists := os.LookupEnv("DB_USER")
	if !exists {
		log.Fatal("Missing env for DB_USER")
	}

	dbPassword, exists := os.LookupEnv("DB_PASSWORD")
	if !exists {
		log.Fatal("Missing env for DB_PASSWORD")
	}

	dbName, exists := os.LookupEnv("DB_NAME")
	if !exists {
		log.Fatal("Missing env for DB_NAME")
	}

	dbPort, exists := os.LookupEnv("DB_PORT")
	if !exists {
		log.Fatal("Missing env for DB_PORT")
	}

	return &Config{
		AccessSecret:  accessSecret,
		RefreshSecret: refreshSecret,
		DBHost:        dbHost,
		DBUser:        dbUser,
		DBPassword:    dbPassword,
		DBName:        dbName,
		DBPort:        dbPort,
	}
}
