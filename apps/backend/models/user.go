package models

import "gorm.io/gorm"

// type User struct {
// 	gorm.Model
// 	Username          string  `json:"username" gorm:"uniqueIndex;not null"`
// 	Email             string  `json:"email" gorm:"uniqueIndex;not null"`
// 	PasswordHash      string  `json:"-" gorm:"not null"`
// 	DisplayName       *string `json:"display_name,omitempty"`
// 	Bio               *string `json:"bio,omitempty"`
// 	ProfilePictureURL *string `json:"profile_picture_url,omitempty"`
// 	Location          *string `json:"location,omitempty"`
// 	FavoriteGenres    *string `json:"favorite_genres,omitempty"`
// 	IsVerified        bool    `json:"is_verified" gorm:"default:false"`
// 	IsAdmin           bool    `json:"is_admin" gorm:"default:false"`
// }

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"not null"`
	Email    string `json:"email" gorm:"not null"`
}

func (User) TableName() string {
	return "users"
}
