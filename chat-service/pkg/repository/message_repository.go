package repository

import (
	"chat-service/pkg/model"
	"sync"

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
	var wg sync.WaitGroup
	msgCh := make(chan []model.Message, 20)
	errCh := make(chan error, 1)

	fetchMessages := func(chatID, lastMessageID, limit uint) {
		defer wg.Done()
		var msgs []model.Message

		query := repo.db.Where("chat_id = ? AND id < ?", chatID, lastMessageID).Order("id DESC").Limit(int(limit))
		if lastMessageID == 0 {
			query = repo.db.Where("chat_id = ?", chatID).Order("id DESC").Limit(int(limit))
		}
		result := query.Find(&msgs)
		if result.Error != nil {
			errCh <- result.Error
			return
		}
		msgCh <- msgs
	}

	wg.Add(1)

	go fetchMessages(chatID, lastMessageID, limit)

	go func() {
		wg.Wait()
		close(msgCh)
		close(errCh)
	}()

	for {
		select {
		case msgs, ok := <-msgCh:
			if ok {
				messages = append(messages, msgs...)
			}
		case err, ok := <-errCh:
			if ok {
				return nil, err
			}
		default:
			if len(msgCh) == 0 && len(errCh) == 0 {
				return messages, nil
			}
		}
	}
}

func (repo *MessageRepository) DeleteMessageByMessageID(messageID uint) error {
	return repo.db.Where("id = ?", messageID).Delete(&model.Message{}).Error
}
