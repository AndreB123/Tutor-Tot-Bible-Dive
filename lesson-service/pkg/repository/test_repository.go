package repository

import (
	"lesson-service/pkg/model"

	"gorm.io/gorm"
)

type TestRepository struct {
	db *gorm.DB
}

func NewTestRepository(db *gorm.DB) *TestRepository {
	return &TestRepository{db: db}
}

func (repo *TestRepository) CreateNewTest(test *model.Test) error {
	return repo.db.Create(test).Error
}

func (repo *TestRepository) GetTestByTestID(testID uint) (*model.Test, error) {
	var test *model.Test

	result := repo.db.Model(&model.Test{}).Where("id = ?", testID)

	if err := result.Find(&test).Error; err != nil {
		return nil, err
	}

	return test, nil
}

func (repo *TestRepository) GetAllTestsByLessonID(lessonID uint) ([]*model.Test, error) {
	var tests []*model.Test

	result := repo.db.Model(&model.Test{}).Where("lesson_id = ?", lessonID)

	if err := result.Find(&tests).Error; err != nil {
		return nil, err
	}

	return tests, nil
}

func (repo *TestRepository) GetAllTestQuestionsByID(testID uint) (*model.Test, error) {
	var testQuestions *model.Test

	results := repo.db.Model(&model.Test{}).Select("title", "questions").Where("id = ?", testID)

	if err := results.Find(&testQuestions).Error; err != nil {
		return nil, err
	}

	return testQuestions, nil
}

func (repo *TestRepository) GetAllTestAnswersByID(testID uint) (*model.Test, error) {
	var testAnswers *model.Test

	results := repo.db.Model(&model.Test{}).Select("title", "answers").Where("id = ?", testID)

	if err := results.Find(&testAnswers).Error; err != nil {
		return nil, err
	}

	return testAnswers, nil
}

func (repo *TestRepository) UpdateTest(test *model.Test) (*model.Test, error) {
	return test, repo.db.Save(test).Error
}

func (repo *TestRepository) UpdateTestPassed(testID uint, passed bool) error {
	return repo.db.Model(&model.Test{}).Where("id = ?", testID).Update("passed", passed).Error
}
