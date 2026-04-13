package models

import (
	"time"

	"gorm.io/gorm"
)

type Game struct {
	gorm.Model    `json:"-"`
	ID            uint    `json:"id"`
	Title         string  `json:"title"          gorm:"size:255;not null"`
	Description   *string `json:"description"`
	Genre         *string `json:"genre"          gorm:"size:100"`
	Developer     *string `json:"developer"`
	Publisher     *string `json:"publisher"`
	ReleaseDate   *string `json:"release_date" gorm:"size:10"`
	CoverImageURL *string `json:"cover_image_url"`

	Duration *GameDuration `json:"duration"       gorm:"foreignKey:GameID"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Game) TableName() string {
	return "games"
}
