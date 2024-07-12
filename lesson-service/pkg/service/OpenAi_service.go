package service

import (
	"fmt"
	"lesson-service/pkg/config"
	"strings"

	openai "github.com/sashabaranov/go-openai"
)

type OpenAIService struct {
	Config *config.Config
	client *openai.Client
	//topic service
	lessonService *LessonService
	//test service
}

func NewOpenAIService(cfg *config.Config, lsnService *LessonService) *OpenAIService {
	apiKey := strings.TrimSpace(cfg.OpenAIKey)
	if apiKey == "" {
		fmt.Println("Error: API key is empty")
		return nil
	}

	client := openai.NewClient(apiKey)
	return &OpenAIService{
		client:        client,
		lessonService: lsnService,
	}
}
