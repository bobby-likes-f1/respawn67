package routes

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"respawn67/services"
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
		gamesRouter = NewGamesRouter() // Initialize only when needed
	}
	return gamesRouter
}

func addGameRoutes(rg *gin.RouterGroup) {
	router := GetGamesRouter()

	gamesRoutes := rg.Group("/games")

	gamesRoutes.GET("/", router.GetAll)
	// gamesRoutes.POST("/", router.postGames)

	// gamesRoutes.GET("/:id", router.getGameByID)
}

func (r *GamesRouter) GetAll(c *gin.Context) {
	games, err := r.service.GetAll()
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, games)
}

// func (r *GamesRouter) postGames(c *gin.Context) {
// 	var newGame game

// 	// Call BindJSON to bind the received JSON to
// 	// newGame.
// 	if err := c.BindJSON(&newGame); err != nil {
// 		return
// 	}

// 	// Add the new game to the slice.
// 	games = append(games, newGame)
// 	c.IndentedJSON(http.StatusCreated, newGame)
// }

// func (r *GamesRouter) getGameByID(c *gin.Context) {
// 	id := c.Param("id")

// 	// Loop over the list of games, looking for
// 	// an game whose ID value matches the parameter.
// 	for _, g := range games {
// 		if g.ID == id {
// 			c.IndentedJSON(http.StatusOK, g)
// 			return
// 		}
// 	}
// 	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
// }
