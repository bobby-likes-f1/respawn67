package repositories

import (
	"respawn67/models"
	"testing"
)

func TestGuidesRepository_Create(t *testing.T) {
	db := setupTestDB()
	db.AutoMigrate(&models.Guide{})
	repo := &GuidesRepository{db: db}

	guide := models.Guide{GameID: 1, UserID: 1, Title: "Beginner Guide", Content: "Start here"}
	created, err := repo.Create(guide)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if created.ID == 0 {
		t.Fatal("expected created guide to have an ID")
	}
	if created.Title != "Beginner Guide" {
		t.Fatalf("expected title 'Beginner Guide', got '%s'", created.Title)
	}
	if created.GameID != 1 {
		t.Fatalf("expected game_id 1, got %d", created.GameID)
	}
}

func TestGuidesRepository_GetByID(t *testing.T) {
	db := setupTestDB()
	db.AutoMigrate(&models.Guide{})
	repo := &GuidesRepository{db: db}

	created, _ := repo.Create(models.Guide{GameID: 1, UserID: 1, Title: "Boss Guide", Content: "How to beat the boss"})

	found, err := repo.GetByID(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if found.Title != "Boss Guide" {
		t.Fatalf("expected title 'Boss Guide', got '%s'", found.Title)
	}
}

func TestGuidesRepository_GetByID_NotFound(t *testing.T) {
	db := setupTestDB()
	db.AutoMigrate(&models.Guide{})
	repo := &GuidesRepository{db: db}

	_, err := repo.GetByID(999)
	if err == nil {
		t.Fatal("expected error for non-existent guide, got nil")
	}
}

func TestGuidesRepository_GetByGameID(t *testing.T) {
	db := setupTestDB()
	db.AutoMigrate(&models.Guide{})
	repo := &GuidesRepository{db: db}

	repo.Create(models.Guide{GameID: 1, UserID: 1, Title: "Guide A", Content: "..."})
	repo.Create(models.Guide{GameID: 1, UserID: 2, Title: "Guide B", Content: "..."})
	repo.Create(models.Guide{GameID: 2, UserID: 1, Title: "Other game guide", Content: "..."})

	guides, err := repo.GetByGameID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(guides) != 2 {
		t.Fatalf("expected 2 guides for game 1, got %d", len(guides))
	}
}

func TestGuidesRepository_GetByGameID_Empty(t *testing.T) {
	db := setupTestDB()
	db.AutoMigrate(&models.Guide{})
	repo := &GuidesRepository{db: db}

	guides, err := repo.GetByGameID(99)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(guides) != 0 {
		t.Fatalf("expected 0 guides, got %d", len(guides))
	}
}

func TestGuidesRepository_Update(t *testing.T) {
	db := setupTestDB()
	db.AutoMigrate(&models.Guide{})
	repo := &GuidesRepository{db: db}

	created, _ := repo.Create(models.Guide{GameID: 1, UserID: 1, Title: "Old Title", Content: "Old Content"})

	updated, err := repo.Update(created.ID, models.Guide{Title: "New Title", Content: "New Content"})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if updated.Title != "New Title" {
		t.Fatalf("expected title 'New Title', got '%s'", updated.Title)
	}
	if updated.Content != "New Content" {
		t.Fatalf("expected updated content, got '%s'", updated.Content)
	}
}

func TestGuidesRepository_Delete(t *testing.T) {
	db := setupTestDB()
	db.AutoMigrate(&models.Guide{})
	repo := &GuidesRepository{db: db}

	created, _ := repo.Create(models.Guide{GameID: 1, UserID: 1, Title: "To Delete", Content: "..."})

	err := repo.Delete(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	_, err = repo.GetByID(created.ID)
	if err == nil {
		t.Fatal("expected error after deletion, got nil")
	}
}

func TestGuidesRepository_Delete_NotFound(t *testing.T) {
	db := setupTestDB()
	db.AutoMigrate(&models.Guide{})
	repo := &GuidesRepository{db: db}

	err := repo.Delete(999)
	if err == nil {
		t.Fatal("expected error deleting non-existent guide, got nil")
	}
}

func TestGuidesRepository_Delete_AllowsRecreate(t *testing.T) {
	db := setupTestDB()
	db.AutoMigrate(&models.Guide{})
	repo := &GuidesRepository{db: db}

	created, _ := repo.Create(models.Guide{GameID: 1, UserID: 1, Title: "Temp", Content: "..."})
	repo.Delete(created.ID)

	// Should be able to create a new guide for same game/user after hard delete
	recreated, err := repo.Create(models.Guide{GameID: 1, UserID: 1, Title: "Temp", Content: "..."})
	if err != nil {
		t.Fatalf("expected no error recreating guide, got %v", err)
	}
	if recreated.ID == created.ID {
		t.Fatal("expected new guide to have a different ID")
	}
}
