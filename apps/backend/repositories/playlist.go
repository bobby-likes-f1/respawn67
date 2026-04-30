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

func (r *PlaylistRepository) Update(id uint, status string, hoursPlayed *float32) (models.Playlist, error) {
	var entry models.Playlist
	if result := r.db.First(&entry, id); result.Error != nil {
		return entry, result.Error
	}
	if status != "" {
		entry.Status = status
	}
	if hoursPlayed != nil {
		entry.HoursPlayed = *hoursPlayed
	}
	result := r.db.Save(&entry)
	return entry, result.Error
}

func (r *PlaylistRepository) UpdateByUserAndGame(userID uint, gameID uint, status string, hoursPlayed *float32) (models.Playlist, error) {
	var entry models.Playlist
	if result := r.db.Where("user_id = ? AND game_id = ?", userID, gameID).First(&entry); result.Error != nil {
		return entry, gorm.ErrRecordNotFound
	}
	if status != "" {
		entry.Status = status
	}
	if hoursPlayed != nil {
		entry.HoursPlayed = *hoursPlayed
	}
	result := r.db.Save(&entry)
	return entry, result.Error
}

func (r *PlaylistRepository) Delete(id uint) error {
	result := r.db.Unscoped().Delete(&models.Playlist{}, id)
	return result.Error
}

func (r *PlaylistRepository) DeleteByUserAndGame(userID uint, gameID uint) error {
	result := r.db.Unscoped().Where("user_id = ? AND game_id = ?", userID, gameID).Delete(&models.Playlist{})
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return result.Error
}

func (r *PlaylistRepository) GetGamesByUserID(userID uint) ([]models.Game, error) {
	var games []models.Game
	result := r.db.
		Preload("Duration").
		Joins("INNER JOIN playlists ON playlists.game_id = games.id").
		Where("playlists.user_id = ?", userID).
		Find(&games)
	return games, result.Error
}

func (r *PlaylistRepository) FindByUserAndGame(userID uint, gameID uint) (models.Playlist, error) {
	var entry models.Playlist
	result := r.db.Where("user_id = ? AND game_id = ?", userID, gameID).First(&entry)
	return entry, result.Error
}
