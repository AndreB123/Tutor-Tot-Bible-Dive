package service

import "lesson-service/pkg/repository"

type TopicPlanService struct {
	topicPlanRepo *repository.TopicPlanRepository
}

func NewTopicPlanService(topicPlanRepo *repository.TopicPlanRepository) *TopicPlanService {
	return &TopicPlanService{
		topicPlanRepo: topicPlanRepo,
	}
}
