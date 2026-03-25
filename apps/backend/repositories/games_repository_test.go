package repositories

import (
	"respawn67/models"
	"testing"
)

func TestGamesRepository_CreateGame(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	game := models.Game{Title: "Elden Ring", Developer: strPtr("FromSoftware"), ReleaseYear: int16Ptr(2022)}

	created, err := repo.CreateGame(game)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if created.ID == 0 {
		t.Fatal("expected game to have an ID after creation")
	}
	if created.Title != "Elden Ring" {
		t.Fatalf("expected title 'Elden Ring', got '%s'", created.Title)
	}
}

func TestGamesRepository_GetAll(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	repo.CreateGame(models.Game{Title: "Game A"})
	repo.CreateGame(models.Game{Title: "Game B"})
	repo.CreateGame(models.Game{Title: "Game C"})

	games, err := repo.GetAll()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(games) != 3 {
		t.Fatalf("expected 3 games, got %d", len(games))
	}
}

func TestGamesRepository_GetAll_Empty(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	games, err := repo.GetAll()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(games) != 0 {
		t.Fatalf("expected 0 games, got %d", len(games))
	}
}

func TestGamesRepository_GetGameByID(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	created, _ := repo.CreateGame(models.Game{Title: "Hollow Knight", Developer: strPtr("Team Cherry")})

	found, err := repo.GetGameByID(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if found.Title != "Hollow Knight" {
		t.Fatalf("expected title 'Hollow Knight', got '%s'", found.Title)
	}
	if *found.Developer != "Team Cherry" {
		t.Fatalf("expected developer 'Team Cherry', got '%s'", *found.Developer)
	}
}

func TestGamesRepository_GetGameByID_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	_, err := repo.GetGameByID(999)
	if err == nil {
		t.Fatal("expected error for non-existent game, got nil")
	}
}

func TestGamesRepository_UpdateGame(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	created, _ := repo.CreateGame(models.Game{Title: "Cyberpunk", Developer: strPtr("CDPR")})

	updated, err := repo.UpdateGame(created.ID, models.Game{Title: "Cyberpunk 2077"})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if updated.Title != "Cyberpunk 2077" {
		t.Fatalf("expected title 'Cyberpunk 2077', got '%s'", updated.Title)
	}
}

func TestGamesRepository_UpdateGame_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	_, err := repo.UpdateGame(999, models.Game{Title: "Ghost"})
	if err == nil {
		t.Fatal("expected error for non-existent game, got nil")
	}
}

func TestGamesRepository_DeleteGame(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	created, _ := repo.CreateGame(models.Game{Title: "Delete Me"})

	err := repo.DeleteGame(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	_, err = repo.GetGameByID(created.ID)
	if err == nil {
		t.Fatal("expected error after deletion, got nil")
	}
}

func TestGamesRepository_DeleteGame_StillReturnsOthers(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	game1, _ := repo.CreateGame(models.Game{Title: "Keep Me"})
	game2, _ := repo.CreateGame(models.Game{Title: "Delete Me"})

	repo.DeleteGame(game2.ID)

	games, _ := repo.GetAll()
	if len(games) != 1 {
		t.Fatalf("expected 1 game remaining, got %d", len(games))
	}
	if games[0].ID != game1.ID {
		t.Fatalf("expected remaining game to be '%s'", game1.Title)
	}
}
