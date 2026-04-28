package services

import (
	"errors"
	"respawn67/models"
	"respawn67/repositories"
)

type GuidesService struct {
	repo *repositories.GuidesRepository
}

func NewGuidesService() *GuidesService {
	return &GuidesService{repo: repositories.NewGuidesRepository()}
}

func (s *GuidesService) GetByGameID(gameID uint) ([]models.Guide, error) {
	return s.repo.GetByGameID(gameID)
}

func (s *GuidesService) GetByID(id uint) (models.Guide, error) {
	return s.repo.GetByID(id)
}

func (s *GuidesService) Create(guide models.Guide) (models.Guide, error) {
	if guide.Title == "" {
		return models.Guide{}, errors.New("title is required")
	}
	if guide.Content == "" {
		return models.Guide{}, errors.New("content is required")
	}
	return s.repo.Create(guide)
}

func (s *GuidesService) Update(id uint, requesterID uint, guide models.Guide) (models.Guide, error) {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return existing, errors.New("guide not found")
	}
	if existing.UserID != requesterID {
		return existing, errors.New("forbidden")
	}
	return s.repo.Update(id, guide)
}

func (s *GuidesService) Delete(id uint, requesterID uint) error {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("guide not found")
	}
	if existing.UserID != requesterID {
		return errors.New("forbidden")
	}
	return s.repo.Delete(id)
}
