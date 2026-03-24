package repositories

import (
	"respawn67/database"
	"respawn67/models"

	"gorm.io/gorm"
)

type UsersRepository struct {
	db *gorm.DB
}

func NewUsersRepository() *UsersRepository {
	return &UsersRepository{db: database.GetDB()}
}

func (r *UsersRepository) GetAll() ([]models.User, error) {
	var users []models.User
	result := r.db.Find(&users)
	return users, result.Error
}

func (r *UsersRepository) CreateUser(user models.User) (models.User, error) {
	result := r.db.Create(&user)
	return user, result.Error
}

func (r *UsersRepository) GetUserByID(id uint) (models.User, error) {
	var user models.User
	result := r.db.First(&user, id)
	return user, result.Error
}

func (r *UsersRepository) UpdateUser(id uint, user models.User) (models.User, error) {
	var existing models.User
	if result := r.db.First(&existing, id); result.Error != nil {
		return existing, result.Error
	}

	result := r.db.Model(&existing).Updates(user)
	return existing, result.Error
}

func (r *UsersRepository) DeleteUser(id uint) error {
	result := r.db.Delete(&models.User{}, id)
	return result.Error
}
