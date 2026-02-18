package models

type User struct {
	ID                int     `json:"id"`
	Username          string  `json:"username"`
	Email             string  `json:"email"`
	PasswordHash      string  `json:"-"` // Never send password in JSON
	DisplayName       *string `json:"display_name,omitempty"`
	Bio               *string `json:"bio,omitempty"`
	ProfilePictureURL *string `json:"profile_picture_url,omitempty"`
	Location          *string `json:"location,omitempty"`
	FavoriteGenres    *string `json:"favorite_genres,omitempty"`
	IsVerified        bool    `json:"is_verified"`
	IsAdmin           bool    `json:"is_admin"`
	CreatedAt         string  `json:"created_at,omitempty"`
	UpdatedAt         string  `json:"updated_at,omitempty"`
}
