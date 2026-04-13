package services

import (
	"errors"
	"respawn67/models"
	"respawn67/repositories"
)

type GameListService struct {
	repo *repositories.GameListRepository
}

func NewGameListService() *GameListService {
	return &GameListService{repo: repositories.NewGameListRepository()}
}

// ── List operations ──

func (s *GameListService) Create(list models.GameList) (models.GameList, error) {
	if list.Name == "" {
		return models.GameList{}, errors.New("list name is required")
	}
	return s.repo.Create(list)
}

func (s *GameListService) GetByID(id uint) (models.GameList, error) {
	return s.repo.GetByID(id)
}

func (s *GameListService) GetByUserID(userID uint) ([]models.GameList, error) {
	return s.repo.GetByUserID(userID)
}

func (s *GameListService) GetAll() ([]models.GameList, error) {
	return s.repo.GetAll()
}

func (s *GameListService) Update(id uint, name string, description *string) (models.GameList, error) {
	if name == "" {
		return models.GameList{}, errors.New("list name is required")
	}
	return s.repo.Update(id, name, description)
}

func (s *GameListService) Delete(id uint) error {
	// Remove all items in the list first, then delete the list itself
	err := s.repo.DeleteItemsByListID(id)
	if err != nil {
		return err
	}
	return s.repo.Delete(id)
}

// ── Item operations ──

func (s *GameListService) AddItem(listID uint, gameID uint) (models.GameListItem, error) {
	// Check if game is already in this list
	_, err := s.repo.FindItem(listID, gameID)
	if err == nil {
		return models.GameListItem{}, errors.New("game already in list")
	}

	return s.repo.AddItem(models.GameListItem{ListID: listID, GameID: gameID})
}

func (s *GameListService) GetItemsByListID(listID uint) ([]models.GameListItem, error) {
	return s.repo.GetItemsByListID(listID)
}

func (s *GameListService) GetGamesByListID(listID uint) ([]models.Game, error) {
	return s.repo.GetGamesByListID(listID)
}

func (s *GameListService) RemoveItem(id uint) error {
	return s.repo.RemoveItem(id)
}

func (s *GameListService) RemoveItemByListAndGame(listID uint, gameID uint) error {
	return s.repo.RemoveItemByListAndGame(listID, gameID)
}
