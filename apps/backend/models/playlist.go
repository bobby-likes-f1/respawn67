package models

import "gorm.io/gorm"

type Playlist struct {
	gorm.Model
	UserID uint   `json:"user_id" gorm:"not null"`
	GameID uint   `json:"game_id" gorm:"not null"`
	Status string `json:"status" gorm:"not null;default:want_to_play"`
}

func (Playlist) TableName() string {
	return "playlists"
}
