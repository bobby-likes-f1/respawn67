package repositories

import (
	"respawn67/models"
	"testing"
)

// ── List CRUD Tests ──

func TestGameListRepository_Create(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list, err := repo.Create(models.GameList{UserID: 1, Name: "Summer Games"})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if list.ID == 0 {
		t.Fatal("expected list to have an ID after creation")
	}
	if list.Name != "Summer Games" {
		t.Fatalf("expected name 'Summer Games', got '%s'", list.Name)
	}
	if list.UserID != 1 {
		t.Fatalf("expected user_id 1, got %d", list.UserID)
	}
}

func TestGameListRepository_Create_WithDescription(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	desc := "Games to play this summer"
	list, err := repo.Create(models.GameList{UserID: 1, Name: "Summer Games", Description: &desc})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if list.Description == nil || *list.Description != desc {
		t.Fatalf("expected description '%s', got %v", desc, list.Description)
	}
}

func TestGameListRepository_GetByID(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	created, _ := repo.Create(models.GameList{UserID: 1, Name: "RPG Favorites"})

	found, err := repo.GetByID(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if found.Name != "RPG Favorites" {
		t.Fatalf("expected name 'RPG Favorites', got '%s'", found.Name)
	}
}

func TestGameListRepository_GetByID_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	_, err := repo.GetByID(999)
	if err == nil {
		t.Fatal("expected error for non-existent list, got nil")
	}
}

func TestGameListRepository_GetByUserID(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	repo.Create(models.GameList{UserID: 1, Name: "List A"})
	repo.Create(models.GameList{UserID: 1, Name: "List B"})
	repo.Create(models.GameList{UserID: 2, Name: "List C"})

	lists, err := repo.GetByUserID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(lists) != 2 {
		t.Fatalf("expected 2 lists for user 1, got %d", len(lists))
	}
}

func TestGameListRepository_GetByUserID_Empty(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	lists, err := repo.GetByUserID(999)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(lists) != 0 {
		t.Fatalf("expected 0 lists, got %d", len(lists))
	}
}

func TestGameListRepository_GetByUserID_DoesNotReturnOtherUsers(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	repo.Create(models.GameList{UserID: 1, Name: "User 1 List"})
	repo.Create(models.GameList{UserID: 2, Name: "User 2 List"})

	lists, _ := repo.GetByUserID(2)
	if len(lists) != 1 {
		t.Fatalf("expected 1 list for user 2, got %d", len(lists))
	}
	if lists[0].Name != "User 2 List" {
		t.Fatalf("expected 'User 2 List', got '%s'", lists[0].Name)
	}
}

func TestGameListRepository_GetAll(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	repo.Create(models.GameList{UserID: 1, Name: "List A"})
	repo.Create(models.GameList{UserID: 2, Name: "List B"})

	lists, err := repo.GetAll()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(lists) != 2 {
		t.Fatalf("expected 2 lists, got %d", len(lists))
	}
}

func TestGameListRepository_Update(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	created, _ := repo.Create(models.GameList{UserID: 1, Name: "Old Name"})

	newDesc := "Updated description"
	updated, err := repo.Update(created.ID, "New Name", &newDesc)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if updated.Name != "New Name" {
		t.Fatalf("expected name 'New Name', got '%s'", updated.Name)
	}
	if updated.Description == nil || *updated.Description != "Updated description" {
		t.Fatalf("expected description 'Updated description', got %v", updated.Description)
	}
	if updated.UserID != 1 {
		t.Fatalf("expected user_id to remain 1, got %d", updated.UserID)
	}
}

func TestGameListRepository_Update_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	_, err := repo.Update(999, "Name", nil)
	if err == nil {
		t.Fatal("expected error for non-existent list, got nil")
	}
}

func TestGameListRepository_Delete(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	created, _ := repo.Create(models.GameList{UserID: 1, Name: "To Delete"})

	err := repo.Delete(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	_, err = repo.GetByID(created.ID)
	if err == nil {
		t.Fatal("expected error after delete, list should be gone")
	}
}

func TestGameListRepository_Delete_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	err := repo.Delete(999)
	if err == nil {
		t.Fatal("expected error for non-existent list, got nil")
	}
}

func TestGameListRepository_Delete_DoesNotAffectOtherUsers(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list1, _ := repo.Create(models.GameList{UserID: 1, Name: "User 1 List"})
	repo.Create(models.GameList{UserID: 2, Name: "User 2 List"})

	repo.Delete(list1.ID)

	lists, _ := repo.GetByUserID(2)
	if len(lists) != 1 {
		t.Fatalf("expected user 2 to still have 1 list, got %d", len(lists))
	}
}

// ── List Item Tests ──

