package repository

import (
	"chat-service/pkg/model"

	"gorm.io/gorm"
)

type MessageRepository struct {
	db *gorm.DB
}

func NewMessageRepository(db *gorm.DB) *MessageRepository {
	return &MessageRepository{db: db}
}

func (repo *MessageRepository) CreateNewMessage(message *model.Message) error {
	return repo.db.Create(message).Error
}

func (repo *MessageRepository) FindMessagesByChatIDPaginated(chatID uint, lastMessageID uint, limit int) ([]model.Message, error) {
	var messages []model.Message
	query := repo.db.Where("chat_id = ? AND id < ?", chatID, lastMessageID).Order("id DESC").Limit(limit)
	if lastMessageID == 0 {
		query = repo.db.Where("chat_id = ?", chatID).Order("id DESC").Limit(limit)
	}
	result := query.Find(&messages)
	if result.Error != nil {
		return nil, result.Error
	}

	return messages, nil
}
