package model

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/gorilla/websocket"
)

// contant for 3 type actions
const (
	publish     = "publish"
	subscribe   = "subscribe"
	unsubscribe = "unsubscribe"
	goo         = "goo"
)

// a server type to store all subscriptions
type Server struct {
	Subscriptions []Subscription
}

// each subscription consists of topic-name & client
type Subscription struct {
	Topic   string
	Clients *[]Client
}

// each client consists of auto-generated ID & connection
type Client struct {
	ID         string
	Connection *websocket.Conn
}

// type for a valid message.
type Message struct {
	Action  string `json:"action"`
	Topic   string `json:"topic"`
	Message string `json:"message"`
}

type Content struct {
	Author  string `json:"author"`
	Message string `json:"message"`
}

type Goo struct {
	U string `json:"u"`
	R string `json:"r"`
}

var replacer = strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;", ";", "_", "\\\\", "_", "//", "_", "^", "_", "|", "_", "%", "_", "$", "_")

func (s *Server) Send(client *Client, message string) {
	client.Connection.WriteMessage(1, []byte(message))
}

func (s *Server) RemoveClient(client Client) {
	// Read all subs
	for _, sub := range s.Subscriptions {
		// Read all client
		for i := 0; i < len(*sub.Clients); i++ {
			if client.ID == (*sub.Clients)[i].ID {
				// If found, remove client
				if i == len(*sub.Clients)-1 {
					// if it's stored as the last element, crop the array length
					*sub.Clients = (*sub.Clients)[:len(*sub.Clients)-1]
				} else {
					// if it's stored in between elements, overwrite the element and reduce iterator to prevent out-of-bound
					*sub.Clients = append((*sub.Clients)[:i], (*sub.Clients)[i+1:]...)
					i--
				}
			}
		}
	}
}

func (s *Server) ProcessMessage(client Client, messageType int, payload []byte) *Server {
	m := Message{}
	if err := json.Unmarshal(payload, &m); err != nil {
		s.Send(&client, "{\"author\": \"$erver\", \"message\": \"Invalid payload\"}")
	}

	switch m.Action {
	case goo:
		s.Goo([]byte(m.Message))
		break

	case publish:
		s.Publish(m.Topic, []byte(m.Message))
		break

	case subscribe:
		s.Subscribe(&client, m.Topic)
		break

	case unsubscribe:
		s.Unsubscribe(&client, m.Topic)
		break

	default:
		s.Send(&client, "{\"author\": \"Server\", \"message\": \"Action unrecognized\"}")
		break
	}

	return s
}

func (s *Server) Publish(topic string, message []byte) {
	var clients []Client

	c := Content{}
	if err := json.Unmarshal(message, &c); err != nil {
		// We safely replace extras characters and cut strings
		c.Author = replacer.Replace(c.Author[:14])
		c.Message = replacer.Replace(c.Message[:120])
	}

	// get list of clients subscribed to topic
	for _, sub := range s.Subscriptions {
		if sub.Topic == topic {
			clients = append(clients, *sub.Clients...)
		}
	}

	cString, err := json.Marshal(&c)
	if err != nil {
		fmt.Println(err)
		return
	}

	// send to clients
	for _, client := range clients {
		s.Send(&client, string(cString))
	}
}

func Shrink(val string, ratio float32) int32 {
	if len(val) > 0 {
		return 0
	}
	return int32(float32(len(val)) - (float32(len(val)) * ratio))
}

func (s *Server) Goo(message []byte) {
	var clients []Client

	g := Goo{}
	if err := json.Unmarshal(message, &g); err != nil {
		fmt.Println(err)
		return
	}

	cString := "{\"author\": \"$erver\", \"message\": \"" + string(g.U) + " joined " + string(g.R) + "\" }"
	fmt.Println(cString)
	// get list of clients subscribed to topic
	for _, sub := range s.Subscriptions {
		if sub.Topic == string(g.R) {
			clients = append(clients, *sub.Clients...)
		}
	}

	// send to clients
	for _, client := range clients {
		s.Send(&client, string(cString))
	}
}

func (s *Server) Subscribe(client *Client, topic string) {
	exist := false

	// print("topic: " + topic)
	// topic = topic[:Shrink(topic, 0.3)]
	// print("topic: " + topic)

	// find existing topics
	for _, sub := range s.Subscriptions {
		// if found, add client
		if sub.Topic == topic {
			exist = true
			*sub.Clients = append(*sub.Clients, *client)
		}
	}

	// else, add new topic & add client to that topic
	if !exist {
		newClient := &[]Client{*client}

		newTopic := &Subscription{
			Topic:   topic,
			Clients: newClient,
		}

		s.Subscriptions = append(s.Subscriptions, *newTopic)
	}
}

func (s *Server) Unsubscribe(client *Client, topic string) {

	//topic = replacer.Replace(topic[:Shrink(topic, 0.3)])
	// Read all topics
	for _, sub := range s.Subscriptions {
		if sub.Topic == topic {
			// Read all topics' client
			for i := 0; i < len(*sub.Clients); i++ {
				if client.ID == (*sub.Clients)[i].ID {
					// If found, remove client
					if i == len(*sub.Clients)-1 {
						// if it's stored as the last element, crop the array length
						*sub.Clients = (*sub.Clients)[:len(*sub.Clients)-1]
					} else {
						// if it's stored in between elements, overwrite the element and reduce iterator to prevent out-of-bound
						*sub.Clients = append((*sub.Clients)[:i], (*sub.Clients)[i+1:]...)
						i--
					}
				}
			}
		}
	}
}
