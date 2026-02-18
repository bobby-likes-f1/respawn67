package models

import "gorm.io/gorm"

// type Game struct {
// 	gorm.Model
// 	Title             string  `json:"title" gorm:"not null"`
// 	Description       *string `json:"description,omitempty"`
// 	ReleaseDate       *string `json:"release_date,omitempty"`
// 	CoverImageURL     *string `json:"cover_image_url,omitempty"`
// 	SpotlightImageURL *string `json:"spotlight_image_url,omitempty"`
// 	Developer         *string `json:"developer,omitempty"`
// 	Publisher         *string `json:"publisher,omitempty"`
// 	Genres            *string `json:"genres,omitempty"`
// 	Platforms         string  `json:"platforms,omitempty" gorm:"type:text"`
// 	AverageRating     float64 `json:"average_rating" gorm:"default:0"`
// 	TotalReviews      int     `json:"total_reviews" gorm:"default:0"`
// 	IgdbID            *int    `json:"igdb_id,omitempty"`
// }

type Game struct {
	gorm.Model
	Title       string  `json:"title" gorm:"not null"`
	Developer   *string `json:"developer,omitempty"`
	ReleaseYear *int    `json:"release_year,omitempty"`
}

func (Game) TableName() string {
	return "games"
}
