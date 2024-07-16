package model

import "gorm.io/gorm"

type Test struct {
	gorm.Model
	ID            uint     `gorm:"primaryKey"`
	Title         string   `json:"title"`
	QuestionCount uint     `json:"question_count"`
	Questions     []string `json:"questions"`
	Answers       []string `json:"answers"`
	LessonID      uint     `gorm:"index" json:"lesson_id"`
	Passed        bool     `json:"passed"`
}
