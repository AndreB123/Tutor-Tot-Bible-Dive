package api

import "github.com/gin-gonic/gin"

func SetupRouter(handler *Handler) *gin.Engine {
	router := gin.Default()

	//routes
	router.POST("/create_user", handler.CreateUser)
	router.POST("/login", handler.Login)
	router.POST("/refresh_token", handler.RefreshToken)

	return router
}
