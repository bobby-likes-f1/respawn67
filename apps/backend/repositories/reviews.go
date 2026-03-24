package repositories

import (
	"respawn67/database"
	"respawn67/models"

	"gorm.io/gorm"
)

type ReviewsRepository struct {
	db *gorm.DB
}

func NewReviewsRepository() *ReviewsRepository {
	return &ReviewsRepository{db: database.GetDB()}
}

func (r *ReviewsRepository) CreateReview(review models.Review) (models.Review, error) {
	result := r.db.Create(&review)
	return review, result.Error
}

func (r *ReviewsRepository) GetReviewByID(id uint) (models.Review, error) {
	var review models.Review
	result := r.db.First(&review, id)
	return review, result.Error
}

func (r *ReviewsRepository) GetReviewsByUser(userID uint) ([]models.Review, error) {
	var reviews []models.Review
	result := r.db.Where("user_id = ?", userID).Find(&reviews)
	return reviews, result.Error
}

func (r *ReviewsRepository) GetReviewsByGame(gameID uint) ([]models.Review, error) {
	var reviews []models.Review
	result := r.db.Where("game_id = ?", gameID).Find(&reviews)
	return reviews, result.Error
}

func (r *ReviewsRepository) UpdateReview(userID uint, gameID uint, review models.Review) (models.Review, error) {
	var existing models.Review
	if result := r.db.Where("user_id = ? AND game_id = ?", userID, gameID).First(&existing); result.Error != nil {
		return existing, result.Error
	}

	result := r.db.Model(&existing).Updates(review)
	return existing, result.Error
}

func (r *ReviewsRepository) DeleteReview(userID uint, gameID uint) error {
	result := r.db.Where("user_id = ? AND game_id = ?", userID, gameID).Delete(&models.Review{})
	return result.Error
}
