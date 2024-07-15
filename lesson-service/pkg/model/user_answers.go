package model

type UserAnswers struct {
	TestID  uint     `json:"test_id"`
	Answers []string `json:"answers"`
}
