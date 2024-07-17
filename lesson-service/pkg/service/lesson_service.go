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

func (l *LessonService) GetLessonByID(lessonID uint) (*model.Lesson, error) {
	lesson, err := l.lessonRepository.FindLessonByID(lessonID)
	if err != nil {
		return nil, err
	}
	return lesson, nil
}

func (l *LessonService) GetAllLessonsByTopicPlanID(topicID uint) ([]*model.Lesson, error) {
	lessons, err := l.lessonRepository.GetAllLessonsByTopicPlanID(topicID)
	if err != nil {
		return nil, err
	}
	return lessons, nil
}

func (l *LessonService) UpdateLesson(lesson *model.Lesson) (*model.Lesson, error) {
	return l.lessonRepository.UpdateLesson(lesson)
}

func (l *LessonService) LessonCompleted(lessonID uint, completed bool) error {
	return l.lessonRepository.UpdateLessonCompleted(lessonID, completed)
}

func (l *LessonService) AreAllLessonsCompleted(topicPlanID uint) (bool, error) {
	lessons, err := l.GetAllLessonsByTopicPlanID(topicPlanID)
	if err != nil {
		return false, err
	}

	for _, lesson := range lessons {
		if !lesson.Completed {
			return false, nil
		}
	}

	return true, nil
}
