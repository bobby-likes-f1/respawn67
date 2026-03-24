package services

import (
	"errors"
	"respawn67/models"
	"respawn67/repositories"
)

type FavoritesService struct {
	repo *repositories.FavoritesRepository
}

func NewFavoritesService() *FavoritesService {
	return &FavoritesService{repo: repositories.NewFavoritesRepository()}
}

func (s *FavoritesService) GetByUserID(userID uint) ([]models.Favorite, error) {
	return s.repo.GetByUserID(userID)
}

func (s *FavoritesService) GetGamesByUserID(userID uint) ([]models.Game, error) {
	return s.repo.GetGamesByUserID(userID)
}

func (s *FavoritesService) AddFavorite(entry models.Favorite) (models.Favorite, error) {
	// Check if game is already in user's favorites
	_, err := s.repo.FindByUserAndGame(entry.UserID, entry.GameID)
	if err == nil {
		return models.Favorite{}, errors.New("game already in favorites")
	}

	return s.repo.Create(entry)
}

func (s *FavoritesService) RemoveFavorite(id uint) error {
	return s.repo.Delete(id)
}

func (s *FavoritesService) RemoveByUserAndGame(userID uint, gameID uint) error {
	return s.repo.DeleteByUserAndGame(userID, gameID)
}
