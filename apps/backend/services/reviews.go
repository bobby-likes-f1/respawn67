package services

import (
	"respawn67/models"
	"respawn67/repositories"
)

type ReviewsService struct {
	repo      *repositories.ReviewsRepository
	gamesRepo *repositories.GamesRepository
}

func NewReviewsService() *ReviewsService {
	return &ReviewsService{
		repo:      repositories.NewReviewsRepository(),
		gamesRepo: repositories.NewGamesRepository(),
	}
}

func (s *ReviewsService) CreateReview(review models.Review) (models.Review, error) {
	created, err := s.repo.CreateReview(review)
	if err != nil {
		return created, err
	}
	s.gamesRepo.UpdateGameRating(review.GameID)
	return created, nil
}

func (s *ReviewsService) GetReviewByID(id uint) (models.Review, error) {
	return s.repo.GetReviewByID(id)
}

func (s *ReviewsService) GetReviews(userID *uint, gameID *uint) ([]models.Review, error) {
	return s.repo.GetReviews(userID, gameID)
}

func (s *ReviewsService) UpdateReview(userID uint, gameID uint, review models.Review) (models.Review, error) {
	updated, err := s.repo.UpdateReview(userID, gameID, review)
	if err != nil {
		return updated, err
	}
	s.gamesRepo.UpdateGameRating(gameID)
	return updated, nil
}

func (s *ReviewsService) DeleteReview(userID uint, gameID uint) error {
	err := s.repo.DeleteReview(userID, gameID)
	if err != nil {
		return err
	}
	s.gamesRepo.UpdateGameRating(gameID)
	return nil
}
