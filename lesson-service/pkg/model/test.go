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
	QuestionText string       `json:"question_text"`
	Type         QuestionType `json:"type"`
	Options      []string     `json:"options,omitempty"`      // For multiple choice and match options
	Answer       string       `json:"answer,omitempty"`       // For short answer and fill-in-the-blank
	AnswerIndex  int          `json:"answer_index,omitempty"` // For multiple choice
	Matches      [][]string   `json:"matches,omitempty"`      // For match options
}

type Test struct {
	gorm.Model
	ID            uint       `gorm:"primaryKey"`
	Title         string     `json:"title"`
	QuestionCount uint       `json:"question_count"`
	Questions     []Question `json:"questions"`
	LessonID      uint       `gorm:"index" json:"lesson_id"`
	Passed        bool       `json:"passed"`
}
