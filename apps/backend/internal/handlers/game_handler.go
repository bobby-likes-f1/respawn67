package handlers

import (
	"net/http"
	"strconv"

	"backend/internal/models"
	"backend/internal/repository"

	"github.com/gin-gonic/gin"
)

type GameHandler struct {
	repo *repository.GameRepository
}

func NewGameHandler(repo *repository.GameRepository) *GameHandler {
	return &GameHandler{repo: repo}
}

// GetGames returns all games
func (h *GameHandler) GetGames(c *gin.Context) {
	games, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, games)
}

// GetGameByID returns a single game by ID
func (h *GameHandler) GetGameByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid game ID"})
		return
	}

	game, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, game)
}

// CreateGame creates a new game
func (h *GameHandler) CreateGame(c *gin.Context) {
	var game models.Game
	if err := c.BindJSON(&game); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := h.repo.Create(&game)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	game.ID = int(id)
	c.JSON(http.StatusCreated, game)
}

// UpdateGame updates an existing game
func (h *GameHandler) UpdateGame(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid game ID"})
		return
	}

	var game models.Game
	if err := c.BindJSON(&game); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.Update(id, &game); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	game.ID = id
	c.JSON(http.StatusOK, game)
}

// DeleteGame deletes a game
func (h *GameHandler) DeleteGame(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid game ID"})
		return
	}

	if err := h.repo.Delete(id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "game deleted successfully"})
}
