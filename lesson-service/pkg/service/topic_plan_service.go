package service

import (
	"fmt"
	"lesson-service/pkg/model"
	"lesson-service/pkg/repository"
)

type TopicPlanService struct {
	topicPlanRepo *repository.TopicPlanRepository
	lessonService *LessonService
}

func NewTopicPlanService(topicPlanRepo *repository.TopicPlanRepository, lessonService *LessonService) *TopicPlanService {
	return &TopicPlanService{
		topicPlanRepo: topicPlanRepo,
		lessonService: lessonService,
	}
}

func (tp *TopicPlanService) CreateTopicPlan(topicPlan *model.TopicPlan) (*model.TopicPlan, error) {
	return topicPlan, tp.topicPlanRepo.CreateNewTopicPlan(topicPlan)
}

func (tp *TopicPlanService) GetAllTopicPlansByUserID(userID uint) ([]*model.TopicPlan, error) {
	topicPlans, err := tp.topicPlanRepo.GetAllTopicPlansByUserID(userID)
	if err != nil {
		return nil, err
	}

	return topicPlans, nil
}

func (tp *TopicPlanService) GetTopicPlanByID(topicPlanID uint) (*model.TopicPlan, error) {
	topicPlan, err := tp.topicPlanRepo.GetTopicPlanByID(topicPlanID)
	if err != nil {
		return nil, err
	}

	fmt.Println("Topic plan returned: ", topicPlan.Lessons)
	return topicPlan, nil
}

func (tp *TopicPlanService) IsTopicPlanComplete(topicPlanID uint) (bool, error) {
	allComplete, err := tp.lessonService.AreAllLessonsCompleted(topicPlanID)
	if err != nil {
		return false, err
	}
	return allComplete, nil
}

func (tp *TopicPlanService) UpdateTopicPlanCompleted(topicPlanID uint, completed bool) error {
	return tp.topicPlanRepo.UpdateTopicPlanCompleted(topicPlanID, completed)
}
