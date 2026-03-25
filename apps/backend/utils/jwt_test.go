package utils

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestGenerateToken(t *testing.T) {
	token, err := GenerateToken(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if token == "" {
		t.Fatal("expected token to not be empty")
	}
}

func TestValidateToken_Valid(t *testing.T) {
	token, _ := GenerateToken(42)

	userID, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if userID != 42 {
		t.Fatalf("expected user ID 42, got %d", userID)
	}
}

func TestValidateToken_DifferentUserIDs(t *testing.T) {
	token1, _ := GenerateToken(1)
	token2, _ := GenerateToken(2)

	id1, _ := ValidateToken(token1)
	id2, _ := ValidateToken(token2)

	if id1 != 1 {
		t.Fatalf("expected user ID 1, got %d", id1)
	}
	if id2 != 2 {
		t.Fatalf("expected user ID 2, got %d", id2)
	}
}

func TestValidateToken_InvalidString(t *testing.T) {
	_, err := ValidateToken("not.a.real.token")
	if err == nil {
		t.Fatal("expected error for invalid token, got nil")
	}
}

func TestValidateToken_EmptyString(t *testing.T) {
	_, err := ValidateToken("")
	if err == nil {
		t.Fatal("expected error for empty token, got nil")
	}
}

func TestValidateToken_TamperedPayload(t *testing.T) {
	token, _ := GenerateToken(1)

	// Tamper with the token by changing a character in the middle
	tampered := token[:len(token)/2] + "X" + token[len(token)/2+1:]

	_, err := ValidateToken(tampered)
	if err == nil {
		t.Fatal("expected error for tampered token, got nil")
	}
}

func TestValidateToken_ExpiredToken(t *testing.T) {
	// Create a token that's already expired
	claims := jwt.MapClaims{
		"user_id": float64(1),
		"exp":     time.Now().Add(-1 * time.Hour).Unix(),
		"iat":     time.Now().Add(-2 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		t.Fatalf("failed to create expired token: %v", err)
	}

	_, err = ValidateToken(tokenString)
	if err == nil {
		t.Fatal("expected error for expired token, got nil")
	}
}

func TestValidateToken_WrongSigningMethod(t *testing.T) {
	// Create a token with a different signing method (none)
	claims := jwt.MapClaims{
		"user_id": float64(1),
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodNone, claims)
	tokenString, _ := token.SignedString(jwt.UnsafeAllowNoneSignatureType)

	_, err := ValidateToken(tokenString)
	if err == nil {
		t.Fatal("expected error for token with wrong signing method, got nil")
	}
}
