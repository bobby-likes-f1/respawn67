package repositories

import (
	"respawn67/models"
	"testing"
)

func TestGamesRepository_CreateGame(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	game := models.Game{Title: "Elden Ring", Developer: strPtr("FromSoftware"), ReleaseDate: strPtr("2022-02-25")}

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
	if created.ReleaseDate == nil || *created.ReleaseDate != "2022-02-25" {
		t.Fatalf("expected release_date '2022-02-25', got %v", created.ReleaseDate)
	}
}

func TestGamesRepository_CreateGame_WithAllFields(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	game := models.Game{
		Title:         "Cyberpunk 2077",
		Description:   strPtr("An open-world RPG set in Night City"),
		Genre:         strPtr("Action RPG"),
		Developer:     strPtr("CD Projekt Red"),
		Publisher:     strPtr("CD Projekt"),
		ReleaseDate:   strPtr("2020-12-10"),
		CoverImageURL: strPtr("https://example.com/cover.jpg"),
	}

	created, err := repo.CreateGame(game)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if created.Description == nil || *created.Description != "An open-world RPG set in Night City" {
		t.Fatalf("expected description to be set, got %v", created.Description)
	}
	if created.Publisher == nil || *created.Publisher != "CD Projekt" {
		t.Fatalf("expected publisher 'CD Projekt', got %v", created.Publisher)
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

// ── Duration Tests ──

func TestGamesRepository_UpsertDuration_Create(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	game, _ := repo.CreateGame(models.Game{Title: "Elden Ring"})

	main := 60.0
	sides := 100.0
	comp := 150.0

	duration, err := repo.UpsertDuration(game.ID, &main, &sides, &comp)
	if err != nil {
		t.Fatalf("expected no error creating duration, got %v", err)
	}
	if duration.GameID != game.ID {
		t.Fatalf("expected game_id %d, got %d", game.ID, duration.GameID)
	}
	if duration.MainStoryHours == nil || *duration.MainStoryHours != 60.0 {
		t.Fatalf("expected main_story_hours 60.0, got %v", duration.MainStoryHours)
	}
	if duration.MainPlusSidesHours == nil || *duration.MainPlusSidesHours != 100.0 {
		t.Fatalf("expected main_plus_sides_hours 100.0, got %v", duration.MainPlusSidesHours)
	}
	if duration.CompletionistHours == nil || *duration.CompletionistHours != 150.0 {
		t.Fatalf("expected completionist_hours 150.0, got %v", duration.CompletionistHours)
	}
}

func TestGamesRepository_UpsertDuration_Update(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	game, _ := repo.CreateGame(models.Game{Title: "Hollow Knight"})

	main := 25.0
	repo.UpsertDuration(game.ID, &main, nil, nil)

	// Update with new values
	newMain := 30.0
	comp := 60.0
	updated, err := repo.UpsertDuration(game.ID, &newMain, nil, &comp)
	if err != nil {
		t.Fatalf("expected no error updating duration, got %v", err)
	}
	if updated.MainStoryHours == nil || *updated.MainStoryHours != 30.0 {
		t.Fatalf("expected updated main_story_hours 30.0, got %v", updated.MainStoryHours)
	}
	if updated.CompletionistHours == nil || *updated.CompletionistHours != 60.0 {
		t.Fatalf("expected updated completionist_hours 60.0, got %v", updated.CompletionistHours)
	}
}

func TestGamesRepository_UpsertDuration_NilValues(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	game, _ := repo.CreateGame(models.Game{Title: "Game X"})

	duration, err := repo.UpsertDuration(game.ID, nil, nil, nil)
	if err != nil {
		t.Fatalf("expected no error with nil duration values, got %v", err)
	}
	if duration.GameID != game.ID {
		t.Fatalf("expected game_id %d, got %d", game.ID, duration.GameID)
	}
	if duration.MainStoryHours != nil {
		t.Fatalf("expected main_story_hours to be nil, got %v", duration.MainStoryHours)
	}
}

func TestGamesRepository_UpsertDuration_ReflectedInGetGameByID(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	game, _ := repo.CreateGame(models.Game{Title: "Sekiro"})

	main := 30.0
	repo.UpsertDuration(game.ID, &main, nil, nil)

	found, err := repo.GetGameByID(game.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if found.Duration == nil {
		t.Fatal("expected Duration to be preloaded, got nil")
	}
	if found.Duration.MainStoryHours == nil || *found.Duration.MainStoryHours != 30.0 {
		t.Fatalf("expected preloaded main_story_hours 30.0, got %v", found.Duration.MainStoryHours)
	}
}

func TestGamesRepository_DeleteDuration(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	game, _ := repo.CreateGame(models.Game{Title: "Dark Souls"})

	main := 40.0
	repo.UpsertDuration(game.ID, &main, nil, nil)

	err := repo.DeleteDuration(game.ID)
	if err != nil {
		t.Fatalf("expected no error deleting duration, got %v", err)
	}

	// Duration should no longer be preloaded
	found, _ := repo.GetGameByID(game.ID)
	if found.Duration != nil {
		t.Fatalf("expected Duration to be nil after deletion, got %v", found.Duration)
	}
}

func TestGamesRepository_DeleteDuration_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	err := repo.DeleteDuration(999)
	if err == nil {
		t.Fatal("expected error when deleting non-existent duration, got nil")
	}
}

func TestGamesRepository_DeleteDuration_DoesNotAffectOtherGames(t *testing.T) {
	db := setupTestDB()
	repo := &GamesRepository{db: db}

	game1, _ := repo.CreateGame(models.Game{Title: "Game A"})
	game2, _ := repo.CreateGame(models.Game{Title: "Game B"})

	main := 20.0
	repo.UpsertDuration(game1.ID, &main, nil, nil)
	repo.UpsertDuration(game2.ID, &main, nil, nil)

	repo.DeleteDuration(game1.ID)

	found, _ := repo.GetGameByID(game2.ID)
	if found.Duration == nil {
		t.Fatal("expected game2's Duration to still exist after deleting game1's duration")
	}
}
