package service

import (
	"errors"
	"lesson-service/pkg/model"
	"lesson-service/pkg/repository"
	"strings"
)

type TestService struct {
	testRepo      *repository.TestRepository
	openAIService *OpenAIService
}

func NewTestService(testRepo *repository.TestRepository, openAIService *OpenAIService) *TestService {
	return &TestService{
		testRepo:      testRepo,
		openAIService: openAIService,
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

func (ts *TestService) GetAllTestsByLessonID(lessonID uint) ([]*model.Test, error) {
	test, err := ts.testRepo.GetAllTestsByLessonID(lessonID)
	if err != nil {
		return nil, err
	}

	return test, nil
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

func (ts *TestService) GradeTest(userAnswers model.UserAnswers) (int, map[int]string, bool, error) {
	test, err := ts.GetAllTestAnswersByID(userAnswers.TestID)
	if err != nil {
		return 0, nil, false, err
	}

	if len(userAnswers.Answers) != len(test.Questions) {
		return 0, nil, false, errors.New("number of answers does not match number of questions")
	}

	score := 0
	feedback := make(map[int]string)

	for i, userAnswer := range userAnswers.Answers {
		question := test.Questions[i]
		isCorrect, feedbackMsg, err := ts.gradeQuestion(question, userAnswer)
		if err != nil {
			return 0, nil, false, err
		}
		if isCorrect {
			score++
		}
		feedback[i] = feedbackMsg
	}

	passingScore := float64(len(test.Questions)) * 0.75
	passed := float64(score) >= passingScore

	err = ts.RecordTestResult(userAnswers.TestID, passed)
	if err != nil {
		return 0, nil, false, err
	}

	return score, feedback, passed, nil
}

func (ts *TestService) gradeQuestion(question model.Question, userAnswer string) (bool, string, error) {
	switch question.Type {
	case model.MultipleChoice:
		return gradeMultipleChoice(question, userAnswer)
	case model.FillInTheBlank:
		return gradeFillInTheBlank(question, userAnswer)
	case model.ShortAnswer:
		return ts.gradeShortAnswer(question, userAnswer)
	case model.MatchOptions:
		return ts.gradeMatchOptions(question, userAnswer)
	default:
		return false, "Unsupported question type", nil
	}
}

func gradeMultipleChoice(question model.Question, userAnswer string) (bool, string, error) {
	if userAnswer == question.Options[question.AnswerIndex] {
		return true, "Correct", nil
	}
	return false, "Incorrect. Correct answer: " + question.Options[question.AnswerIndex], nil
}

func gradeFillInTheBlank(question model.Question, userAnswer string) (bool, string, error) {
	if userAnswer == question.Answer {
		return true, "Correct", nil
	}
	return false, "Incorrect. Correct answer: " + question.Answer, nil
}

func (ts *TestService) gradeShortAnswer(question model.Question, userAnswer string) (bool, string, error) {
	isCorrect, result, err := ts.openAIService.GradeShortAnswer(userAnswer, question.Answer)
	if err != nil {
		return false, "Error grading short answer", err
	}
	if isCorrect {
		return true, "Correct", nil
	}
	return false, "Incorrect. OpenAI response: " + result, nil
}

func (ts *TestService) gradeMatchOptions(question model.Question, userAnswer string) (bool, string, error) {
	correctMatches := strings.Join(ts.FlattenMatches(question.Matches), ",")
	if userAnswer == correctMatches {
		return true, "Correct", nil
	}
	return false, "Incorrect. Correct answer: " + correctMatches, nil
}

func (ts *TestService) FlattenMatches(matches [][]string) []string {
	var flat []string
	for _, pair := range matches {
		flat = append(flat, strings.Join(pair, "-"))
	}
	return flat
}

func (ts *TestService) RecordTestResult(testID uint, passed bool) error {
	return ts.testRepo.UpdateTestPassed(testID, passed)
}
