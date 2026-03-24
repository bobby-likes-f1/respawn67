package routes

import (
	"net/http"
	"respawn67/models"
	"respawn67/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FavoritesRouter struct {
	service *services.FavoritesService
}

func NewFavoritesRouter() *FavoritesRouter {
	return &FavoritesRouter{service: services.NewFavoritesService()}
}

var favoritesRouter *FavoritesRouter

func GetFavoritesRouter() *FavoritesRouter {
	if favoritesRouter == nil {
		favoritesRouter = NewFavoritesRouter()
	}
	return favoritesRouter
}

func addFavoritesRoutes(rg *gin.RouterGroup) {
	router := GetFavoritesRouter()

	favoritesRoutes := rg.Group("/users/:id/favorites")

	favoritesRoutes.GET("/", router.GetByUserID)
	favoritesRoutes.GET("/games", router.GetGamesByUserID)
	favoritesRoutes.POST("/", router.AddFavorite)
	favoritesRoutes.DELETE("/:entryId", router.RemoveFavorite)
	favoritesRoutes.DELETE("/game/:gameId", router.RemoveByGame)
}

func (r *FavoritesRouter) GetByUserID(c *gin.Context) {
	idStr := c.Param("id")

	userID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid user id",
		})
		return
	}

	entries, err := r.service.GetByUserID(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, entries)
}

func (r *FavoritesRouter) GetGamesByUserID(c *gin.Context) {
	idStr := c.Param("id")

	userID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid user id",
		})
		return
	}

	games, err := r.service.GetGamesByUserID(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, games)
}

func (r *FavoritesRouter) AddFavorite(c *gin.Context) {
	idStr := c.Param("id")

	userID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid user id",
		})
		return
	}

	var newEntry models.Favorite

	if err := c.ShouldBindJSON(&newEntry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	newEntry.UserID = uint(userID)

	newEntry, err = r.service.AddFavorite(newEntry)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.IndentedJSON(http.StatusCreated, newEntry)
}

func (r *FavoritesRouter) RemoveFavorite(c *gin.Context) {
	idStr := c.Param("entryId")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid favorite entry id",
		})
		return
	}

	err = r.service.RemoveFavorite(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "removed from favorites"})
}

func (r *FavoritesRouter) RemoveByGame(c *gin.Context) {
	idStr := c.Param("id")

	userID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid user id",
		})
		return
	}

	gameIDStr := c.Param("gameId")

	gameID, err := strconv.Atoi(gameIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid game id",
		})
		return
	}

	err = r.service.RemoveByUserAndGame(uint(userID), uint(gameID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "game not found in favorites",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "game removed from favorites"})
}
