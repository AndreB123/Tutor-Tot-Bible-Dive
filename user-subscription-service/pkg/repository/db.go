package repository

import (
	"fmt"
	"user-microservice/pkg/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewDB(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.UserDBHost, cfg.UserDBUser, cfg.UserDBPassword, cfg.UserDBName, cfg.UserDBPort)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed ot connect database: %w", err)
	}
	return db, nil
}
