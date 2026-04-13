package repositories

import (
	"respawn67/models"
	"testing"
)

func TestPlaylistRepository_Create(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	entry := models.Playlist{UserID: 1, GameID: 1, Status: "want_to_play"}

	created, err := repo.Create(entry)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if created.ID == 0 {
		t.Fatal("expected entry to have an ID after creation")
	}
	if created.Status != "want_to_play" {
		t.Fatalf("expected status 'want_to_play', got '%s'", created.Status)
	}
	if created.UserID != 1 {
		t.Fatalf("expected user_id 1, got %d", created.UserID)
	}
}

func TestPlaylistRepository_GetByUserID(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	repo.Create(models.Playlist{UserID: 1, GameID: 1, Status: "playing"})
	repo.Create(models.Playlist{UserID: 1, GameID: 2, Status: "want_to_play"})
	repo.Create(models.Playlist{UserID: 2, GameID: 3, Status: "completed"})

	entries, err := repo.GetByUserID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(entries) != 2 {
		t.Fatalf("expected 2 entries for user 1, got %d", len(entries))
	}
}

func TestPlaylistRepository_GetByUserID_Empty(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	entries, err := repo.GetByUserID(999)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(entries) != 0 {
		t.Fatalf("expected 0 entries, got %d", len(entries))
	}
}

func TestPlaylistRepository_GetByUserID_DoesNotReturnOtherUsers(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	repo.Create(models.Playlist{UserID: 1, GameID: 1, Status: "playing"})
	repo.Create(models.Playlist{UserID: 2, GameID: 2, Status: "playing"})

	entries, _ := repo.GetByUserID(2)
	if len(entries) != 1 {
		t.Fatalf("expected 1 entry for user 2, got %d", len(entries))
	}
	if entries[0].GameID != 2 {
		t.Fatalf("expected game_id 2, got %d", entries[0].GameID)
	}
}

func TestPlaylistRepository_FindByUserAndGame(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	repo.Create(models.Playlist{UserID: 1, GameID: 5, Status: "playing"})

	found, err := repo.FindByUserAndGame(1, 5)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if found.GameID != 5 {
		t.Fatalf("expected game_id 5, got %d", found.GameID)
	}
	if found.Status != "playing" {
		t.Fatalf("expected status 'playing', got '%s'", found.Status)
	}
}

func TestPlaylistRepository_FindByUserAndGame_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	_, err := repo.FindByUserAndGame(1, 999)
	if err == nil {
		t.Fatal("expected error for non-existent entry, got nil")
	}
}

func TestPlaylistRepository_Update(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	created, _ := repo.Create(models.Playlist{UserID: 1, GameID: 1, Status: "want_to_play"})

	updated, err := repo.Update(created.ID, "playing")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if updated.Status != "playing" {
		t.Fatalf("expected status 'playing', got '%s'", updated.Status)
	}
	if updated.UserID != 1 {
		t.Fatalf("expected user_id to remain 1, got %d", updated.UserID)
	}
	if updated.GameID != 1 {
		t.Fatalf("expected game_id to remain 1, got %d", updated.GameID)
	}
}

func TestPlaylistRepository_UpdateByUserAndGame(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	repo.Create(models.Playlist{UserID: 1, GameID: 3, Status: "want_to_play"})

	updated, err := repo.UpdateByUserAndGame(1, 3, "completed")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if updated.Status != "completed" {
		t.Fatalf("expected status 'completed', got '%s'", updated.Status)
	}
}

func TestPlaylistRepository_UpdateByUserAndGame_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	_, err := repo.UpdateByUserAndGame(1, 999, "playing")
	if err == nil {
		t.Fatal("expected error for non-existent entry, got nil")
	}
}

