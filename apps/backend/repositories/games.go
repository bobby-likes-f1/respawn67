package repositories

import (
	"respawn67/database"
	"respawn67/models"

	"gorm.io/gorm"
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

func (r *GamesRepository) CreateGame(game models.Game) (models.Game, error) {
	result := r.db.Create(&game)
	return game, result.Error
}

func (r *GamesRepository) GetGameByID(id uint) (models.Game, error) {
	var game models.Game
	result := r.db.First(&game, id)
	return game, result.Error
}

func (r *GamesRepository) UpdateGame(id uint, game models.Game) (models.Game, error) {
	var existing models.Game
	if result := r.db.First(&existing, id); result.Error != nil {
		return existing, result.Error
	}

	result := r.db.Model(&existing).Updates(game)
	return existing, result.Error
}

func (r *GamesRepository) DeleteGame(id uint) error {
	result := r.db.Delete(&models.Game{}, id)
	return result.Error
}
