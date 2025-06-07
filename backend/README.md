# tidi backend

## Running the server
1. Mount the repository & run this command to install dependencies
```bash
go get
```

2. Run the websocket server
```bash
go run main.go
```

3. Websocket server will be running on `localhost:1324`

## Using this server with client

1. Connect to `ws://localhost:8080/socket`, you will be greeted by the server.

2. To subscribe to a topic, send this payload (*topic can be anything*)
```json
{
  "action": "subscribe",
  "topic": "123312"
}
```

3. To send a message to the topic's subscribers, send payload in this format
```json
{
  "action": "publish",
  "topic": "123213",
  "message": "{'author': 'elhmne', 'message': 'Am sangoku !'}"
}
```

4. To unsubscribe from the topic, send this payload (*topic can be anything*)
```json
{
  "action": "unsubscribe",
  "topic": "1232131"
}
```

## Project Structure
```
main.go
go.mod
handler
└── ws.go
└── http.go
model
└── model.go
```

**main.go**: the main file to be executed.

**go.mod**: go module file.

**handler.go**: handles open/close connection & pass the message to model.

**model.go**: runs specific action according to the client message, also containes functions that needed by the server to work properly as a websocket server.