func TestPlaylistRepository_Delete(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	created, _ := repo.Create(models.Playlist{UserID: 1, GameID: 1, Status: "playing"})

	err := repo.Delete(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	entries, _ := repo.GetByUserID(1)
	if len(entries) != 0 {
		t.Fatalf("expected 0 entries after delete, got %d", len(entries))
	}
}

func TestPlaylistRepository_DeleteByUserAndGame(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	repo.Create(models.Playlist{UserID: 1, GameID: 5, Status: "playing"})

	err := repo.DeleteByUserAndGame(1, 5)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	_, err = repo.FindByUserAndGame(1, 5)
	if err == nil {
		t.Fatal("expected error after delete, entry should be gone")
	}
}

func TestPlaylistRepository_DeleteByUserAndGame_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	err := repo.DeleteByUserAndGame(1, 999)
	if err == nil {
		t.Fatal("expected error for non-existent entry, got nil")
	}
}

func TestPlaylistRepository_HardDelete_CanReAdd(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	repo.Create(models.Playlist{UserID: 1, GameID: 1, Status: "playing"})
	repo.DeleteByUserAndGame(1, 1)

	// Should be able to re-add after hard delete
	created, err := repo.Create(models.Playlist{UserID: 1, GameID: 1, Status: "want_to_play"})
	if err != nil {
		t.Fatalf("expected no error re-adding after hard delete, got %v", err)
	}
	if created.Status != "want_to_play" {
		t.Fatalf("expected status 'want_to_play', got '%s'", created.Status)
	}
}

func TestPlaylistRepository_DeleteByUserAndGame_DoesNotAffectOtherUsers(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	repo.Create(models.Playlist{UserID: 1, GameID: 1, Status: "playing"})
	repo.Create(models.Playlist{UserID: 2, GameID: 1, Status: "playing"})

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

func TestPlaylistRepository_GetGamesByUserID(t *testing.T) {
	db := setupTestDB()
	gamesRepo := &GamesRepository{db: db}
	playlistRepo := &PlaylistRepository{db: db}

	game1, _ := gamesRepo.CreateGame(models.Game{Title: "Game A"})
	game2, _ := gamesRepo.CreateGame(models.Game{Title: "Game B"})
	gamesRepo.CreateGame(models.Game{Title: "Game C"})

	playlistRepo.Create(models.Playlist{UserID: 1, GameID: game1.ID, Status: "playing"})
	playlistRepo.Create(models.Playlist{UserID: 1, GameID: game2.ID, Status: "want_to_play"})

	games, err := playlistRepo.GetGamesByUserID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(games) != 2 {
		t.Fatalf("expected 2 games, got %d", len(games))
	}
}

func TestPlaylistRepository_GetGamesByUserID_Empty(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	games, err := repo.GetGamesByUserID(999)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if games != nil && len(games) != 0 {
		t.Fatalf("expected 0 games, got %d", len(games))
	}
}

func TestPlaylistRepository_GetGamesByUserID_ExcludesDeletedPlaylistEntries(t *testing.T) {
	db := setupTestDB()
	gamesRepo := &GamesRepository{db: db}
	playlistRepo := &PlaylistRepository{db: db}

	game1, _ := gamesRepo.CreateGame(models.Game{Title: "Game A"})
	game2, _ := gamesRepo.CreateGame(models.Game{Title: "Game B"})

	playlistRepo.Create(models.Playlist{UserID: 1, GameID: game1.ID, Status: "playing"})
	playlistRepo.Create(models.Playlist{UserID: 1, GameID: game2.ID, Status: "playing"})

	playlistRepo.DeleteByUserAndGame(1, game1.ID)

	games, _ := playlistRepo.GetGamesByUserID(1)
	if len(games) != 1 {
		t.Fatalf("expected 1 game after deletion, got %d", len(games))
	}
	if games[0].Title != "Game B" {
		t.Fatalf("expected 'Game B', got '%s'", games[0].Title)
	}
}

func TestPlaylistRepository_Create_WithHoursPlayed(t *testing.T) {
	db := setupTestDB()
	repo := &PlaylistRepository{db: db}

	entry := models.Playlist{UserID: 1, GameID: 1, Status: "playing", HoursPlayed: 12.5}

	created, err := repo.Create(entry)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if created.HoursPlayed != 12.5 {
		t.Fatalf("expected hours_played 12.5, got %f", created.HoursPlayed)
	}

	found, _ := repo.FindByUserAndGame(1, 1)
	if found.HoursPlayed != 12.5 {
		t.Fatalf("expected persisted hours_played 12.5, got %f", found.HoursPlayed)
	}
}
