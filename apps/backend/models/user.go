package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model   `json:"-"`
	ID           uint      `json:"id"`
	Username     string    `json:"username"      gorm:"size:50;not null;unique"`
	Email        string    `json:"email"         gorm:"size:255;not null;unique"`
	PasswordHash string    `json:"-"             gorm:"not null"`
	Bio          *string   `json:"bio"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
