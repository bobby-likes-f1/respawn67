package repositories

import (
	"respawn67/models"
	"testing"
)

func TestFavoritesRepository_Create(t *testing.T) {
	db := setupTestDB()
	repo := &FavoritesRepository{db: db}

	entry := models.Favorite{UserID: 1, GameID: 1}

	created, err := repo.Create(entry)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if created.ID == 0 {
		t.Fatal("expected entry to have an ID after creation")
	}
	if created.UserID != 1 {
		t.Fatalf("expected user_id 1, got %d", created.UserID)
	}
	if created.GameID != 1 {
		t.Fatalf("expected game_id 1, got %d", created.GameID)
	}
}

func TestFavoritesRepository_GetByUserID(t *testing.T) {
	db := setupTestDB()
	repo := &FavoritesRepository{db: db}

	repo.Create(models.Favorite{UserID: 1, GameID: 1})
	repo.Create(models.Favorite{UserID: 1, GameID: 2})
	repo.Create(models.Favorite{UserID: 2, GameID: 3})

	entries, err := repo.GetByUserID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(entries) != 2 {
		t.Fatalf("expected 2 entries for user 1, got %d", len(entries))
	}
}

func TestFavoritesRepository_GetByUserID_Empty(t *testing.T) {
	db := setupTestDB()
	repo := &FavoritesRepository{db: db}

	entries, err := repo.GetByUserID(999)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(entries) != 0 {
		t.Fatalf("expected 0 entries, got %d", len(entries))
	}
}

func TestFavoritesRepository_GetByUserID_DoesNotReturnOtherUsers(t *testing.T) {
	db := setupTestDB()
	repo := &FavoritesRepository{db: db}

	repo.Create(models.Favorite{UserID: 1, GameID: 1})
	repo.Create(models.Favorite{UserID: 2, GameID: 2})

	entries, _ := repo.GetByUserID(2)
	if len(entries) != 1 {
		t.Fatalf("expected 1 entry for user 2, got %d", len(entries))
	}
	if entries[0].GameID != 2 {
		t.Fatalf("expected game_id 2, got %d", entries[0].GameID)
	}
}

func TestFavoritesRepository_FindByUserAndGame(t *testing.T) {
	db := setupTestDB()
	repo := &FavoritesRepository{db: db}

	repo.Create(models.Favorite{UserID: 1, GameID: 5})

	found, err := repo.FindByUserAndGame(1, 5)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if found.GameID != 5 {
		t.Fatalf("expected game_id 5, got %d", found.GameID)
	}
}

func TestFavoritesRepository_FindByUserAndGame_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &FavoritesRepository{db: db}

	_, err := repo.FindByUserAndGame(1, 999)
	if err == nil {
		t.Fatal("expected error for non-existent entry, got nil")
	}
}

func TestFavoritesRepository_Delete(t *testing.T) {
	db := setupTestDB()
	repo := &FavoritesRepository{db: db}

	created, _ := repo.Create(models.Favorite{UserID: 1, GameID: 1})

	err := repo.Delete(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	entries, _ := repo.GetByUserID(1)
	if len(entries) != 0 {
		t.Fatalf("expected 0 entries after delete, got %d", len(entries))
	}
}

func TestFavoritesRepository_DeleteByUserAndGame(t *testing.T) {
	db := setupTestDB()
	repo := &FavoritesRepository{db: db}

	repo.Create(models.Favorite{UserID: 1, GameID: 5})

	err := repo.DeleteByUserAndGame(1, 5)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	_, err = repo.FindByUserAndGame(1, 5)
	if err == nil {
		t.Fatal("expected error after delete, entry should be gone")
	}
}

func TestFavoritesRepository_DeleteByUserAndGame_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &FavoritesRepository{db: db}

	err := repo.DeleteByUserAndGame(1, 999)
	if err == nil {
		t.Fatal("expected error for non-existent entry, got nil")
	}
}

