package services

import (
	"respawn67/models"
	"respawn67/repositories"
)

type GamesService struct {
	repo *repositories.GamesRepository
}

func NewGamesService() *GamesService {
	return &GamesService{repo: repositories.NewGamesRepository()}
}

func (s *GamesService) GetAll() ([]models.Game, error) {
	return s.repo.GetAll()
}

func (s *GamesService) GetGameByID(id uint) (models.Game, error) {
	return s.repo.GetGameByID(id)
}

func (s *GamesService) CreateGame(game models.Game) (models.Game, error) {
	return s.repo.CreateGame(game)
}
