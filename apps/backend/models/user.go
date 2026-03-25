package models

import "gorm.io/gorm"

type User struct {
	gorm.Model   `json:"-"`
	ID           uint   `json:"id"`
	Username     string `json:"username"      gorm:"size:50;not null;unique"`
	Email        string `json:"email"         gorm:"size:255;not null;unique"`
	PasswordHash string `json:"-"             gorm:"not null"`
}

func (User) TableName() string {
	return "users"
}
