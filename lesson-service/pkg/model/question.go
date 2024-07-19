package model

import "gorm.io/gorm"

type QuestionType string

const (
	MultipleChoice QuestionType = "multiple_choice"
	FillInTheBlank QuestionType = "fill_in_the_blank"
	ShortAnswer    QuestionType = "short_answer"
	MatchOptions   QuestionType = "match_options"
)

type Question struct {
	gorm.Model
	ID           uint         `gorm:"primaryKey"`
	QuestionText string       `json:"question_text"`
	Type         QuestionType `json:"type"`
	Options      []string     `gorm:"type:text[]" json:"options,omitempty"`   // For multiple choice and match options
	Answer       string       `json:"answer,omitempty"`                       // For short answer and fill-in-the-blank
	AnswerIndex  int          `json:"answer_index,omitempty"`                 // For multiple choice
	Matches      [][]string   `gorm:"type:text[][]" json:"matches,omitempty"` // For match options
	TestID       uint         `gorm:"index"`
}
