package models

import "gorm.io/gorm"

type GameList struct {
	gorm.Model  `json:"-"`
	ID          uint    `json:"id"`
	UserID      uint    `json:"user_id"      gorm:"not null"`
	Name        string  `json:"name"         gorm:"size:255;not null"`
	Description *string `json:"description"`
}

func (GameList) TableName() string {
	return "game_lists"
}
