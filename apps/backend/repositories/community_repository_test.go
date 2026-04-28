package repositories

import (
	"respawn67/models"
	"testing"
)

func TestCommunityRepository_GetRatingDistribution_AllBuckets(t *testing.T) {
	db := setupTestDB()
	repo := &CommunityRepository{db: db}
	reviewRepo := &ReviewsRepository{db: db}

	reviewRepo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 7})
	reviewRepo.CreateReview(models.Review{UserID: 2, GameID: 1, Score: 7})
	reviewRepo.CreateReview(models.Review{UserID: 3, GameID: 1, Score: 10})

	dist, err := repo.GetRatingDistribution(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// All 10 keys must be present
	for i := 1; i <= 10; i++ {
		key := scoreKey(int16(i))
		if _, ok := dist[key]; !ok {
			t.Fatalf("expected key '%s' in distribution, not found", key)
		}
	}

	if dist["7"] != 2 {
		t.Fatalf("expected score 7 count to be 2, got %d", dist["7"])
	}
	if dist["10"] != 1 {
		t.Fatalf("expected score 10 count to be 1, got %d", dist["10"])
	}
	if dist["1"] != 0 {
		t.Fatalf("expected score 1 count to be 0, got %d", dist["1"])
	}
}

func TestCommunityRepository_GetRatingDistribution_NoReviews(t *testing.T) {
	db := setupTestDB()
	repo := &CommunityRepository{db: db}

	dist, err := repo.GetRatingDistribution(99)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(dist) != 10 {
		t.Fatalf("expected 10 keys even with no reviews, got %d", len(dist))
	}
	for i := 1; i <= 10; i++ {
		key := scoreKey(int16(i))
		if dist[key] != 0 {
			t.Fatalf("expected all counts to be 0 for game with no reviews, got %d for key %s", dist[key], key)
		}
	}
}

func TestCommunityRepository_GetRatingDistribution_IsolatedByGame(t *testing.T) {
	db := setupTestDB()
	repo := &CommunityRepository{db: db}
	reviewRepo := &ReviewsRepository{db: db}

	reviewRepo.CreateReview(models.Review{UserID: 1, GameID: 1, Score: 8})
	reviewRepo.CreateReview(models.Review{UserID: 2, GameID: 2, Score: 5})

	dist, err := repo.GetRatingDistribution(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if dist["8"] != 1 {
		t.Fatalf("expected score 8 count 1, got %d", dist["8"])
	}
	if dist["5"] != 0 {
		t.Fatalf("expected score 5 count 0 (other game), got %d", dist["5"])
	}
}

func TestCommunityRepository_GetListsContainingGame(t *testing.T) {
	db := setupTestDB()
	repo := &CommunityRepository{db: db}
	listRepo := &GameListRepository{db: db}

	list1, _ := listRepo.Create(models.GameList{UserID: 1, Name: "List A"})
	list2, _ := listRepo.Create(models.GameList{UserID: 1, Name: "List B"})
	listRepo.AddItem(models.GameListItem{ListID: list1.ID, GameID: 1})
	listRepo.AddItem(models.GameListItem{ListID: list2.ID, GameID: 1})
	listRepo.AddItem(models.GameListItem{ListID: list1.ID, GameID: 2}) // different game

	lists, err := repo.GetListsContainingGame(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(lists) != 2 {
		t.Fatalf("expected 2 lists containing game 1, got %d", len(lists))
	}
}

func TestCommunityRepository_GetListsContainingGame_Empty(t *testing.T) {
	db := setupTestDB()
	repo := &CommunityRepository{db: db}

	lists, err := repo.GetListsContainingGame(99)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(lists) != 0 {
		t.Fatalf("expected 0 lists, got %d", len(lists))
	}
}

func TestCommunityRepository_GetPlaylistUsers(t *testing.T) {
	db := setupTestDB()
	repo := &CommunityRepository{db: db}

	// Create users directly
	user1 := models.User{Username: "alice", Email: "alice@test.com", PasswordHash: "x"}
	user2 := models.User{Username: "bob", Email: "bob@test.com", PasswordHash: "x"}
	db.Create(&user1)
	db.Create(&user2)

	db.Create(&models.Playlist{UserID: user1.ID, GameID: 1, Status: "completed", HoursPlayed: 40})
	db.Create(&models.Playlist{UserID: user2.ID, GameID: 1, Status: "playing", HoursPlayed: 10})
	db.Create(&models.Playlist{UserID: user1.ID, GameID: 2, Status: "want_to_play"}) // different game

	users, err := repo.GetPlaylistUsers(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(users) != 2 {
		t.Fatalf("expected 2 playlist users for game 1, got %d", len(users))
	}

	// Verify fields are populated
	found := map[string]bool{}
	for _, u := range users {
		found[u.Username] = true
		if u.UserID == 0 {
			t.Fatal("expected non-zero user_id")
		}
		if u.Status == "" {
			t.Fatal("expected non-empty status")
		}
	}
	if !found["alice"] || !found["bob"] {
		t.Fatal("expected both alice and bob in playlist users")
	}
}

func TestCommunityRepository_GetPlaylistUsers_Empty(t *testing.T) {
	db := setupTestDB()
	repo := &CommunityRepository{db: db}

	users, err := repo.GetPlaylistUsers(99)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(users) != 0 {
		t.Fatalf("expected 0 playlist users, got %d", len(users))
	}
}

func TestCommunityRepository_GetPlaylistUsers_IsolatedByGame(t *testing.T) {
	db := setupTestDB()
	repo := &CommunityRepository{db: db}

	user1 := models.User{Username: "carol", Email: "carol@test.com", PasswordHash: "x"}
	db.Create(&user1)
	db.Create(&models.Playlist{UserID: user1.ID, GameID: 2, Status: "playing"})

	users, err := repo.GetPlaylistUsers(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(users) != 0 {
		t.Fatalf("expected 0 users for game 1 (carol only has game 2), got %d", len(users))
	}
}
