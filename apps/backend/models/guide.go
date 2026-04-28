package models

import (
	"time"

	"gorm.io/gorm"
)

type Guide struct {
	gorm.Model `json:"-"`
	ID         uint      `json:"id"         gorm:"primaryKey;autoIncrement"`
	GameID     uint      `json:"game_id"    gorm:"not null"`
	Game       Game      `json:"-"          gorm:"foreignKey:GameID"`
	UserID     uint      `json:"user_id"    gorm:"not null"`
	User       User      `json:"-"          gorm:"foreignKey:UserID"`
	Title      string    `json:"title"      gorm:"size:255;not null"`
	Content    string    `json:"content"    gorm:"type:text;not null"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (Guide) TableName() string {
	return "guides"
}
