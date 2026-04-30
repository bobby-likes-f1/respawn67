package repositories

import (
	"respawn67/database"
	"respawn67/models"

	"gorm.io/gorm"
)

type ArticlesRepository struct {
	db *gorm.DB
}

func NewArticlesRepository() *ArticlesRepository {
	return &ArticlesRepository{db: database.GetDB()}
}

func (r *ArticlesRepository) GetAll() ([]models.Article, error) {
	var articles []models.Article
	result := r.db.Find(&articles)
	return articles, result.Error
}

func (r *ArticlesRepository) GetByID(id uint) (models.Article, error) {
	var article models.Article
	result := r.db.First(&article, id)
	return article, result.Error
}

func (r *ArticlesRepository) Create(article models.Article) (models.Article, error) {
	result := r.db.Create(&article)
	return article, result.Error
}

func (r *ArticlesRepository) Update(id uint, article models.Article) (models.Article, error) {
	var existing models.Article
	if result := r.db.First(&existing, id); result.Error != nil {
		return existing, result.Error
	}
	result := r.db.Model(&existing).Updates(article)
	return existing, result.Error
}

func (r *ArticlesRepository) Delete(id uint) error {
	result := r.db.Delete(&models.Article{}, id)
	return result.Error
}
