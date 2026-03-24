package routes

import (
	"net/http"
	"respawn67/models"
	"respawn67/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PlaylistRouter struct {
	service *services.PlaylistService
}

func NewPlaylistRouter() *PlaylistRouter {
	return &PlaylistRouter{service: services.NewPlaylistService()}
}

var playlistRouter *PlaylistRouter

func GetPlaylistRouter() *PlaylistRouter {
	if playlistRouter == nil {
		playlistRouter = NewPlaylistRouter()
	}
	return playlistRouter
}

func addPlaylistRoutes(rg *gin.RouterGroup) {
	router := GetPlaylistRouter()

	playlistRoutes := rg.Group("/users/:id/playlist")

	playlistRoutes.GET("/", router.GetByUserID)
	playlistRoutes.GET("/games", router.GetGamesByUserID)
	playlistRoutes.POST("/", router.AddGame)
	playlistRoutes.PUT("/:entryId", router.UpdateStatus)
	playlistRoutes.PUT("/game/:gameId", router.UpdateStatusByGame)
	playlistRoutes.DELETE("/:entryId", router.RemoveGame)
	playlistRoutes.DELETE("/game/:gameId", router.RemoveByGame)
}

func (r *PlaylistRouter) GetByUserID(c *gin.Context) {
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

func (r *PlaylistRouter) GetGamesByUserID(c *gin.Context) {
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

func (r *PlaylistRouter) AddGame(c *gin.Context) {
	idStr := c.Param("id")

	userID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid user id",
		})
		return
	}

	var newEntry models.Playlist

	if err := c.ShouldBindJSON(&newEntry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	newEntry.UserID = uint(userID)

	newEntry, err = r.service.AddGame(newEntry)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.IndentedJSON(http.StatusCreated, newEntry)
}

func (r *PlaylistRouter) UpdateStatus(c *gin.Context) {
	idStr := c.Param("entryId")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid playlist entry id",
		})
		return
	}

	var body struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	entry, err := r.service.UpdateStatus(uint(id), body.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, entry)
}

func (r *PlaylistRouter) UpdateStatusByGame(c *gin.Context) {
	idStr := c.Param("id")
	userID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	gameIDStr := c.Param("gameId")
	gameID, err := strconv.Atoi(gameIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid game id"})
		return
	}

	var body struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body", "error": err.Error()})
		return
	}

	entry, err := r.service.UpdateStatusByUserAndGame(uint(userID), uint(gameID), body.Status)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "game not found in playlist"})
		return
	}

	c.JSON(http.StatusOK, entry)
}

func (r *PlaylistRouter) RemoveGame(c *gin.Context) {
	idStr := c.Param("entryId")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid playlist entry id",
		})
		return
	}

	err = r.service.RemoveGame(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "removed from playlist"})
}

func (r *PlaylistRouter) RemoveByGame(c *gin.Context) {
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
			"message": "game not found in playlist",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "game removed from playlist"})
}
