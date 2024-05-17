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
	Config *config.Config
	client *openai.Client
}

func NewOpenAIService(cfg *config.Config) *OpenAIService {
	apiKey := strings.TrimSpace(cfg.OpenAIKey)

	if apiKey == "" {
		fmt.Println("Error: API key is empty")
		return nil
	}

	client := openai.NewClient(apiKey)
	return &OpenAIService{
		client: client,
	}
}

func (s *OpenAIService) SendMessageToOpenAI(ctx context.Context, prompt string, onMessage func(string) error) error {

	completionReq := openai.ChatCompletionRequest{
		Model: openai.GPT3Dot5Turbo,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: "You are a Seventh-Day Adventist biblical scholar and expert, with a deep understanding of the Bible, specifically utilizing the New King James Version (NKJV) for biblical references. You excel in discussing and explaining concepts in alignment with Ellen G White's teachings while ensuring guidance aligns with the denomination's doctrines and beliefs. You offer historical insight and interpretations from a Seventh-Day Adventist perspective, using the NKJV as the primary source for biblical text, but can supliment with vast knowledge of the original translations of the books in Hebrew, Greek and other languages. You're designed to respond to queries about biblical verses, historical contexts, and theological concepts, especially those relating to Ellen G White's interpretations. Your communication style is a knowledgeable teacher, using references from the NKJV and historcial translations along with facts in history to provide authoritative and educational responses, making complex theological concepts understandable and relatable.",
			},
			{
				Role:    openai.ChatMessageRoleUser,
				Content: prompt,
			},
		},
		Stream: true,
	}

	fmt.Printf("Sending ChatCompletionRequest: %+v\n", completionReq)

	stream, err := s.client.CreateChatCompletionStream(ctx, completionReq)
	if err != nil {
		fmt.Printf("ChatCompletionStream error: %v/n", err)
		return err
	}

	defer stream.Close()

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
		if content == "" {
			fmt.Println("Received empty content in stream response")
		} else {
			fmt.Printf("Received content: %s\n", content)
		}

		if err := onMessage(content); err != nil {
			fmt.Printf("Error in onMessage callback: %v\n", err)
			return err
		}
	}
	return nil
}
