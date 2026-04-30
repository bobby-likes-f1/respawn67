package models

import (
	"time"

	"gorm.io/gorm"
)

type Article struct {
	gorm.Model `json:"-"`
	ID         uint      `json:"id"         gorm:"primaryKey;autoIncrement"`
	UserID     uint      `json:"user_id"    gorm:"not null"`
	User       User      `json:"-"          gorm:"foreignKey:UserID"`
	Title      string    `json:"title"      gorm:"size:255;not null"`
	Content    string    `json:"content"    gorm:"type:text;not null"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (Article) TableName() string {
	return "articles"
}
