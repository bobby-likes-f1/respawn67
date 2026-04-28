package routes

import (
	"net/http"
	"respawn67/models"
	"respawn67/services"
	"respawn67/utils"
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
	gamesRoutes.PUT("/:id", router.UpdateGame)
	gamesRoutes.DELETE("/:id", router.DeleteGame)
	gamesRoutes.PUT("/:id/duration", router.UpsertDuration)
	gamesRoutes.DELETE("/:id/duration", router.DeleteDuration)

	// Sprint 4 — game-scoped routes
	gamesRoutes.GET("/:id/guides", guidesRouter.GetByGameID)
	gamesRoutes.POST("/:id/guides", guidesRouter.Create)
	gamesRoutes.PUT("/:id/guides/:guideId", guidesRouter.Update)
	gamesRoutes.DELETE("/:id/guides/:guideId", guidesRouter.Delete)
	gamesRoutes.GET("/:id/community", communityRouter.GetGameCommunityHub)
}

func (r *GamesRouter) GetAll(c *gin.Context) {
	games, err := r.service.GetAll()

	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, games)
}

func (r *GamesRouter) GetGameByID(c *gin.Context) {
	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid game id"})
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
	if !utils.RequireAuth(c) {
		return
	}

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

func (r *GamesRouter) UpdateGame(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}

	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid game id"})
		return
	}

	var updatedGame models.Game
	if err := c.ShouldBindJSON(&updatedGame); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	game, err := r.service.UpdateGame(uint(id), updatedGame)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, game)
}

func (r *GamesRouter) DeleteGame(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}

	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid game id",
		})
		return
	}

	if err := r.service.DeleteGame(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "game deleted successfully"})
}

func (r *GamesRouter) UpsertDuration(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid game id"})
		return
	}

	var body struct {
		MainStoryHours     *float64 `json:"main_story_hours"`
		MainPlusSidesHours *float64 `json:"main_plus_sides_hours"`
		CompletionistHours *float64 `json:"completionist_hours"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	duration, err := r.service.UpsertDuration(uint(id), body.MainStoryHours, body.MainPlusSidesHours, body.CompletionistHours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, duration)
}

func (r *GamesRouter) DeleteDuration(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid game id"})
		return
	}

	if err := r.service.DeleteDuration(uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "duration not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "duration deleted successfully"})
}
