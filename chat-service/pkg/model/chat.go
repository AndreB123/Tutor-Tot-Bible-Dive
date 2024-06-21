package model

import "gorm.io/gorm"

type Chat struct {
	gorm.Model
	ID       uint      `gorm:"primaryKey"`
	UserID   uint      `json:"user_id"`
	Name     string    `json:"name"`
	Messages []Message `gorm:"foreignKey:ChatID;constraint:OnDelete:CASCADE"`
}

type ChatSummery struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}
