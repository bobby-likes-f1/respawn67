package repositories

import (
	"respawn67/database"
	"respawn67/models"

	"gorm.io/gorm"
)

type FavoritesRepository struct {
	db *gorm.DB
}

func NewFavoritesRepository() *FavoritesRepository {
	return &FavoritesRepository{db: database.GetDB()}
}

func (r *FavoritesRepository) GetByUserID(userID uint) ([]models.Favorite, error) {
	var entries []models.Favorite
	result := r.db.Where("user_id = ?", userID).Find(&entries)
	return entries, result.Error
}

func (r *FavoritesRepository) Create(entry models.Favorite) (models.Favorite, error) {
	result := r.db.Create(&entry)
	return entry, result.Error
}

func (r *FavoritesRepository) Delete(id uint) error {
	result := r.db.Unscoped().Delete(&models.Favorite{}, id)
	return result.Error
}

func (r *FavoritesRepository) DeleteByUserAndGame(userID uint, gameID uint) error {
	result := r.db.Unscoped().Where("user_id = ? AND game_id = ?", userID, gameID).Delete(&models.Favorite{})
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return result.Error
}

func (r *FavoritesRepository) FindByUserAndGame(userID uint, gameID uint) (models.Favorite, error) {
	var entry models.Favorite
	result := r.db.Where("user_id = ? AND game_id = ?", userID, gameID).First(&entry)
	return entry, result.Error
}

func (r *FavoritesRepository) GetGamesByUserID(userID uint) ([]models.Game, error) {
	var games []models.Game
	result := r.db.Raw(
		"SELECT games.* FROM games INNER JOIN favorites ON favorites.game_id = games.id WHERE favorites.user_id = ? AND favorites.deleted_at IS NULL AND games.deleted_at IS NULL",
		userID,
	).Scan(&games)
	return games, result.Error
}
