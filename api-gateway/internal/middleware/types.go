package middleware

import "encoding/json"

type WSMessage struct {
	Action string          `json:"action"`
	Type   string          `json:"type"`
	JWT    string          `json:"jwt"`
	Data   json.RawMessage `json:"data"`
}