func TestGameListRepository_AddItem(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list, _ := repo.Create(models.GameList{UserID: 1, Name: "My List"})

	item, err := repo.AddItem(models.GameListItem{ListID: list.ID, GameID: 5})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if item.ID == 0 {
		t.Fatal("expected item to have an ID after creation")
	}
	if item.ListID != list.ID {
		t.Fatalf("expected list_id %d, got %d", list.ID, item.ListID)
	}
	if item.GameID != 5 {
		t.Fatalf("expected game_id 5, got %d", item.GameID)
	}
}

func TestGameListRepository_GetItemsByListID(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list1, _ := repo.Create(models.GameList{UserID: 1, Name: "List 1"})
	list2, _ := repo.Create(models.GameList{UserID: 1, Name: "List 2"})

	repo.AddItem(models.GameListItem{ListID: list1.ID, GameID: 1})
	repo.AddItem(models.GameListItem{ListID: list1.ID, GameID: 2})
	repo.AddItem(models.GameListItem{ListID: list2.ID, GameID: 3})

	items, err := repo.GetItemsByListID(list1.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("expected 2 items in list 1, got %d", len(items))
	}
}

func TestGameListRepository_GetItemsByListID_Empty(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list, _ := repo.Create(models.GameList{UserID: 1, Name: "Empty List"})

	items, err := repo.GetItemsByListID(list.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 0 {
		t.Fatalf("expected 0 items, got %d", len(items))
	}
}

func TestGameListRepository_GetItemsByListID_DoesNotReturnOtherLists(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list1, _ := repo.Create(models.GameList{UserID: 1, Name: "List 1"})
	list2, _ := repo.Create(models.GameList{UserID: 1, Name: "List 2"})

	repo.AddItem(models.GameListItem{ListID: list1.ID, GameID: 1})
	repo.AddItem(models.GameListItem{ListID: list2.ID, GameID: 2})

	items, _ := repo.GetItemsByListID(list2.ID)
	if len(items) != 1 {
		t.Fatalf("expected 1 item in list 2, got %d", len(items))
	}
	if items[0].GameID != 2 {
		t.Fatalf("expected game_id 2, got %d", items[0].GameID)
	}
}

func TestGameListRepository_FindItem(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list, _ := repo.Create(models.GameList{UserID: 1, Name: "My List"})
	repo.AddItem(models.GameListItem{ListID: list.ID, GameID: 7})

	found, err := repo.FindItem(list.ID, 7)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if found.GameID != 7 {
		t.Fatalf("expected game_id 7, got %d", found.GameID)
	}
}

func TestGameListRepository_FindItem_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list, _ := repo.Create(models.GameList{UserID: 1, Name: "My List"})

	_, err := repo.FindItem(list.ID, 999)
	if err == nil {
		t.Fatal("expected error for non-existent item, got nil")
	}
}

func TestGameListRepository_RemoveItem(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list, _ := repo.Create(models.GameList{UserID: 1, Name: "My List"})
	item, _ := repo.AddItem(models.GameListItem{ListID: list.ID, GameID: 1})

	err := repo.RemoveItem(item.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	items, _ := repo.GetItemsByListID(list.ID)
	if len(items) != 0 {
		t.Fatalf("expected 0 items after delete, got %d", len(items))
	}
}

func TestGameListRepository_RemoveItem_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	err := repo.RemoveItem(999)
	if err == nil {
		t.Fatal("expected error for non-existent item, got nil")
	}
}

func TestGameListRepository_RemoveItemByListAndGame(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list, _ := repo.Create(models.GameList{UserID: 1, Name: "My List"})
	repo.AddItem(models.GameListItem{ListID: list.ID, GameID: 5})

	err := repo.RemoveItemByListAndGame(list.ID, 5)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	_, err = repo.FindItem(list.ID, 5)
	if err == nil {
		t.Fatal("expected error after delete, item should be gone")
	}
}

func TestGameListRepository_RemoveItemByListAndGame_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	err := repo.RemoveItemByListAndGame(1, 999)
	if err == nil {
		t.Fatal("expected error for non-existent item, got nil")
	}
}

func TestGameListRepository_RemoveItem_DoesNotAffectOtherLists(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list1, _ := repo.Create(models.GameList{UserID: 1, Name: "List 1"})
	list2, _ := repo.Create(models.GameList{UserID: 1, Name: "List 2"})

	repo.AddItem(models.GameListItem{ListID: list1.ID, GameID: 1})
	repo.AddItem(models.GameListItem{ListID: list2.ID, GameID: 1})

	repo.RemoveItemByListAndGame(list1.ID, 1)

	found, err := repo.FindItem(list2.ID, 1)
	if err != nil {
		t.Fatalf("expected list 2 item to still exist, got error: %v", err)
	}
	if found.ListID != list2.ID {
		t.Fatalf("expected list_id %d, got %d", list2.ID, found.ListID)
	}
}

