package service

import "lesson-service/pkg/repository"

type TestService struct {
	testRepo *repository.TestRespository
}

func NewTestService(testRepo *repository.TestRespository) *TestService {
	return &TestService{
		testRepo: testRepo,
	}
}
