package services

import (
	"respawn67/models"
	"respawn67/repositories"
)

type GamesService struct {
	repo *repositories.GamesRepository
}

func NewGamesService() *GamesService {
	return &GamesService{repo: repo.NewGamesRepository()}
}

func (s *GamesService) GetAll() ([]models.Game, error) {
	return s.repo.GetAll()
}
