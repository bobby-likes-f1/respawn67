package services

import (
	"errors"
	"respawn67/models"
	"respawn67/repositories"
	"respawn67/utils"
)

type AuthService struct {
	repo *repositories.UsersRepository
}

func NewAuthService() *AuthService {
	return &AuthService{repo: repositories.NewUsersRepository()}
}

func (s *AuthService) Signup(username string, email string, password string) (models.User, error) {
	if username == "" || email == "" || password == "" {
		return models.User{}, errors.New("username, email, and password are required")
	}

	if len(password) < 6 {
		return models.User{}, errors.New("password must be at least 6 characters")
	}

	hash, err := utils.HashPassword(password)
	if err != nil {
		return models.User{}, errors.New("failed to hash password")
	}

	user := models.User{
		Username:     username,
		Email:        email,
		PasswordHash: hash,
	}

	return s.repo.CreateUser(user)
}

func (s *AuthService) Login(email string, password string) (string, models.User, error) {
	if email == "" || password == "" {
		return "", models.User{}, errors.New("email and password are required")
	}

	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return "", models.User{}, errors.New("invalid email or password")
	}

	if !utils.CheckPassword(password, user.PasswordHash) {
		return "", models.User{}, errors.New("invalid email or password")
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return "", models.User{}, errors.New("failed to generate token")
	}

	return token, user, nil
}
