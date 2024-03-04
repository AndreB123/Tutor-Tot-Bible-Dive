package model

import "gorm.io/gorm"

type Message struct {
	gorm.Model
	ID     uint   `gorm:"primaryKey"`
	UserID uint   `json:"user_id"`
	Sender string `json:"sender"`
	Body   string `json:"body"`
	ChatID uint   `gorm:"index" json:"chat_id"`
}
