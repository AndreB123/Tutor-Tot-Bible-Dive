package service

import (
	"fmt"
	"time"
	"user-microservice/pkg/config"

	"github.com/dgrijalva/jwt-go"
)

type AuthService struct {
	Config *config.Config
}

func NewAuthService(cfg *config.Config) *AuthService {
	return &AuthService{
		Config: cfg,
	}
}

func (s *AuthService) GenerateToken(userID uint, isAccessToken bool) (string, error) {
	var secretKey string
	var exp time.Duration

	if isAccessToken {
		secretKey = s.Config.AccessSecret
		exp = time.Minute * 15
	} else {
		secretKey = s.Config.RefreshSecret
		exp = time.Hour * 24 * 7
	}

	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(exp).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secretKey))
}

func (s *AuthService) VerifyToken(tokenString string, isAccessToken bool) (uint, error) {
	var secretKey string
	if isAccessToken {
		secretKey = s.Config.AccessSecret
	} else {
		secretKey = s.Config.RefreshSecret
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
	})

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := claims["user_id"].(uint)
		return userID, nil
	} else {
		return 0, err
	}
}
