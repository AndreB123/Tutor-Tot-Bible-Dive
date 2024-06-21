package repository

import (
	"chat-service/pkg/model"

	"gorm.io/gorm"
)

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

func (repo *ChatRepository) CreateNewChat(chat *model.Chat) error {
	return repo.db.Create(chat).Error
}

func (repo *ChatRepository) UpdateChat(chat *model.Chat) error {
	return repo.db.Save(chat).Error
}

func (repo *ChatRepository) FindChatByID(chatID uint) (*model.Chat, error) {
	var chat model.Chat
	result := repo.db.First(&chat, chatID)
	if result.Error != nil {
		return nil, result.Error
	}
	return &chat, nil
}

func (repo *ChatRepository) GetAllChatSummeryByUserID(userID uint) ([]model.ChatSummery, error) {
	var chats []model.ChatSummery
	results := repo.db.Model(&model.Chat{}).Select("id", "name").Where("user_id = ?", userID).Order("id DESC")

	if err := results.Find(&chats).Error; err != nil {
		return nil, err
	}
	return chats, nil
}

func (repo *ChatRepository) DeleteChatByID(chatID, userID uint) error {
	return repo.db.Where("id = ? AND user_id = ?", chatID, userID).Delete(&model.Chat{}).Error
}

func (repo *ChatRepository) DeleteAllChatsByUID(userID uint) error {
	return repo.db.Where("user_id = ?", userID).Delete(&model.Chat{}).Error
}
