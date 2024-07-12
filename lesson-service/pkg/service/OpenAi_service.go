package service

import (
	"context"
	"encoding/json"
	"fmt"
	"lesson-service/pkg/config"
	"lesson-service/pkg/model"
	"strings"

	openai "github.com/sashabaranov/go-openai"
)

type OpenAIService struct {
	Config           *config.Config
	client           *openai.Client
	topicPlanService *TopicPlanService
	lessonService    *LessonService
	testService      *TestService
}

func NewOpenAIService(cfg *config.Config, lsnService *lessonService, tpcPlanService *TopicPlanService, tstService *TestService) *OpenAIService {
	apiKey := strings.TrimSpace(cfg.OpenAIKey)
	if apiKey == "" {
		fmt.Println("Error: API key is empty")
		return nil
	}

	client := openai.NewClient(apiKey)
	return &OpenAIService{
		client:           client,
		lessonService:    lsnService,
		topicPlanService: tpcPlanService,
		testService:      testService,
	}
}

func (oais *OpenAIService) GenerateTopicPlan(prompt string, userID uint) (*model.TopicPlan, errors) {
	prompt = fmt.Sprintf("Create a topic plan for the following subject: %s", prompt)

	functionSchema := openai.Function{
		Name: "generate_topic_plan",
		Params: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"title": map[string]interface{}{
					"type": "string",
				},
				"objective": map[string]interface{}{
					"type": "string",
				},
				"lessons": map[string]interface{}{
					"type": "array",
					"items": map[string]interface{}{
						"type": "object",
						"properties": map[string]interface{}{
							"title": map[string]interface{}{
								"type": "string",
							},
							"objective": map[string]interface{}{
								"type": "string",
							},
						},
						"required": []string{"title", "objective"},
					},
				},
			},
			"required": []string{"title", "objective", "lessons"},
		},
	}

	requestBody := openai.CompletionRequest{
		Prompt:       prompt,
		MaxTokens:    1000,
		Temperature:  0.7,
		Functions:    []openai.Function{functionSchema},
		FunctionCall: "generate_topic_plan",
	}

	resp, err := s.client.CreateCompletion(context.TODO(), requestBody)
	if err != nil {
		return nil, err
	}

	var topicPlanData struct {
		Title     string `json:"title"`
		Objective string `json:"objective"`
		Lessons   []struct {
			Title     string `json:"title"`
			Objective string `json:"objective"`
		} `json:"lessons"`
	}

	err = json.Unmarshal([]byte(resp.Choices[0].Text), &topicPlanData)
	if err != nil {
		return nil, err
	}

	topicPlan := &model.TopicPlan{
		Title:     topicPlanData.Title,
		UserID:    userID,
		Objective: topicPlanData.Objective,
		Standard:  "Standard based on prompt",
	}

	for _, lessonData := range topicPlanData.Lessons {
		lesson := model.Lesson{
			Title:     lessonData.Title,
			Objective: lessonData.Objective,
		}
		topicPlan.Lessons = append(topicPlan.Lessons, lesson)
	}

	savedTopicPlan, err := s.topicPlanService.CreateTopicPlan(topicPlan)
	if err != nil {
		return nil, err
	}

	return savedTopicPlan, nil

}
