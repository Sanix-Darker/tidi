package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/Sanix-Darker/tidi/backend"
)

func TestPingRoute(t *testing.T) {
	srv := backend.NewServer()           // exported helper that builds the mux + handlers
	ts  := httptest.NewServer(srv.Router)
	defer ts.Close()

	resp, err := http.Get(ts.URL + "/ping")
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", resp.StatusCode)
	}
}

func TestSendReceiveMessage(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	srv := backend.NewServer()
	ts  := httptest.NewServer(srv.Router)
	defer ts.Close()

	// 1. post a message
	payload := `{"room":"unittest","user":"tester","message":"hello"}`
	resp, err := http.Post(ts.URL+"/api/v1/messages", "application/json", strings.NewReader(payload))
	if err != nil {
		t.Fatalf("post failed: %v", err)
	}
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("expected 201 Created, got %d", resp.StatusCode)
	}

	// 2. fetch it back
	resp, err = http.Get(ts.URL + "/api/v1/messages?room=unittest&limit=1")
	if err != nil {
		t.Fatalf("get failed: %v", err)
	}
	defer resp.Body.Close()

	var list []backend.Message
	if err := json.NewDecoder(resp.Body).Decode(&list); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if len(list) != 1 || list[0].Message != "hello" {
		t.Fatalf("unexpected messages: %#v", list)
	}
}
