package utils

import "testing"

func TestHashPassword(t *testing.T) {
	hash, err := HashPassword("secret123")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if hash == "" {
		t.Fatal("expected hash to not be empty")
	}
	if hash == "secret123" {
		t.Fatal("hash should not equal the plain text password")
	}
}

func TestCheckPassword_Correct(t *testing.T) {
	hash, _ := HashPassword("secret123")

	if !CheckPassword("secret123", hash) {
		t.Fatal("expected password to match hash")
	}
}

func TestCheckPassword_Wrong(t *testing.T) {
	hash, _ := HashPassword("secret123")

	if CheckPassword("wrongpassword", hash) {
		t.Fatal("expected wrong password to not match hash")
	}
}

func TestCheckPassword_Empty(t *testing.T) {
	hash, _ := HashPassword("secret123")

	if CheckPassword("", hash) {
		t.Fatal("expected empty password to not match hash")
	}
}

func TestHashPassword_DifferentHashesForSamePassword(t *testing.T) {
	hash1, _ := HashPassword("secret123")
	hash2, _ := HashPassword("secret123")

	if hash1 == hash2 {
		t.Fatal("expected different hashes for the same password (bcrypt uses random salt)")
	}
}
