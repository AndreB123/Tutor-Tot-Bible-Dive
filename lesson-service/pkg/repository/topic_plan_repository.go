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

func (repo *TopicPlanRepository) UpdateTopicPlan(topicPlan *model.TopicPlan) (*model.TopicPlan, error) {
	return topicPlan, repo.db.Save(topicPlan).Error
}

func (repo *TopicPlanRepository) GetAllTopicPlansByUserID(id uint) ([]model.TopicPlan, error) {
	var topicPlans []model.TopicPlan

	results := repo.db.Model(&model.TopicPlan{}).Where("user_id = ?", id)

	err := results.Find(&topicPlans).Error
	if err != nil {
		return nil, err
	}

	return topicPlans, nil
}
