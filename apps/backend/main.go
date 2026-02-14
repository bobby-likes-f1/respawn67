package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type game struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	Developer    string `json:"developer"`
	Release_Year int32  `json:"release_year"`
}

var games = []game{
	{ID: "1", Title: "No Man's Sky", Developer: "Hello Games", Release_Year: 2016},
	{ID: "2", Title: "Cyberpunk 2077", Developer: "CD PROJEKT RED", Release_Year: 2020},
	{ID: "3", Title: "HELLDIVERS™ 2", Developer: "Arrowhead Game Studios", Release_Year: 2024},
}

func main() {
	router := gin.Default()
	router.GET("/games", getGames)
	router.GET("/games/:id", getGameByID)
	router.POST("/games", postGames)

	router.Run("localhost:8080")
}

func getGames(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, games)
}

func postGames(c *gin.Context) {
	var newGame game

	// Call BindJSON to bind the received JSON to
	// newGame.
	if err := c.BindJSON(&newGame); err != nil {
		return
	}

	// Add the new game to the slice.
	games = append(games, newGame)
	c.IndentedJSON(http.StatusCreated, newGame)
}

func getGameByID(c *gin.Context) {
	id := c.Param("id")

	// Loop over the list of games, looking for
	// an game whose ID value matches the parameter.
	for _, g := range games {
		if g.ID == id {
			c.IndentedJSON(http.StatusOK, g)
			return
		}
	}
	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
}
