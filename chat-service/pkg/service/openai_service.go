package service

import (
	"chat-service/pkg/config"
	"context"
	"errors"
	"fmt"
	"io"
	"strings"

	openai "github.com/sashabaranov/go-openai"
)

type OpenAIService struct {
	Config         *config.Config
	client         *openai.Client
	messageService *MessageService
}

func NewOpenAIService(cfg *config.Config, msgService *MessageService) *OpenAIService {
	apiKey := strings.TrimSpace(cfg.OpenAIKey)

	if apiKey == "" {
		fmt.Println("Error: API key is empty")
		return nil
	}

	client := openai.NewClient(apiKey)
	return &OpenAIService{
		client:         client,
		messageService: msgService,
	}

}

func (s *OpenAIService) SendMessageToOpenAI(ctx context.Context, chatID uint, prompt string, userID uint, onMessage func(string, uint) error) error {
	openAIMessages, err := s.getFormattedChatHistory(chatID, prompt)
	if err != nil {
		return err
	}
	return s.streamChatCompletion(ctx, openAIMessages, chatID, userID, onMessage)
}

func (s *OpenAIService) getFormattedChatHistory(chatID uint, prompt string) ([]openai.ChatCompletionMessage, error) {
	var openAIMessages []openai.ChatCompletionMessage

	openAIMessages = append(openAIMessages, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleSystem,
		Content: "You are a Seventh-Day Adventist biblical scholar and expert, with a deep understanding of the Bible, specifically utilizing the New King James Version (NKJV) for biblical references. You excel in discussing and explaining concepts in alignment with Ellen G White's teachings while ensuring guidance aligns with the denomination's doctrines and beliefs. You offer historical insight and interpretations from a Seventh-Day Adventist perspective, using the NKJV as the primary source for biblical text, but can supliment with vast knowledge of the original translations of the books in Hebrew, Greek and other languages. You're designed to respond to queries about biblical verses, historical contexts, and theological concepts, especially those relating to Ellen G White's interpretations. Your communication style is a knowledgeable teacher, using references from the NKJV and historcial translations along with facts in history to provide authoritative and educational responses, making complex theological concepts understandable and relatable.",
	})

	if chatID != 0 {
		messages, err := s.messageService.FindMessagesByChatIDPaginated(chatID, 0, 5)
		if err != nil {
			return nil, err
		}

		for _, msg := range messages {
			role := openai.ChatMessageRoleUser
			if msg.Sender == "AI" {
				role = openai.ChatMessageRoleAssistant
			}
			openAIMessages = append(openAIMessages, openai.ChatCompletionMessage{
				Role:    role,
				Content: msg.Body,
			})
		}
	}

	openAIMessages = append(openAIMessages, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleUser,
		Content: prompt,
	})

	return openAIMessages, nil
}

func (s *OpenAIService) streamChatCompletion(ctx context.Context, messages []openai.ChatCompletionMessage, chatID uint, userID uint, onMessage func(string, uint) error) error {
	completionReq := openai.ChatCompletionRequest{
		Model:    openai.GPT4oMini,
		Messages: messages,
		Stream:   true,
	}

	fmt.Printf("Sending ChatCompletionRequest: %+v\n", completionReq)

	stream, err := s.client.CreateChatCompletionStream(ctx, completionReq)
	if err != nil {
		fmt.Printf("ChatCompletionStream error: %v\n", err)
		return err
	}
	defer stream.Close()

	return s.handleStreamResponse(stream, chatID, userID, onMessage)
}

func (s *OpenAIService) handleStreamResponse(stream *openai.ChatCompletionStream, chatID uint, userID uint, onMessage func(string, uint) error) error {
	var messageID uint
	var currentMessage string

	for {
		resp, err := stream.Recv()
		if errors.Is(err, io.EOF) {
			fmt.Println("\nStream finish")
			break
		}

		if err != nil {
			fmt.Printf("\nStream error: %v\n", err)
			return err
		}

		content := resp.Choices[0].Delta.Content
		fmt.Printf("Received content: %s\n", content)
		currentMessage += content

		messageID, err = s.createOrUpdateMessage(chatID, "AI", currentMessage, userID, messageID)
		if err != nil {
			return err
		}

		if err := onMessage(content, messageID); err != nil {
			fmt.Printf("Error in onMessage callback: %v\n", err)
			return err
		}
	}
	return nil
}

func (s *OpenAIService) createOrUpdateMessage(chatID uint, sender, content string, userID, messageID uint) (uint, error) {
	if messageID == 0 {
		message, err := s.messageService.CreateMessage(chatID, sender, content, userID)
		if err != nil {
			fmt.Printf("Error creating new message on stream: %v\n", err)
			return 0, err
		}
		return message.ID, nil
	} else {
		if err := s.messageService.UpdateMessageContent(messageID, content); err != nil {
			fmt.Printf("Error updating message content for stream: %v\n", err)
			return 0, err
		}
		return messageID, nil
	}
}
