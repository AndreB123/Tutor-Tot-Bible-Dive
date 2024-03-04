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

func LoadConfig() *Config { //TODO change to unique values for chat db
	openAIKey, exists := os.LookupEnv("OPENAI_API_KEY")
	if !exists {
		log.Fatal("Missing API key for OpenAI")
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

	accessSecret, exists := os.LookupEnv("ACCESS_SECRET")
	if !exists {
		log.Fatal("Missing Env for ACCESS_SECRET")
	}

	return &Config{
		AccessSecret: accessSecret,
		OpenAIKey:    openAIKey,
		DBHost:       dbHost,
		DBUser:       dbUser,
		DBPassword:   dbPassword,
		DBName:       dbName,
		DBPort:       dbPort,
	}
}
