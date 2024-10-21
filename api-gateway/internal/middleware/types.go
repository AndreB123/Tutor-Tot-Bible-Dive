package middleware

// WSMessage represents the incoming WebSocket message structure
type WSMessage struct {
	Service string // The name of the target service (e.g., "chat", "user", "lesson")
	JWT     string // The JWT token for authentication
	Data    []byte // The protobuf-encoded data payload
}
