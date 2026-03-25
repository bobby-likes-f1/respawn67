package repositories

import (
	"respawn67/models"
	"testing"
)

func TestReviewsRepository_CreateReview(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	review := models.Review{UserID: 1, GameID: 1, Score: 9, Text: strPtr("amazing game")}

	created, err := repo.CreateReview(review)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if created.UserID != 1 {
		t.Fatalf("expected user_id 1, got %d", created.UserID)
	}
	if created.Score != 9 {
		t.Fatalf("expected score 9, got %d", created.Score)
	}
	if *created.Text != "amazing game" {
		t.Fatalf("expected text 'amazing game', got '%s'", *created.Text)
	}
}

func TestReviewsRepository_CreateReview_NoText(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	review := models.Review{UserID: 1, GameID: 1, Score: 7}

	created, err := repo.CreateReview(review)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if created.Text != nil {
		t.Fatal("expected text to be nil")
	}
}

func TestReviewsRepository_GetReviewByID(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	created, _ := repo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 8, Text: strPtr("great")})

	found, err := repo.GetReviewByID(created.UserID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if found.Score != 8 {
		t.Fatalf("expected score 8, got %d", found.Score)
	}
}

func TestReviewsRepository_GetReviewByID_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	_, err := repo.GetReviewByID(999)
	if err == nil {
		t.Fatal("expected error for non-existent review, got nil")
	}
}

func TestReviewsRepository_GetReviews_All(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	repo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 9})
	repo.CreateReview(models.Review{UserID: 2, GameID: 1, Score: 7})
	repo.CreateReview(models.Review{UserID: 1, GameID: 2, Score: 6})

	reviews, err := repo.GetReviews(nil, nil)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(reviews) != 3 {
		t.Fatalf("expected 3 reviews, got %d", len(reviews))
	}
}

func TestReviewsRepository_GetReviews_FilterByUser(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	repo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 9})
	repo.CreateReview(models.Review{UserID: 2, GameID: 1, Score: 7})
	repo.CreateReview(models.Review{UserID: 1, GameID: 2, Score: 6})

	userID := uint(1)
	reviews, err := repo.GetReviews(&userID, nil)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(reviews) != 2 {
		t.Fatalf("expected 2 reviews for user 1, got %d", len(reviews))
	}
}

func TestReviewsRepository_GetReviews_FilterByGame(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	repo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 9})
	repo.CreateReview(models.Review{UserID: 2, GameID: 1, Score: 7})
	repo.CreateReview(models.Review{UserID: 1, GameID: 2, Score: 6})

	gameID := uint(1)
	reviews, err := repo.GetReviews(nil, &gameID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(reviews) != 2 {
		t.Fatalf("expected 2 reviews for game 1, got %d", len(reviews))
	}
}

func TestReviewsRepository_GetReviews_FilterByUserAndGame(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	repo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 9})
	repo.CreateReview(models.Review{UserID: 2, GameID: 1, Score: 7})
	repo.CreateReview(models.Review{UserID: 1, GameID: 2, Score: 6})

	userID := uint(1)
	gameID := uint(1)
	reviews, err := repo.GetReviews(&userID, &gameID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(reviews) != 1 {
		t.Fatalf("expected 1 review for user 1 game 1, got %d", len(reviews))
	}
	if reviews[0].Score != 9 {
		t.Fatalf("expected score 9, got %d", reviews[0].Score)
	}
}

func TestReviewsRepository_GetReviews_Empty(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	reviews, err := repo.GetReviews(nil, nil)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(reviews) != 0 {
		t.Fatalf("expected 0 reviews, got %d", len(reviews))
	}
}

func TestReviewsRepository_GetReviews_FilterNoMatch(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	repo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 9})

	userID := uint(999)
	reviews, err := repo.GetReviews(&userID, nil)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(reviews) != 0 {
		t.Fatalf("expected 0 reviews for non-existent user, got %d", len(reviews))
	}
}

func TestReviewsRepository_UpdateReview(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	repo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 7, Text: strPtr("good")})

	updated, err := repo.UpdateReview(1, 1, models.Review{Score: 10})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if updated.Score != 10 {
		t.Fatalf("expected score 10, got %d", updated.Score)
	}
}

func TestReviewsRepository_UpdateReview_TextOnly(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	repo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 7, Text: strPtr("good")})

	newText := "actually great"
	updated, err := repo.UpdateReview(1, 1, models.Review{Text: &newText})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if *updated.Text != "actually great" {
		t.Fatalf("expected text 'actually great', got '%s'", *updated.Text)
	}
}

func TestReviewsRepository_UpdateReview_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	_, err := repo.UpdateReview(1, 999, models.Review{Score: 10})
	if err == nil {
		t.Fatal("expected error for non-existent review, got nil")
	}
}

func TestReviewsRepository_DeleteReview(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	repo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 9})

	err := repo.DeleteReview(1, 1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	reviews, _ := repo.GetReviews(nil, nil)
	if len(reviews) != 0 {
		t.Fatalf("expected 0 reviews after delete, got %d", len(reviews))
	}
}

func TestReviewsRepository_DeleteReview_DoesNotAffectOthers(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	repo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 9})
	repo.CreateReview(models.Review{UserID: 2, GameID: 1, Score: 7})

	repo.DeleteReview(1, 1)

	reviews, _ := repo.GetReviews(nil, nil)
	if len(reviews) != 1 {
		t.Fatalf("expected 1 review remaining, got %d", len(reviews))
	}
	if reviews[0].UserID != 2 {
		t.Fatalf("expected remaining review to be user 2's, got user %d", reviews[0].UserID)
	}
}

func TestReviewsRepository_MultipleReviewsSameGame(t *testing.T) {
	db := setupTestDB()
	repo := &ReviewsRepository{db: db}

	repo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 9})
	repo.CreateReview(models.Review{UserID: 2, GameID: 1, Score: 5})
	repo.CreateReview(models.Review{UserID: 3, GameID: 1, Score: 7})

	gameID := uint(1)
	reviews, _ := repo.GetReviews(nil, &gameID)
	if len(reviews) != 3 {
		t.Fatalf("expected 3 reviews for game 1, got %d", len(reviews))
	}
}
