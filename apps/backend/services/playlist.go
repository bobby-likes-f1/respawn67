package services

import (
	"errors"
	"respawn67/models"
	"respawn67/repositories"
)

type PlaylistService struct {
	repo *repositories.PlaylistRepository
}

func NewPlaylistService() *PlaylistService {
	return &PlaylistService{repo: repositories.NewPlaylistRepository()}
}

func (s *PlaylistService) GetByUserID(userID uint) ([]models.Playlist, error) {
	return s.repo.GetByUserID(userID)
}

func (s *PlaylistService) AddGame(entry models.Playlist) (models.Playlist, error) {
	// Check if game is already in user's playlist
	_, err := s.repo.FindByUserAndGame(entry.UserID, entry.GameID)
	if err == nil {
		return models.Playlist{}, errors.New("game already in playlist")
	}

	return s.repo.Create(entry)
}

func (s *PlaylistService) UpdateStatus(id uint, status string) (models.Playlist, error) {
	entry := models.Playlist{}
	entry.ID = id
	entry.Status = status
	return s.repo.Update(entry)
}

func (s *PlaylistService) RemoveGame(id uint) error {
	return s.repo.Delete(id)
}
