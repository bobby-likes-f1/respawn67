package models

import "gorm.io/gorm"

type Favorite struct {
	gorm.Model
	UserID uint `json:"user_id" gorm:"not null"`
	GameID uint `json:"game_id" gorm:"not null"`
}

func (Favorite) TableName() string {
	return "favorites"
}
