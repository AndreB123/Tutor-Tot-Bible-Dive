package repository

import (
	"lesson-service/pkg/model"

	"gorm.io/gorm"
)

type TestRespository struct {
	db *gorm.DB
}

func NewTestRespository(db *gorm.DB) *TestRespository {
	return &TestRespository{db: db}
}

func (repo *TestRespository) CreateNewTest(test *model.Test) error {
	return repo.db.Create(test).Error
}

func (repo *TestRespository) GetAllTestsByLessonID(lessonID uint) ([]model.Lesson, error) {
	var tests []model.Lesson

	result := repo.db.Model(&model.Test{}).Where("lesson_id = ?", lessonID)

	if err := result.Find(&tests).Error; err != nil {
		return nil, err
	}

	return tests, nil
}

func (repo *TestRespository) GetAllTestQuestionsByID(id uint) (*model.Test, error) {
	var testQuestions *model.Test

	results := repo.db.Model(&model.Test{}).Select("title", "questions").Where("id = ?", id)

	if err := results.Find(&testQuestions).Error; err != nil {
		return nil, err
	}

	return testQuestions, nil
}

func (repo *TestRespository) GetAllTestAnswersByID(id uint) (*model.Test, error) {
	var testAnswers *model.Test

	results := repo.db.Model(&model.Test{}).Select("title", "answers").Where("id = ?", id)

	if err := results.Find(&testAnswers).Error; err != nil {
		return nil, err
	}

	return testAnswers, nil
}
