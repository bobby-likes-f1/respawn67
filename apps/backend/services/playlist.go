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

func (s *PlaylistService) GetGamesByUserID(userID uint) ([]models.Game, error) {
	return s.repo.GetGamesByUserID(userID)
}

func (s *PlaylistService) AddGame(entry models.Playlist) (models.Playlist, error) {
	_, err := s.repo.FindByUserAndGame(entry.UserID, entry.GameID)
	if err == nil {
		return models.Playlist{}, errors.New("game already in playlist")
	}
	return s.repo.Create(entry)
}

func (s *PlaylistService) UpdateEntry(id uint, status string, hoursPlayed *float32) (models.Playlist, error) {
	return s.repo.Update(id, status, hoursPlayed)
}

func (s *PlaylistService) UpdateEntryByUserAndGame(userID uint, gameID uint, status string, hoursPlayed *float32) (models.Playlist, error) {
	return s.repo.UpdateByUserAndGame(userID, gameID, status, hoursPlayed)
}

func (s *PlaylistService) RemoveGame(id uint) error {
	return s.repo.Delete(id)
}

func (s *PlaylistService) RemoveByUserAndGame(userID uint, gameID uint) error {
	return s.repo.DeleteByUserAndGame(userID, gameID)
}
