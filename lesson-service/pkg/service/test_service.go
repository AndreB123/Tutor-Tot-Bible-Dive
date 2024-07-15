package service

import (
	"errors"
	"lesson-service/pkg/model"
	"lesson-service/pkg/repository"
)

type TestService struct {
	testRepo *repository.TestRespository
}

func NewTestService(testRepo *repository.TestRespository) *TestService {
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

	if len(userAnswers.Answers) != len(test.Answers) {
		return 0, nil, errors.New("number of answers does not match number of questions")
	}

	score := 0
	feedback := make(map[int]string)

	for i, userAnswer := range userAnswers.Answers {
		if userAnswer == test.Answers[i] {
			score++
			feedback[i] = "Correct"
		} else {
			feedback[i] = "Incorrect. Correct answer: " + test.Answers[i]
		}
	}

	return score, feedback, nil
}
