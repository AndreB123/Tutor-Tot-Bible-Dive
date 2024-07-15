package service

import (
	"lesson-service/pkg/model"
	"lesson-service/pkg/repository"
)

type TopicPlanService struct {
	topicPlanRepo *repository.TopicPlanRepository
}

func NewTopicPlanService(topicPlanRepo *repository.TopicPlanRepository) *TopicPlanService {
	return &TopicPlanService{
		topicPlanRepo: topicPlanRepo,
	}
}

func (tp *TopicPlanService) CreateTopicPlan(topicPlan *model.TopicPlan) (*model.TopicPlan, error) {
	return topicPlan, tp.topicPlanRepo.CreateNewTopicPlan(topicPlan)
}
