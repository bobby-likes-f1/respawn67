package models

import "gorm.io/gorm"

type GameDuration struct {
	gorm.Model         `json:"-"`
	ID                 uint     `json:"-"`
	GameID             uint     `json:"-"              gorm:"not null;uniqueIndex"`
	Game               Game     `json:"-"                    gorm:"foreignKey:GameID"`
	MainStoryHours     *float64 `json:"main_story_hours"`
	MainPlusSidesHours *float64 `json:"main_plus_sides_hours"`
	CompletionistHours *float64 `json:"completionist_hours"`
}

func (GameDuration) TableName() string {
	return "game_durations"
}
