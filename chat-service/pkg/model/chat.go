package model

type Chat struct {
	ID       uint      `gorm:"primaryKey"`
	UserID   uint      `json:"user_id"`
	Name     string    `json:"name"`
	Messages []Message `gorm:"foreignKey:ChatID" json:"messages"`
}

type ChatSummery struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}
