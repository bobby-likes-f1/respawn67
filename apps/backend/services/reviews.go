package services

import (
	"respawn67/models"
	"respawn67/repositories"
)

type ReviewsService struct {
	repo *repositories.ReviewsRepository
}

func NewReviewsService() *ReviewsService {
	return &ReviewsService{repo: repositories.NewReviewsRepository()}
}

func (s *ReviewsService) CreateReview(review models.Review) (models.Review, error) {
	return s.repo.CreateReview(review)
}

func (s *ReviewsService) GetReviewByID(id uint) (models.Review, error) {
	return s.repo.GetReviewByID(id)
}

func (s *ReviewsService) GetReviews(userID *uint, gameID *uint) ([]models.Review, error) {
	return s.repo.GetReviews(userID, gameID)
}

func (s *ReviewsService) UpdateReview(userID uint, gameID uint, review models.Review) (models.Review, error) {
	return s.repo.UpdateReview(userID, gameID, review)
}

func (s *ReviewsService) DeleteReview(userID uint, gameID uint) error {
	return s.repo.DeleteReview(userID, gameID)
}