func TestFavoritesRepository_HardDelete_CanReAdd(t *testing.T) {
	db := setupTestDB()
	repo := &FavoritesRepository{db: db}

	repo.Create(models.Favorite{UserID: 1, GameID: 1})
	repo.DeleteByUserAndGame(1, 1)

	// Should be able to re-add after hard delete
	created, err := repo.Create(models.Favorite{UserID: 1, GameID: 1})
	if err != nil {
		t.Fatalf("expected no error re-adding after hard delete, got %v", err)
	}
	if created.GameID != 1 {
		t.Fatalf("expected game_id 1, got %d", created.GameID)
	}
}

func TestFavoritesRepository_DeleteByUserAndGame_DoesNotAffectOtherUsers(t *testing.T) {
	db := setupTestDB()
	repo := &FavoritesRepository{db: db}

	repo.Create(models.Favorite{UserID: 1, GameID: 1})
	repo.Create(models.Favorite{UserID: 2, GameID: 1})

	repo.DeleteByUserAndGame(1, 1)

	// User 2's entry should still exist
	found, err := repo.FindByUserAndGame(2, 1)
	if err != nil {
		t.Fatalf("expected user 2's entry to still exist, got error: %v", err)
	}
	if found.UserID != 2 {
		t.Fatalf("expected user_id 2, got %d", found.UserID)
	}
}

func TestFavoritesRepository_GetGamesByUserID(t *testing.T) {
	db := setupTestDB()
	gamesRepo := &GamesRepository{db: db}
	favRepo := &FavoritesRepository{db: db}

	game1, _ := gamesRepo.CreateGame(models.Game{Title: "Game A"})
	game2, _ := gamesRepo.CreateGame(models.Game{Title: "Game B"})
	gamesRepo.CreateGame(models.Game{Title: "Game C"})

	favRepo.Create(models.Favorite{UserID: 1, GameID: game1.ID})
	favRepo.Create(models.Favorite{UserID: 1, GameID: game2.ID})

	games, err := favRepo.GetGamesByUserID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(games) != 2 {
		t.Fatalf("expected 2 games, got %d", len(games))
	}
}

func TestFavoritesRepository_GetGamesByUserID_Empty(t *testing.T) {
	db := setupTestDB()
	repo := &FavoritesRepository{db: db}

	games, err := repo.GetGamesByUserID(999)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if games != nil && len(games) != 0 {
		t.Fatalf("expected 0 games, got %d", len(games))
	}
}

func TestFavoritesRepository_GetGamesByUserID_ExcludesDeletedEntries(t *testing.T) {
	db := setupTestDB()
	gamesRepo := &GamesRepository{db: db}
	favRepo := &FavoritesRepository{db: db}

	game1, _ := gamesRepo.CreateGame(models.Game{Title: "Game A"})
	game2, _ := gamesRepo.CreateGame(models.Game{Title: "Game B"})

	favRepo.Create(models.Favorite{UserID: 1, GameID: game1.ID})
	favRepo.Create(models.Favorite{UserID: 1, GameID: game2.ID})

	favRepo.DeleteByUserAndGame(1, game1.ID)

	games, _ := favRepo.GetGamesByUserID(1)
	if len(games) != 1 {
		t.Fatalf("expected 1 game after deletion, got %d", len(games))
	}
	if games[0].Title != "Game B" {
		t.Fatalf("expected 'Game B', got '%s'", games[0].Title)
	}
}

func TestFavoritesRepository_GetGamesByUserID_DoesNotReturnOtherUserGames(t *testing.T) {
	db := setupTestDB()
	gamesRepo := &GamesRepository{db: db}
	favRepo := &FavoritesRepository{db: db}

	game1, _ := gamesRepo.CreateGame(models.Game{Title: "Game A"})
	game2, _ := gamesRepo.CreateGame(models.Game{Title: "Game B"})

	favRepo.Create(models.Favorite{UserID: 1, GameID: game1.ID})
	favRepo.Create(models.Favorite{UserID: 2, GameID: game2.ID})

	games, _ := favRepo.GetGamesByUserID(1)
	if len(games) != 1 {
		t.Fatalf("expected 1 game for user 1, got %d", len(games))
	}
	if games[0].Title != "Game A" {
		t.Fatalf("expected 'Game A', got '%s'", games[0].Title)
	}
}
