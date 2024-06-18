package service

import (
	"fmt"
	"strings"
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

	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	parsedToken, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
	})

	if err != nil {
		fmt.Printf("Failed to parse token: %v\n", err)
		return 0, fmt.Errorf("failed to parse token: %w", err)
	}

	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok && parsedToken.Valid {
		userID, err := getUserIDFromClaims(claims)
		if err != nil {
			fmt.Printf("Error getting user ID from claims: %v\n", err)
			return 0, fmt.Errorf("error getting user ID from claims: %w", err)
		}
		return userID, nil
	}
	fmt.Println("Invalid token or claims type incorrect")
	return 0, fmt.Errorf("invalid token or claims")
}

func getUserIDFromClaims(claims jwt.MapClaims) (uint, error) {
	userIDFloat64, ok := claims["user_id"].(float64)
	if !ok {
		return 0, fmt.Errorf("user_id not found in claims or is not a float64")
	}
	return uint(userIDFloat64), nil
}
