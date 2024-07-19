package model

import "gorm.io/gorm"

type Test struct {
	gorm.Model
	ID            uint       `gorm:"primaryKey"`
	Title         string     `json:"title"`
	QuestionCount uint       `json:"question_count"`
	Questions     []Question `json:"questions"`
	LessonID      uint       `gorm:"index" json:"lesson_id"`
	Passed        bool       `json:"passed"`
}
