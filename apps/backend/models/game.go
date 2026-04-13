package models

import (
	"time"

	"gorm.io/gorm"
)

type Game struct {
<<<<<<< HEAD
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
=======
	gorm.Model    `json:"-"`
	ID            uint      `json:"id"`
	Title         string    `json:"title"          gorm:"size:255;not null"`
	Description   *string   `json:"description"`
	Genre         *string   `json:"genre"          gorm:"size:100"`
	Developer     *string   `json:"developer"`
	Publisher     *string   `json:"publisher"`
	ReleaseDate           *string   `json:"release_date" gorm:"size:10"`
	CoverImageURL         *string   `json:"cover_image_url"`
	TimeToBeatMain        *int      `json:"time_to_beat_main"`
	TimeToBeatExtras      *int      `json:"time_to_beat_extras"`
	TimeToBeatCompletionist *int    `json:"time_to_beat_completionist"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
>>>>>>> ce7bf038c4d48d0ca69d1916c659b97eb25b6b5e
}

func (Game) TableName() string {
	return "games"
}
