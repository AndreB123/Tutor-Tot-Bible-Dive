package model

import "gorm.io/gorm"

type Lesson struct {
	gorm.Model
	ID          uint   `gorm:"primaryKey"`
	Title       string `json:"title"`
	TopicPlanID uint   `gorm:"index" json:"topic_plan_id"`
	Objective   string `json:"objective"`
	Information string `json:"information"`
	Tests       Test   `gorm:"foreignKey:LessonID" json:"tests"`
	Completed   bool   `json:"completed"`
}
