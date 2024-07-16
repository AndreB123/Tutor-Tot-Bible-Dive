package service

import (
	"errors"
	"lesson-service/pkg/model"
	"lesson-service/pkg/repository"
	"strings"
)

type TestService struct {
	testRepo *repository.TestRepository
}

func NewTestService(testRepo *repository.TestRepository) *TestService {
	return &TestService{
		testRepo: testRepo,
	}
}

func (ts *TestService) CreateNewTest(test *model.Test) (*model.Test, error) {
	return test, ts.testRepo.CreateNewTest(test)
}

func (ts *TestService) GetTestByID(testID uint) (*model.Test, error) {
	test, err := ts.testRepo.GetTestByTestID(testID)
	if err != nil {
		return nil, err
	}

	return test, err
}

func (ts *TestService) GetAllTestAnswersByID(testID uint) (*model.Test, error) {
	testAnswers, err := ts.testRepo.GetAllTestAnswersByID(testID)
	if err != nil {
		return nil, err
	}

	return testAnswers, nil
}

func (ts *TestService) GetAllTestQuestionsByID(testID uint) (*model.Test, error) {
	testQuestions, err := ts.testRepo.GetAllTestQuestionsByID(testID)
	if err != nil {
		return nil, err
	}

	return testQuestions, nil
}

func (ts *TestService) GradeTest(userAnswers model.UserAnswers) (int, map[int]string, error) {
	test, err := ts.GetAllTestAnswersByID(userAnswers.TestID)
	if err != nil {
		return 0, nil, err
	}

	if len(userAnswers.Answers) != len(test.Questions) {
		return 0, nil, errors.New("number of answers does not match number of questions")
	}

	score := 0
	feedback := make(map[int]string)

	for i, userAnswer := range userAnswers.Answers {
		question := test.Questions[i]
		isCorrect, feedbackMsg := gradeQuestion(question, userAnswer)
		if isCorrect {
			score++
		}
		feedback[i] = feedbackMsg
	}

	passingScore := float64(len(test.Questions)) * 0.75
	passed := float64(score) >= passingScore

	err = ts.RecordTestResult(userAnswers.TestID, passed)
	if err != nil {
		return 0, nil, err
	}

	return score, feedback, nil
}

func gradeQuestion(question model.Question, userAnswer string) (bool, string) {
	switch question.Type {
	case model.MultipleChoice:
		return gradeMultipleChoice(question, userAnswer)
	case model.FillInTheBlank, model.ShortAnswer:
		return gradeFillInTheBlankOrShortAnswer(question, userAnswer)
	case model.MatchOptions:
		return gradeMatchOptions(question, userAnswer)
	default:
		return false, "Unsupported question type"
	}
}

func gradeMultipleChoice(question model.Question, userAnswer string) (bool, string) {
	if userAnswer == question.Options[question.AnswerIndex] {
		return true, "Correct"
	}
	return false, "Incorrect. Correct answer: " + question.Options[question.AnswerIndex]
}

func gradeFillInTheBlankOrShortAnswer(question model.Question, userAnswer string) (bool, string) {
	if userAnswer == question.Answer {
		return true, "Correct"
	}
	return false, "Incorrect. Correct answer: " + question.Answer
}

func gradeMatchOptions(question model.Question, userAnswer string) (bool, string) {
	correctMatches := strings.Join(flattenMatches(question.Matches), ",")
	if userAnswer == correctMatches {
		return true, "Correct"
	}
	return false, "Incorrect. Correct answer: " + correctMatches
}

func flattenMatches(matches [][]string) []string {
	var flat []string
	for _, pair := range matches {
		flat = append(flat, strings.Join(pair, "-"))
	}
	return flat
}

func (ts *TestService) RecordTestResult(testID uint, passed bool) error {
	return ts.testRepo.UpdateTestPassed(testID, passed)
}
