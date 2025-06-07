package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/sanix-darker/tidi/backend/model"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

var server = &model.Server{}

func WebsocketHandler(ctx *gin.Context) {
	// trust all origin to avoid CORS
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	// upgrades connection to websocket
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		ctx.Status(http.StatusInternalServerError)
		return
	}
	defer conn.Close()

	// create new client & add to client list
	client := model.Client{
		ID:         uuid.Must(uuid.NewRandom()).String(),
		Connection: conn,
	}

	// greet the new client
	server.Send(&client, "{\"author\": \"$erver\", \"message\": \"Welcome, click on '⚙️', connect on a room to start chat (messages are volatile)!\"}")

	// message handling
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			server.RemoveClient(client)
			return
		}
		server.ProcessMessage(client, messageType, p)
	}
}
