package model

import "gorm.io/gorm"

type TopicPlan struct {
	gorm.Model
	ID        uint     `gorm:"primaryKey"`
	Title     string   `json:"title"`
	UserID    uint     `json:"user_id"`
	Objective string   `json:"objective"`
	Standard  string   `json:"standard"`
	Lessons   []Lesson `gorm:"foreignKey:LessonID" json:"lessons"`
}
