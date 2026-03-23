package services

import (
	"respawn67/models"
	"respawn67/repositories"
)

type UsersService struct {
	repo *repositories.UsersRepository
}

func NewUsersService() *UsersService {
	return &UsersService{repo: repositories.NewUsersRepository()}
}

func (s *UsersService) GetAll() ([]models.User, error) {
	return s.repo.GetAll()
}

func (s *UsersService) GetUserByID(id uint) (models.User, error) {
	return s.repo.GetUserByID(id)
}

func (s *UsersService) CreateUser(user models.User) (models.User, error) {
	return s.repo.CreateUser(user)
}

func (s *UsersService) UpdateUser(id uint, user models.User) (models.User, error) {
	return s.repo.UpdateUser(id, user)
}

func (s *UsersService) DeleteUser(id uint) error {
	return s.repo.DeleteUser(id)
}
