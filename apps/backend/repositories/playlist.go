package repositories

import (
	"respawn67/database"
	"respawn67/models"

	"gorm.io/gorm"
)

type PlaylistRepository struct {
	db *gorm.DB
}

func NewPlaylistRepository() *PlaylistRepository {
	return &PlaylistRepository{db: database.GetDB()}
}

func (r *PlaylistRepository) GetByUserID(userID uint) ([]models.Playlist, error) {
	var entries []models.Playlist
	result := r.db.Where("user_id = ?", userID).Find(&entries)
	return entries, result.Error
}

func (r *PlaylistRepository) Create(entry models.Playlist) (models.Playlist, error) {
	result := r.db.Create(&entry)
	return entry, result.Error
}

func (r *PlaylistRepository) Update(entry models.Playlist) (models.Playlist, error) {
	result := r.db.Save(&entry)
	return entry, result.Error
}

func (r *PlaylistRepository) Delete(id uint) error {
	result := r.db.Delete(&models.Playlist{}, id)
	return result.Error
}

func (r *PlaylistRepository) FindByUserAndGame(userID uint, gameID uint) (models.Playlist, error) {
	var entry models.Playlist
	result := r.db.Where("user_id = ? AND game_id = ?", userID, gameID).First(&entry)
	return entry, result.Error
}
