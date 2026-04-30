package services

import (
	"errors"
	"respawn67/models"
	"respawn67/repositories"
)

type ArticlesService struct {
	repo *repositories.ArticlesRepository
}

func NewArticlesService() *ArticlesService {
	return &ArticlesService{repo: repositories.NewArticlesRepository()}
}

func (s *ArticlesService) GetAll() ([]models.Article, error) {
	return s.repo.GetAll()
}

func (s *ArticlesService) GetByID(id uint) (models.Article, error) {
	return s.repo.GetByID(id)
}

func (s *ArticlesService) Create(article models.Article) (models.Article, error) {
	return s.repo.Create(article)
}

func (s *ArticlesService) Update(id uint, requesterID uint, article models.Article) (models.Article, error) {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return existing, err
	}
	if existing.UserID != requesterID {
		return existing, errors.New("forbidden")
	}
	return s.repo.Update(id, article)
}

func (s *ArticlesService) Delete(id uint, requesterID uint) error {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if existing.UserID != requesterID {
		return errors.New("forbidden")
	}
	return s.repo.Delete(id)
}
