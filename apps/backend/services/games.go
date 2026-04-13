package services

import (
	"errors"
	"respawn67/models"
	"respawn67/repositories"
	"time"
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
	
	if game.ReleaseDate != nil {
		_, err := time.Parse("2006-01-02", *game.ReleaseDate)
		if err != nil {
			return models.Game{}, errors.New("release_date must be in YYYY-MM-DD format")
		}
	}
	return s.repo.CreateGame(game)
}

func (s *GamesService) UpdateGame(id uint, game models.Game) (models.Game, error) {
	return s.repo.UpdateGame(id, game)
}

func (s *GamesService) DeleteGame(id uint) error {
	return s.repo.DeleteGame(id)
}
