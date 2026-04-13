package models

import (
	"time"

	"gorm.io/gorm"
)

type Review struct {
	gorm.Model `json:"-"`
	UserID     uint      `json:"user_id"          gorm:"not null"`
	User       User      `json:"-"       gorm:"foreignKey:UserID"`
	GameID     uint      `json:"game_id"          gorm:"not null"`
	Game       Game      `json:"-"       gorm:"foreignKey:GameID"`
	Score      int16     `json:"score"            gorm:"not null;check:score BETWEEN 1 AND 10"`
	Text       *string   `json:"text"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (Review) TableName() string {
	return "reviews"
}
