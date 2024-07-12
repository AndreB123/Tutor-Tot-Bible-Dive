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

func NewOpenAIService(cfg *config.Config, lsnService *LessonService, tpcPlanService *TopicPlanService, tstService *TestService) *OpenAIService {
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
		testService:      tstService,
	}
}

// GenerateQuickResponse generates a quick response to a user's question
func (s *OpenAIService) GenerateQuickResponse(prompt string) (string, error) {
	prompt = fmt.Sprintf("Provide a brief overview for the following topic: %s", prompt)

	resp, err := s.client.CreateCompletion(context.TODO(), openai.CompletionRequest{
		Prompt:      prompt,
		MaxTokens:   150,
		Temperature: 0.7,
	})
	if err != nil {
		return "", err
	}

	return strings.TrimSpace(resp.Choices[0].Text), nil
}

// GenerateTopicPlan generates a topic plan with a specified number of lessons
func (s *OpenAIService) GenerateTopicPlan(prompt string, userID uint, numberOfLessons int) (*model.TopicPlan, error) {
	prompt = fmt.Sprintf("Create a topic plan for the following subject with %d lessons: %s", numberOfLessons, prompt)

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

// GenerateDetailedLesson generates a detailed lesson based on a basic lesson objective
func (s *OpenAIService) GenerateDetailedLesson(lesson *model.Lesson) (*model.Lesson, error) {
	prompt := fmt.Sprintf("Create a detailed lesson plan for the objective: %s", lesson.Objective)

	functionSchema := openai.Function{
		Name: "generate_detailed_lesson",
		Params: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"title": map[string]interface{}{
					"type": "string",
				},
				"objective": map[string]interface{}{
					"type": "string",
				},
				"content": map[string]interface{}{
					"type": "string",
				},
				"activities": map[string]interface{}{
					"type": "array",
					"items": map[string]interface{}{
						"type": "string",
					},
				},
			},
			"required": []string{"title", "objective", "content", "activities"},
		},
	}

	requestBody := openai.CompletionRequest{
		Prompt:       prompt,
		MaxTokens:    1000,
		Temperature:  0.7,
		Functions:    []openai.Function{functionSchema},
		FunctionCall: "generate_detailed_lesson",
	}

	resp, err := s.client.CreateCompletion(context.TODO(), requestBody)
	if err != nil {
		return nil, err
	}

	var lessonData struct {
		Title      string   `json:"title"`
		Objective  string   `json:"objective"`
		Content    string   `json:"content"`
		Activities []string `json:"activities"`
	}

	err = json.Unmarshal([]byte(resp.Choices[0].Text), &lessonData)
	if err != nil {
		return nil, err
	}

	lesson.Title = lessonData.Title
	lesson.Objective = lessonData.Objective
	lesson.Information = lessonData.Content
	lesson.Activities = lessonData.Activities

	savedLesson, err := s.lessonService.CreateLesson(lesson)
	if err != nil {
		return nil, err
	}

	return savedLesson, nil
}
