package repositories

import (
	"respawn67/database"
	"respawn67/models"

	"gorm.io/gorm"
)

type GuidesRepository struct {
	db *gorm.DB
}

func NewGuidesRepository() *GuidesRepository {
	return &GuidesRepository{db: database.GetDB()}
}

func (r *GuidesRepository) GetByGameID(gameID uint) ([]models.Guide, error) {
	var guides []models.Guide
	result := r.db.Where("game_id = ?", gameID).Find(&guides)
	return guides, result.Error
}

func (r *GuidesRepository) GetByID(id uint) (models.Guide, error) {
	var guide models.Guide
	result := r.db.First(&guide, id)
	return guide, result.Error
}

func (r *GuidesRepository) Create(guide models.Guide) (models.Guide, error) {
	result := r.db.Create(&guide)
	return guide, result.Error
}

func (r *GuidesRepository) Update(id uint, guide models.Guide) (models.Guide, error) {
	var existing models.Guide
	if result := r.db.First(&existing, id); result.Error != nil {
		return existing, result.Error
	}
	result := r.db.Model(&existing).Updates(guide)
	return existing, result.Error
}

func (r *GuidesRepository) Delete(id uint) error {
	result := r.db.Unscoped().Delete(&models.Guide{}, id)
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return result.Error
}
