package models

import (
	"time"

	"gorm.io/gorm"
)

type GameListItem struct {
	gorm.Model `json:"-"`
	ID         uint      `json:"id"`
	ListID     uint      `json:"list_id" gorm:"not null"`
	List       GameList  `json:"-"       gorm:"foreignKey:ListID"`
	GameID     uint      `json:"game_id" gorm:"not null"`
	Game       Game      `json:"-"       gorm:"foreignKey:GameID"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (GameListItem) TableName() string {
	return "game_list_items"
}
