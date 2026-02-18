package repositories

import (
	"gorm.io/gorm"
	"respawn67/database"
	"respawn67/models"
)

type GamesRepository struct {
	db *gorm.DB
}

func NewGamesRepository() *GamesRepository {
	return &GamesRepository{db: database.GetDB()}
}

func (r *GamesRepository) GetAll() ([]models.Game, error) {
	var games []models.Game
	result := r.db.Find(&games)
	return games, result.Error
}
