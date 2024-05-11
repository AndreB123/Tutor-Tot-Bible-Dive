package interceptors

import (
	contextkeys "chat-service/pkg/context-keys"
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/dgrijalva/jwt-go"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

func NewStreamInterceptor(secretKey string) grpc.StreamServerInterceptor {
	return func(srv any, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		if metaD, ok := metadata.FromIncomingContext(ss.Context()); ok {
			if tokens, found := metaD["authorization"]; found && len(tokens) > 0 {
				if uid, ok := isValidToken(tokens[0], secretKey); ok {
					newCtx := context.WithValue(ss.Context(), contextkeys.Userkey, uid)
					wrappedStream := grpc_middleware.WrapServerStream(ss)
					wrappedStream.WrappedContext = newCtx

					return handler(srv, wrappedStream)
				}
			}
		}
		log.Println("Invalid or missing auth token")
		return status.Errorf(codes.Unauthenticated, "Stream req missing auth token")
	}
}

func NewUnaryInterceptor(secretKey string) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
		if metaD, ok := metadata.FromIncomingContext(ctx); ok {
			if tokens, found := metaD["authorization"]; found && len(tokens) > 0 {
				if uid, ok := isValidToken(tokens[0], secretKey); ok {
					newCtx := context.WithValue(ctx, contextkeys.Userkey, uid)
					return handler(newCtx, req)
				}

			}
		}
		log.Println("Invalid or missing auth token")
		return nil, status.Errorf(codes.Unauthenticated, "invalid or missing token")
	}
}

func isValidToken(token string, secretKey string) (uint, bool) {
	token = strings.TrimPrefix(token, "Bearer ")

	parsedToken, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexprected signing method: %v", t.Header["alg"])
		}
		return []byte(secretKey), nil
	})
	if err != nil {
		fmt.Printf("failed to parse token: %v", err)
		return 0, false
	}
	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok && parsedToken.Valid {
		userID := claims["user_id"].(float64)
		if !ok {
			fmt.Println("User ID claim is not a number")
			return 0, false
		}
		return uint(userID), true
	}
	fmt.Println("Invalid token or claims type incorrect")
	return 0, false
}
