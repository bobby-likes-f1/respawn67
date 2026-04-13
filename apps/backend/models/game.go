package models

import (
	"time"

	"gorm.io/gorm"
)

type Game struct {
	gorm.Model           `json:"-"`
	ID                   uint      `json:"id"`
	Title                string    `json:"title"          gorm:"size:255;not null"`
	Description          *string   `json:"description"`
	Genre                *string   `json:"genre"          gorm:"size:100"`
	Developer            *string   `json:"developer"`
	Publisher            *string   `json:"publisher"`
	ReleaseDate          *string   `json:"release_date" gorm:"size:10"`
	CoverImageURL        *string   `json:"cover_image_url"`
	MainStoryHours       *float64  `json:"main_story_hours"`
	MainPlusExtrasHours  *float64  `json:"main_plus_extras_hours"`
	CompletionistHours   *float64  `json:"completionist_hours"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

func (Game) TableName() string {
	return "games"
}
