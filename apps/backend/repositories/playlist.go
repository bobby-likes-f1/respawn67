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

func (r *PlaylistRepository) Update(id uint, status string) (models.Playlist, error) {
	var entry models.Playlist
	result := r.db.Model(&entry).Where("id = ?", id).Update("status", status)
	if result.Error != nil {
		return entry, result.Error
	}
	r.db.First(&entry, id)
	return entry, nil
}

func (r *PlaylistRepository) UpdateByUserAndGame(userID uint, gameID uint, status string) (models.Playlist, error) {
	var entry models.Playlist
	result := r.db.Model(&entry).Where("user_id = ? AND game_id = ?", userID, gameID).Update("status", status)
	if result.RowsAffected == 0 {
		return entry, gorm.ErrRecordNotFound
	}
	r.db.Where("user_id = ? AND game_id = ?", userID, gameID).First(&entry)
	return entry, nil
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
	result := r.db.Raw(
		"SELECT games.* FROM games INNER JOIN playlists ON playlists.game_id = games.id WHERE playlists.user_id = ? AND playlists.deleted_at IS NULL AND games.deleted_at IS NULL",
		userID,
	).Scan(&games)
	return games, result.Error
}

func (r *PlaylistRepository) FindByUserAndGame(userID uint, gameID uint) (models.Playlist, error) {
	var entry models.Playlist
	result := r.db.Where("user_id = ? AND game_id = ?", userID, gameID).First(&entry)
	return entry, result.Error
}
