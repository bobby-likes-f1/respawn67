package models

import (
	"time"

	"gorm.io/gorm"
)

type Favorite struct {
	gorm.Model `json:"-"`
	UserID     uint      `json:"user_id" gorm:"not null"`
	GameID     uint      `json:"game_id" gorm:"not null"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (Favorite) TableName() string {
	return "favorites"
}