func TestGameListRepository_HardDelete_CanReAddItem(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list, _ := repo.Create(models.GameList{UserID: 1, Name: "My List"})
	repo.AddItem(models.GameListItem{ListID: list.ID, GameID: 1})
	repo.RemoveItemByListAndGame(list.ID, 1)

	item, err := repo.AddItem(models.GameListItem{ListID: list.ID, GameID: 1})
	if err != nil {
		t.Fatalf("expected no error re-adding after hard delete, got %v", err)
	}
	if item.GameID != 1 {
		t.Fatalf("expected game_id 1, got %d", item.GameID)
	}
}

func TestGameListRepository_GameCanAppearInMultipleLists(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list1, _ := repo.Create(models.GameList{UserID: 1, Name: "List 1"})
	list2, _ := repo.Create(models.GameList{UserID: 1, Name: "List 2"})

	_, err1 := repo.AddItem(models.GameListItem{ListID: list1.ID, GameID: 5})
	_, err2 := repo.AddItem(models.GameListItem{ListID: list2.ID, GameID: 5})

	if err1 != nil || err2 != nil {
		t.Fatalf("expected game to be addable to multiple lists, got errors: %v, %v", err1, err2)
	}

	items1, _ := repo.GetItemsByListID(list1.ID)
	items2, _ := repo.GetItemsByListID(list2.ID)
	if len(items1) != 1 || len(items2) != 1 {
		t.Fatalf("expected 1 item in each list, got %d and %d", len(items1), len(items2))
	}
}

func TestGameListRepository_GetGamesByListID(t *testing.T) {
	db := setupTestDB()
	gamesRepo := &GamesRepository{db: db}
	listRepo := &GameListRepository{db: db}

	game1, _ := gamesRepo.CreateGame(models.Game{Title: "Game A"})
	game2, _ := gamesRepo.CreateGame(models.Game{Title: "Game B"})
	gamesRepo.CreateGame(models.Game{Title: "Game C"})

	list, _ := listRepo.Create(models.GameList{UserID: 1, Name: "My List"})
	listRepo.AddItem(models.GameListItem{ListID: list.ID, GameID: game1.ID})
	listRepo.AddItem(models.GameListItem{ListID: list.ID, GameID: game2.ID})

	games, err := listRepo.GetGamesByListID(list.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(games) != 2 {
		t.Fatalf("expected 2 games, got %d", len(games))
	}
}

func TestGameListRepository_GetGamesByListID_Empty(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list, _ := repo.Create(models.GameList{UserID: 1, Name: "Empty List"})

	games, err := repo.GetGamesByListID(list.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if games != nil && len(games) != 0 {
		t.Fatalf("expected 0 games, got %d", len(games))
	}
}

func TestGameListRepository_GetGamesByListID_ExcludesDeletedItems(t *testing.T) {
	db := setupTestDB()
	gamesRepo := &GamesRepository{db: db}
	listRepo := &GameListRepository{db: db}

	game1, _ := gamesRepo.CreateGame(models.Game{Title: "Game A"})
	game2, _ := gamesRepo.CreateGame(models.Game{Title: "Game B"})

	list, _ := listRepo.Create(models.GameList{UserID: 1, Name: "My List"})
	listRepo.AddItem(models.GameListItem{ListID: list.ID, GameID: game1.ID})
	listRepo.AddItem(models.GameListItem{ListID: list.ID, GameID: game2.ID})

	listRepo.RemoveItemByListAndGame(list.ID, game1.ID)

	games, _ := listRepo.GetGamesByListID(list.ID)
	if len(games) != 1 {
		t.Fatalf("expected 1 game after deletion, got %d", len(games))
	}
	if games[0].Title != "Game B" {
		t.Fatalf("expected 'Game B', got '%s'", games[0].Title)
	}
}

func TestGameListRepository_DeleteItemsByListID(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list, _ := repo.Create(models.GameList{UserID: 1, Name: "My List"})
	repo.AddItem(models.GameListItem{ListID: list.ID, GameID: 1})
	repo.AddItem(models.GameListItem{ListID: list.ID, GameID: 2})
	repo.AddItem(models.GameListItem{ListID: list.ID, GameID: 3})

	err := repo.DeleteItemsByListID(list.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	items, _ := repo.GetItemsByListID(list.ID)
	if len(items) != 0 {
		t.Fatalf("expected 0 items after bulk delete, got %d", len(items))
	}
}

func TestGameListRepository_DeleteItemsByListID_DoesNotAffectOtherLists(t *testing.T) {
	db := setupTestDB()
	repo := &GameListRepository{db: db}

	list1, _ := repo.Create(models.GameList{UserID: 1, Name: "List 1"})
	list2, _ := repo.Create(models.GameList{UserID: 1, Name: "List 2"})

	repo.AddItem(models.GameListItem{ListID: list1.ID, GameID: 1})
	repo.AddItem(models.GameListItem{ListID: list2.ID, GameID: 2})

	repo.DeleteItemsByListID(list1.ID)

	items, _ := repo.GetItemsByListID(list2.ID)
	if len(items) != 1 {
		t.Fatalf("expected list 2 to still have 1 item, got %d", len(items))
	}
}
