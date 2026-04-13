package models

import (
	"time"

	"gorm.io/gorm"
)

type Playlist struct {
	gorm.Model  `json:"-"`
	UserID      uint      `json:"user_id" gorm:"not null"`
	User        User      `json:"-"       gorm:"foreignKey:UserID"`
	GameID      uint      `json:"game_id" gorm:"not null"`
	Game        Game      `json:"-"       gorm:"foreignKey:GameID"`
	Status      string    `json:"status" gorm:"not null;default:want_to_play"`
	HoursPlayed float32   `json:"hours_played"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Playlist) TableName() string {
	return "playlists"
}
