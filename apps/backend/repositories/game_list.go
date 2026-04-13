package repositories

import (
	"respawn67/database"
	"respawn67/models"

	"gorm.io/gorm"
)

type GameListRepository struct {
	db *gorm.DB
}

func NewGameListRepository() *GameListRepository {
	return &GameListRepository{db: database.GetDB()}
}

// ── List CRUD ──

func (r *GameListRepository) Create(list models.GameList) (models.GameList, error) {
	result := r.db.Create(&list)
	return list, result.Error
}

func (r *GameListRepository) GetByID(id uint) (models.GameList, error) {
	var list models.GameList
	result := r.db.First(&list, id)
	return list, result.Error
}

func (r *GameListRepository) GetByUserID(userID uint) ([]models.GameList, error) {
	var lists []models.GameList
	result := r.db.Where("user_id = ?", userID).Find(&lists)
	return lists, result.Error
}

func (r *GameListRepository) GetAll() ([]models.GameList, error) {
	var lists []models.GameList
	result := r.db.Find(&lists)
	return lists, result.Error
}

func (r *GameListRepository) Update(id uint, name string, description *string) (models.GameList, error) {
	var list models.GameList
	result := r.db.First(&list, id)
	if result.Error != nil {
		return list, result.Error
	}

	list.Name = name
	list.Description = description
	r.db.Save(&list)
	return list, nil
}

func (r *GameListRepository) Delete(id uint) error {
	result := r.db.Unscoped().Delete(&models.GameList{}, id)
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return result.Error
}

// ── List Item CRUD ──

func (r *GameListRepository) AddItem(item models.GameListItem) (models.GameListItem, error) {
	result := r.db.Create(&item)
	return item, result.Error
}

func (r *GameListRepository) GetItemsByListID(listID uint) ([]models.GameListItem, error) {
	var items []models.GameListItem
	result := r.db.Where("list_id = ?", listID).Find(&items)
	return items, result.Error
}

func (r *GameListRepository) FindItem(listID uint, gameID uint) (models.GameListItem, error) {
	var item models.GameListItem
	result := r.db.Where("list_id = ? AND game_id = ?", listID, gameID).First(&item)
	return item, result.Error
}

func (r *GameListRepository) RemoveItem(id uint) error {
	result := r.db.Unscoped().Delete(&models.GameListItem{}, id)
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return result.Error
}

func (r *GameListRepository) RemoveItemByListAndGame(listID uint, gameID uint) error {
	result := r.db.Unscoped().Where("list_id = ? AND game_id = ?", listID, gameID).Delete(&models.GameListItem{})
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return result.Error
}

func (r *GameListRepository) GetGamesByListID(listID uint) ([]models.Game, error) {
	var games []models.Game
	result := r.db.Raw(
		"SELECT games.* FROM games INNER JOIN game_list_items ON game_list_items.game_id = games.id WHERE game_list_items.list_id = ? AND game_list_items.deleted_at IS NULL AND games.deleted_at IS NULL",
		listID,
	).Scan(&games)
	return games, result.Error
}

func (r *GameListRepository) DeleteItemsByListID(listID uint) error {
	result := r.db.Unscoped().Where("list_id = ?", listID).Delete(&models.GameListItem{})
	return result.Error
}
