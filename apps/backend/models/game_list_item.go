package models

import "gorm.io/gorm"

type GameListItem struct {
	gorm.Model `json:"-"`
	ID         uint `json:"id"`
	ListID     uint `json:"list_id" gorm:"not null"`
	GameID     uint `json:"game_id" gorm:"not null"`
}

func (GameListItem) TableName() string {
	return "game_list_items"
}
