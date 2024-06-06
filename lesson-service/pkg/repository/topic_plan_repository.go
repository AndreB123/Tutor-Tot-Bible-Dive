package repository

import (
	"lesson-service/pkg/model"

	"gorm.io/gorm"
)

type TopicPlanRepository struct {
	db *gorm.DB
}

func NewTopicPlanRepository(db *gorm.DB) *TopicPlanRepository {
	return &TopicPlanRepository{db: db}
}

func (repo *TopicPlanRepository) CreateNewTopicPlan(topicPlan *model.TopicPlan) error {
	return repo.db.Create(topicPlan).Error
}

func (repo *TopicPlanRepository) UpdateTopicPlan(topicPlan *model.TopicPlan) error {
	return repo.db.Save(topicPlan).Error
}
