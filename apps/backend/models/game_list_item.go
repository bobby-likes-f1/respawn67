package models

import (
	"time"

	"gorm.io/gorm"
)

type GameListItem struct {
	gorm.Model `json:"-"`
	ID         uint      `json:"id"`
	ListID     uint      `json:"list_id" gorm:"not null"`
	GameID     uint      `json:"game_id" gorm:"not null"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (GameListItem) TableName() string {
	return "game_list_items"
}
