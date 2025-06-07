package main

import (
	"github.com/gin-gonic/gin"

	"github.com/sanix-darker/tidi/backend/handler"
)

func main() {
	router := gin.Default()
	router.GET("/socket", handler.WebsocketHandler)

	api := handler.NewHTTPHandler()
	router.GET("/ping", gin.WrapF(api.Ping))
	router.GET("/api/v1/messages", gin.WrapF(api.Messages))
	router.POST("/api/v1/messages", gin.WrapF(api.Messages))

	router.Run(":1324")
}
