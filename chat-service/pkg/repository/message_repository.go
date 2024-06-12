package repository

import (
	"chat-service/pkg/model"
	"fmt"

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

func (repo *MessageRepository) UpdateMessageContent(messageID uint, content string) error {
	return repo.db.Model(&model.Message{}).Where("id = ?", messageID).Update("body", content).Error
}

func (repo *MessageRepository) FindMessagesByChatIDPaginated(chatID uint, lastMessageID uint, limit uint) ([]model.Message, error) {
	var messages []model.Message
	query := repo.db.Where("chat_id = ? AND id < ?", chatID, lastMessageID).Order("id DESC").Limit(int(limit))
	if lastMessageID == 0 {
		query = repo.db.Where("chat_id = ?", chatID).Order("id DESC").Limit(int(limit))
	}

	result := query.Find(&messages)
	if result.Error != nil {
		fmt.Printf("Repo: Error finding messages: %v\n", result.Error)
		return nil, result.Error
	}

	fmt.Printf("Repo: Found messages: %v\n", messages)
	return messages, nil
}

func (repo *MessageRepository) DeleteMessageByMessageID(messageID uint) error {
	return repo.db.Where("id = ?", messageID).Delete(&model.Message{}).Error
}
