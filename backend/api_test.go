package main_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net"
	"net/http"
	"os/exec"
	"testing"
	"time"
)

const addr = "127.0.0.1:1324"

// waitForPort keeps trying to open a TCP connection on addr until timeout.
func waitForPort(addr string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		conn, err := net.DialTimeout("tcp", addr, 150*time.Millisecond)
		if err == nil {
			_ = conn.Close()
			return nil
		}
		time.Sleep(150 * time.Millisecond)
	}
	return context.DeadlineExceeded
}

// startApp launches the backend with `go run .` in the *current* directory
// (which is already the backend folder when `go test ./...` is executed).
func startApp(t *testing.T) func() {
	t.Helper()

	cmd := exec.Command("go", "run", ".")
	cmd.Stdout = nil // silence unless -v is passed to go test
	cmd.Stderr = nil
	if err := cmd.Start(); err != nil {
		t.Fatalf("cannot start backend: %v", err)
	}

	if err := waitForPort(addr, 5*time.Second); err != nil {
		_ = cmd.Process.Kill()
		t.Fatalf("service did not start: %v", err)
	}

	return func() { _ = cmd.Process.Kill() }
}

func TestPingEndpoint(t *testing.T) {
	stop := startApp(t)
	defer stop()

	resp, err := http.Get("http://" + addr + "/ping")
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", resp.StatusCode)
	}
}

func TestCreateAndFetchMessage(t *testing.T) {
	stop := startApp(t)
	defer stop()

	payload := map[string]string{
		"room":    "unittest",
		"user":    "tester",
		"message": "hello",
	}
	body, _ := json.Marshal(payload)

	// create
	r, err := http.Post("http://"+addr+"/api/v1/messages",
		"application/json", bytes.NewReader(body))
	if err != nil {
		t.Fatalf("POST failed: %v", err)
	}
	if r.StatusCode != http.StatusCreated {
		t.Fatalf("expected 201 Created, got %d", r.StatusCode)
	}

	// fetch
	r, err = http.Get("http://" + addr + "/api/v1/messages?room=unittest&limit=1")
	if err != nil {
		t.Fatalf("GET failed: %v", err)
	}
	defer r.Body.Close()

	var out []struct {
		Message string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&out); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if len(out) != 1 || out[0].Message != "hello" {
		t.Fatalf("unexpected payload: %#v", out)
	}
}
