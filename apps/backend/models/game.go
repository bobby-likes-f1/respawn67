package models

import "gorm.io/gorm"

type Game struct {
	gorm.Model    `json:"-"`
	ID            uint    `json:"id"`
	Title         string  `json:"title"                    gorm:"size:255;not null"`
	Genre         *string `json:"genre"          gorm:"size:100"`
	Developer     *string `json:"developer"`
	ReleaseYear   *int16  `json:"release_year"`
	CoverImageURL *string `json:"cover_image_url"`
}

func (Game) TableName() string {
	return "games"
}
