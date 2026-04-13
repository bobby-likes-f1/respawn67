package models

import (
	"time"

	"gorm.io/gorm"
)

type Favorite struct {
	gorm.Model `json:"-"`
	UserID     uint      `json:"user_id" gorm:"not null"`
	User       User      `json:"-"       gorm:"foreignKey:UserID"`
	GameID     uint      `json:"game_id" gorm:"not null"`
	Game       Game      `json:"-"       gorm:"foreignKey:GameID"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (Favorite) TableName() string {
	return "favorites"
}
