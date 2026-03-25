package repositories

import (
	"respawn67/models"
	"testing"
)

func TestUsersRepository_CreateUser(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	user := models.User{Username: "alice", Email: "alice@test.com", PasswordHash: "hash123"}

	created, err := repo.CreateUser(user)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if created.ID == 0 {
		t.Fatal("expected user to have an ID after creation")
	}
	if created.Username != "alice" {
		t.Fatalf("expected username 'alice', got '%s'", created.Username)
	}
}

func TestUsersRepository_GetAll(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	repo.CreateUser(models.User{Username: "alice", Email: "alice@test.com", PasswordHash: "hash"})
	repo.CreateUser(models.User{Username: "bob", Email: "bob@test.com", PasswordHash: "hash"})

	users, err := repo.GetAll()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(users) != 2 {
		t.Fatalf("expected 2 users, got %d", len(users))
	}
}

func TestUsersRepository_GetUserByID(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	created, _ := repo.CreateUser(models.User{Username: "alice", Email: "alice@test.com", PasswordHash: "hash"})

	found, err := repo.GetUserByID(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if found.Username != "alice" {
		t.Fatalf("expected username 'alice', got '%s'", found.Username)
	}
	if found.Email != "alice@test.com" {
		t.Fatalf("expected email 'alice@test.com', got '%s'", found.Email)
	}
}

func TestUsersRepository_GetUserByID_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	_, err := repo.GetUserByID(999)
	if err == nil {
		t.Fatal("expected error for non-existent user, got nil")
	}
}

func TestUsersRepository_FindByEmail(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	repo.CreateUser(models.User{Username: "alice", Email: "alice@test.com", PasswordHash: "hash"})

	found, err := repo.FindByEmail("alice@test.com")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if found.Username != "alice" {
		t.Fatalf("expected username 'alice', got '%s'", found.Username)
	}
}

func TestUsersRepository_FindByEmail_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	_, err := repo.FindByEmail("nobody@test.com")
	if err == nil {
		t.Fatal("expected error for non-existent email, got nil")
	}
}

func TestUsersRepository_UniqueEmail(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	repo.CreateUser(models.User{Username: "alice", Email: "alice@test.com", PasswordHash: "hash"})

	_, err := repo.CreateUser(models.User{Username: "alice2", Email: "alice@test.com", PasswordHash: "hash"})
	if err == nil {
		t.Fatal("expected error for duplicate email, got nil")
	}
}

func TestUsersRepository_UniqueUsername(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	repo.CreateUser(models.User{Username: "alice", Email: "alice@test.com", PasswordHash: "hash"})

	_, err := repo.CreateUser(models.User{Username: "alice", Email: "different@test.com", PasswordHash: "hash"})
	if err == nil {
		t.Fatal("expected error for duplicate username, got nil")
	}
}

func TestUsersRepository_UpdateUser(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	created, _ := repo.CreateUser(models.User{Username: "alice", Email: "alice@test.com", PasswordHash: "hash"})

	updated, err := repo.UpdateUser(created.ID, models.User{Username: "alice_updated"})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if updated.Username != "alice_updated" {
		t.Fatalf("expected username 'alice_updated', got '%s'", updated.Username)
	}
}

func TestUsersRepository_UpdateUser_NotFound(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	_, err := repo.UpdateUser(999, models.User{Username: "ghost"})
	if err == nil {
		t.Fatal("expected error for non-existent user, got nil")
	}
}

func TestUsersRepository_DeleteUser(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	created, _ := repo.CreateUser(models.User{Username: "alice", Email: "alice@test.com", PasswordHash: "hash"})

	err := repo.DeleteUser(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	_, err = repo.GetUserByID(created.ID)
	if err == nil {
		t.Fatal("expected error after deletion, got nil")
	}
}

func TestUsersRepository_DeleteUser_StillReturnsOthers(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	user1, _ := repo.CreateUser(models.User{Username: "alice", Email: "alice@test.com", PasswordHash: "hash"})
	user2, _ := repo.CreateUser(models.User{Username: "bob", Email: "bob@test.com", PasswordHash: "hash"})

	repo.DeleteUser(user2.ID)

	users, _ := repo.GetAll()
	if len(users) != 1 {
		t.Fatalf("expected 1 user remaining, got %d", len(users))
	}
	if users[0].ID != user1.ID {
		t.Fatalf("expected remaining user to be '%s'", user1.Username)
	}
}

func TestUsersRepository_FindByEmail_ReturnsPasswordHash(t *testing.T) {
	db := setupTestDB()
	repo := &UsersRepository{db: db}

	repo.CreateUser(models.User{Username: "alice", Email: "alice@test.com", PasswordHash: "supersecret"})

	found, _ := repo.FindByEmail("alice@test.com")
	if found.PasswordHash != "supersecret" {
		t.Fatalf("expected password hash 'supersecret', got '%s'", found.PasswordHash)
	}
}
