package models

type Game struct {
	ID                int      `json:"id"`
	Title             string   `json:"title"`
	Description       *string  `json:"description,omitempty"`         // Must be *string
	ReleaseDate       *string  `json:"release_date,omitempty"`        // Must be *string
	CoverImageURL     *string  `json:"cover_image_url,omitempty"`     // Must be *string
	SpotlightImageURL *string  `json:"spotlight_image_url,omitempty"` // Must be *string
	Developer         *string  `json:"developer,omitempty"`           // Must be *string
	Publisher         *string  `json:"publisher,omitempty"`           // Must be *string
	Genres            *string  `json:"genres,omitempty"`              // Must be *string
	Platforms         []string `json:"platforms,omitempty"`
	AverageRating     float64  `json:"average_rating"`
	TotalReviews      int      `json:"total_reviews"`
	IgdbID            *int     `json:"igdb_id,omitempty"` // Must be *int
	CreatedAt         string   `json:"created_at,omitempty"`
	UpdatedAt         string   `json:"updated_at,omitempty"`
}
