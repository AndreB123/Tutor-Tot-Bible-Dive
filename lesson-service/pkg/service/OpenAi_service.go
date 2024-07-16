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

	functionDefinition := openai.FunctionDefinition{
		Name: "generate_topic_plan",
		Parameters: map[string]interface{}{
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

	requestBody := openai.ChatCompletionRequest{
		Model:       "gpt-4",
		Messages:    []openai.ChatCompletionMessage{{Role: "user", Content: prompt}},
		MaxTokens:   1000,
		Temperature: 0.7,
		Functions:   []openai.FunctionDefinition{functionDefinition},
		FunctionCall: openai.FunctionCall{
			Name: "generate_topic_plan",
		},
	}

	resp, err := s.client.CreateChatCompletion(context.TODO(), requestBody)
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

	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &topicPlanData)
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
	prompt := fmt.Sprintf("Create a detailed lesson plan for this lesson: '%s' and this objective: %s", lesson.Title, lesson.Objective)

	functionDefinition := openai.FunctionDefinition{
		Name: "generate_detailed_lesson",
		Parameters: map[string]interface{}{
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
			},
			"required": []string{"title", "objective", "content"},
		},
	}

	requestBody := openai.ChatCompletionRequest{
		Model:       "gpt-4",
		Messages:    []openai.ChatCompletionMessage{{Role: "user", Content: prompt}},
		MaxTokens:   1000,
		Temperature: 0.7,
		Functions:   []openai.FunctionDefinition{functionDefinition},
		FunctionCall: openai.FunctionCall{
			Name: "generate_detailed_lesson",
		},
	}

	resp, err := s.client.CreateChatCompletion(context.TODO(), requestBody)
	if err != nil {
		return nil, err
	}

	var lessonData struct {
		Title     string `json:"title"`
		Objective string `json:"objective"`
		Content   string `json:"content"`
	}

	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &lessonData)
	if err != nil {
		return nil, err
	}

	lesson.Title = lessonData.Title
	lesson.Objective = lessonData.Objective
	lesson.Information = lessonData.Content

	savedLesson, err := s.lessonService.CreateLesson(lesson)
	if err != nil {
		return nil, err
	}

	return savedLesson, nil
}

// GenerateTest generates a test based on a lesson's content
func (s *OpenAIService) GenerateTest(lesson *model.Lesson) (*model.Test, error) {
	prompt := fmt.Sprintf("Create a test with questions and answers based on the following lesson content: %s", lesson.Information)

	functionDefinition := openai.FunctionDefinition{
		Name: "generate_test",
		Parameters: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"title": map[string]interface{}{
					"type": "string",
				},
				"question_count": map[string]interface{}{
					"type": "integer",
				},
				"questions": map[string]interface{}{
					"type": "array",
					"items": map[string]interface{}{
						"type": "string",
					},
				},
				"answers": map[string]interface{}{
					"type": "array",
					"items": map[string]interface{}{
						"type": "string",
					},
				},
			},
			"required": []string{"title", "question_count", "questions", "answers"},
		},
	}

	requestBody := openai.ChatCompletionRequest{
		Model:       "gpt-4",
		Messages:    []openai.ChatCompletionMessage{{Role: "user", Content: prompt}},
		MaxTokens:   1000,
		Temperature: 0.7,
		Functions:   []openai.FunctionDefinition{functionDefinition},
		FunctionCall: openai.FunctionCall{
			Name: "generate_test",
		},
	}

	resp, err := s.client.CreateChatCompletion(context.TODO(), requestBody)
	if err != nil {
		return nil, err
	}

	var testData struct {
		Title         string   `json:"title"`
		QuestionCount uint     `json:"question_count"`
		Questions     []string `json:"questions"`
		Answers       []string `json:"answers"`
	}

	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &testData)
	if err != nil {
		return nil, err
	}

	test := &model.Test{
		Title:         testData.Title,
		QuestionCount: testData.QuestionCount,
		Questions:     testData.Questions,
		Answers:       testData.Answers,
		LessonID:      lesson.ID,
	}

	savedTest, err := s.testService.CreateNewTest(test)
	if err != nil {
		return nil, err
	}

	return savedTest, nil
}
