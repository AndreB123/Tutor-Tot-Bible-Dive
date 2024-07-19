package model

import "gorm.io/gorm"

type TopicPlan struct {
	gorm.Model
	Title     string   `json:"title"`
	UserID    uint     `json:"user_id"`
	Objective string   `json:"objective"`
	Standard  string   `json:"standard"`
	Lessons   []Lesson `gorm:"foreignKey:TopicPlanID" json:"lessons"`
	Completed bool     `json:"completed"`
}
