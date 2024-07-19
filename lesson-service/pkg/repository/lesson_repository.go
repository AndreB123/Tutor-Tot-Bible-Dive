package repository

import (
	"lesson-service/pkg/model"

	"gorm.io/gorm"
)

type LessonRepository struct {
	db *gorm.DB
}

func NewLessonRepository(db *gorm.DB) *LessonRepository {
	return &LessonRepository{db: db}
}

func (repo *LessonRepository) CreateNewLesson(lesson *model.Lesson) error {
	return repo.db.Create(lesson).Error
}

func (repo *LessonRepository) FindLessonByID(lessonID uint) (*model.Lesson, error) {
	var lesson model.Lesson
	result := repo.db.First(&lesson, lessonID)

	if result.Error != nil {
		return nil, result.Error
	}
	return &lesson, nil
}

func (repo *LessonRepository) GetAllLessonsByTopicPlanID(topicPlanID uint) ([]*model.Lesson, error) {
	var lessons []*model.Lesson

	results := repo.db.Model(&model.Lesson{}).Select("id", "title").Where("topic_plan_id = ?", topicPlanID).Order("id DESC")

	if err := results.Find(&lessons).Error; err != nil {
		return nil, err
	}
	return lessons, nil
}

func (repo *LessonRepository) UpdateLesson(lesson *model.Lesson) (*model.Lesson, error) {
	return lesson, repo.db.Save(lesson).Error
}

func (repo *LessonRepository) UpdateLessonCompleted(lessonID uint, completed bool) error {
	return repo.db.Model(&model.Lesson{}).Where("id = ?", lessonID).Update("completed", completed).Error
}
