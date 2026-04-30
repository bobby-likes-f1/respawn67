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
	result := r.db.Preload("Duration").Find(&games)
	return games, result.Error
}

func (r *GamesRepository) CreateGame(game models.Game) (models.Game, error) {
	result := r.db.Create(&game)
	return game, result.Error
}

func (r *GamesRepository) GetGameByID(id uint) (models.Game, error) {
	var game models.Game
	result := r.db.Preload("Duration").First(&game, id)
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
	result := r.db.Unscoped().Delete(&models.Game{}, id)
	return result.Error
}

func (r *GamesRepository) UpsertDuration(gameID uint, mainStory *float64, mainPlusSides *float64, completionist *float64) (models.GameDuration, error) {
	var duration models.GameDuration
	result := r.db.Where("game_id = ?", gameID).First(&duration)

	if result.Error != nil {
		// Create new
		duration = models.GameDuration{
			GameID:             gameID,
			MainStoryHours:     mainStory,
			MainPlusSidesHours: mainPlusSides,
			CompletionistHours: completionist,
		}
		r.db.Create(&duration)
		return duration, nil
	}

	// Update existing
	duration.MainStoryHours = mainStory
	duration.MainPlusSidesHours = mainPlusSides
	duration.CompletionistHours = completionist
	r.db.Save(&duration)
	return duration, nil
}

func (r *GamesRepository) DeleteDuration(gameID uint) error {
	result := r.db.Unscoped().Where("game_id = ?", gameID).Delete(&models.GameDuration{})
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return result.Error
}

func (r *GamesRepository) UpdateGameRating(gameID uint) error {
	var result struct {
		Average *float64
		Count   int
	}
	r.db.Model(&models.Review{}).
		Select("AVG(score) as average, COUNT(*) as count").
		Where("game_id = ?", gameID).
		Scan(&result)

	return r.db.Model(&models.Game{}).
		Where("id = ?", gameID).
		Updates(map[string]interface{}{
			"average_rating": result.Average,
			"review_count":   result.Count,
		}).Error
}
