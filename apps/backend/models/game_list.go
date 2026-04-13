package models

import (
	"time"

	"gorm.io/gorm"
)

type GameList struct {
	gorm.Model  `json:"-"`
	ID          uint      `json:"id"`
	UserID      uint      `json:"user_id"      gorm:"not null"`
	User        User      `json:"-"       gorm:"foreignKey:UserID"`
	Name        string    `json:"name"         gorm:"size:255;not null"`
	Description *string   `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (GameList) TableName() string {
	return "game_lists"
}
