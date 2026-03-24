package models

import "gorm.io/gorm"

type Review struct {
	gorm.Model `json:"-"`
	UserID     uint    `json:"user_id"          gorm:"not null"`
	GameID     uint    `json:"game_id"          gorm:"not null"`
	Score      int16   `json:"score"            gorm:"not null;check:score BETWEEN 1 AND 10"`
	Text       *string `json:"text"`
}

func (Review) TableName() string {
	return "reviews"
}
