package service

import (
	"lesson-service/pkg/model"
	"lesson-service/pkg/repository"
)

type LessonService struct {
	lessonRepository *repository.LessonRepository
}

func NewLessonService(lessonRepo *repository.LessonRepository) *LessonService {
	return &LessonService{
		lessonRepository: lessonRepo,
	}
}

func (l *LessonService) CreateLesson(lesson *model.Lesson) (*model.Lesson, error) {
	return lesson, l.lessonRepository.CreateNewLesson(lesson)
}

func (l *LessonService) GetAllLessonsByTopicPlanID(topicID uint) ([]*model.Lesson, error) {
	lessons, err := l.lessonRepository.GetAllLessonsByTopicPlanID(topicID)
	if err != nil {
		return nil, err
	}
	return lessons, nil
}
