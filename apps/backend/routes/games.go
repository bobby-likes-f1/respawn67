package routes

import (
	"net/http"
	"respawn67/models"
	"respawn67/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type GamesRouter struct {
	service *services.GamesService
}

func NewGamesRouter() *GamesRouter {
	return &GamesRouter{service: services.NewGamesService()}
}

var gamesRouter *GamesRouter

func GetGamesRouter() *GamesRouter {
	if gamesRouter == nil {
		gamesRouter = NewGamesRouter()
	}
	return gamesRouter
}

func addGameRoutes(rg *gin.RouterGroup) {
	router := GetGamesRouter()

	gamesRoutes := rg.Group("/games")

	gamesRoutes.GET("/", router.GetAll)
	gamesRoutes.GET("/:id", router.GetGameByID)
	gamesRoutes.POST("/", router.PostGames)
}

func (r *GamesRouter) GetAll(c *gin.Context) {
	games, err := r.service.GetAll()

	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, games)
}

func (r *GamesRouter) GetGameByID(c *gin.Context) {
	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid game id",
		})
		return
	}

	game, err := r.service.GetGameByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, game)
}

func (r *GamesRouter) PostGames(c *gin.Context) {
	var newGame models.Game

	if err := c.ShouldBindJSON(&newGame); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	newGame, err := r.service.CreateGame(newGame)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.IndentedJSON(http.StatusCreated, newGame)
}
