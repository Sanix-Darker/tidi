package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"sync"
	"time"
)

// Message represents one chat message.
type Message struct {
	Room     string    `json:"room"`
	User     string    `json:"user"`
	Message  string    `json:"message"`
	SentAt   time.Time `json:"sent_at"`
}

// in-memory store — swap for a database whenever you like.
type store struct {
	sync.RWMutex
	msgs []Message
}

func newStore() *store { return &store{} }

func (s *store) add(m Message) {
	s.Lock()
	defer s.Unlock()
	s.msgs = append(s.msgs, m)
}

func (s *store) list(room string, limit int) []Message {
	s.RLock()
	defer s.RUnlock()

	out := make([]Message, 0, limit)
	for i := len(s.msgs) - 1; i >= 0 && len(out) < limit; i-- {
		if room == "" || s.msgs[i].Room == room {
			out = append(out, s.msgs[i])
		}
	}
	// reverse to chronological order
	for i, j := 0, len(out)-1; i < j; i, j = i+1, j-1 {
		out[i], out[j] = out[j], out[i]
	}
	return out
}

// HTTPHandler wires the REST endpoints.
type HTTPHandler struct{ db *store }

func NewHTTPHandler() *HTTPHandler { return &HTTPHandler{db: newStore()} }

// GET /ping ⇒ 200 "pong".
func (h *HTTPHandler) Ping(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("pong"))
}

// POST /api/v1/Messages  {"room":"x","user":"y","message":"hello"}           ⇒ 201
// GET  /api/v1/Messages?room=x&limit=20                                      ⇒ 200 [Message]
func (h *HTTPHandler) Messages(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		var req struct {
			Room    string `json:"room"`
			User    string `json:"user"`
			Message string `json:"message"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid json", http.StatusBadRequest)
			return
		}
		if req.Room == "" || req.User == "" || req.Message == "" {
			http.Error(w, "room, user and message required", http.StatusBadRequest)
			return
		}
		h.db.add(Message{
			Room:    req.Room,
			User:    req.User,
			Message: req.Message,
			SentAt:  time.Now(),
		})
		w.WriteHeader(http.StatusCreated)

	case http.MethodGet:
		room := r.URL.Query().Get("room")
		limit := 50
		if l := r.URL.Query().Get("limit"); l != "" {
			if n, err := strconv.Atoi(l); err == nil && n > 0 {
				limit = n
			}
		}
		out := h.db.list(room, limit)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(out)

	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}
