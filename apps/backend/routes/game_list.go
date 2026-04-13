package routes

import (
	"net/http"
	"respawn67/models"
	"respawn67/services"
	"respawn67/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type GameListRouter struct {
	service *services.GameListService
}

func NewGameListRouter() *GameListRouter {
	return &GameListRouter{service: services.NewGameListService()}
}

var gameListRouter *GameListRouter

func GetGameListRouter() *GameListRouter {
	if gameListRouter == nil {
		gameListRouter = NewGameListRouter()
	}
	return gameListRouter
}

func addGameListRoutes(rg *gin.RouterGroup) {
	router := GetGameListRouter()

	// Public list browsing
	lists := rg.Group("/lists")
	lists.GET("/", router.GetAllLists)
	lists.GET("/:listId", router.GetListByID)
	lists.GET("/:listId/items", router.GetListItems)
	lists.GET("/:listId/games", router.GetListGames)

	// User-scoped list management
	userLists := rg.Group("/users/:id/lists")
	userLists.GET("/", router.GetListsByUserID)
	userLists.POST("/", router.CreateList)
	userLists.PUT("/:listId", router.UpdateList)
	userLists.DELETE("/:listId", router.DeleteList)

	// List item management (scoped under user for ownership)
	userLists.POST("/:listId/items", router.AddItem)
	userLists.DELETE("/:listId/items/:itemId", router.RemoveItem)
	userLists.DELETE("/:listId/games/:gameId", router.RemoveItemByGame)
}

// ── Public endpoints ──

func (r *GameListRouter) GetAllLists(c *gin.Context) {
	lists, err := r.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, lists)
}

func (r *GameListRouter) GetListByID(c *gin.Context) {
	listID, err := strconv.Atoi(c.Param("listId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid list id"})
		return
	}

	list, err := r.service.GetByID(uint(listID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "list not found"})
		return
	}

	c.JSON(http.StatusOK, list)
}

func (r *GameListRouter) GetListItems(c *gin.Context) {
	listID, err := strconv.Atoi(c.Param("listId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid list id"})
		return
	}

	items, err := r.service.GetItemsByListID(uint(listID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, items)
}

func (r *GameListRouter) GetListGames(c *gin.Context) {
	listID, err := strconv.Atoi(c.Param("listId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid list id"})
		return
	}

	games, err := r.service.GetGamesByListID(uint(listID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, games)
}

func (r *GameListRouter) GetListsByUserID(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	lists, err := r.service.GetByUserID(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, lists)
}

// ── Owner-only endpoints ──

func (r *GameListRouter) CreateList(c *gin.Context) {
	if !utils.CheckOwnership(c, "id") {
		return
	}

	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	var body struct {
		Name        string  `json:"name"`
		Description *string `json:"description"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	list, err := r.service.Create(models.GameList{
		UserID:      uint(userID),
		Name:        body.Name,
		Description: body.Description,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, list)
}

func (r *GameListRouter) UpdateList(c *gin.Context) {
	if !utils.CheckOwnership(c, "id") {
		return
	}

	listID, err := strconv.Atoi(c.Param("listId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid list id"})
		return
	}

	// Verify the list belongs to this user
	list, err := r.service.GetByID(uint(listID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "list not found"})
		return
	}

	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	if list.UserID != uint(userID) {
		c.JSON(http.StatusForbidden, gin.H{"message": "you cannot modify another user's list"})
		return
	}

	var body struct {
		Name        string  `json:"name"`
		Description *string `json:"description"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	updated, err := r.service.Update(uint(listID), body.Name, body.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updated)
}

func (r *GameListRouter) DeleteList(c *gin.Context) {
	if !utils.CheckOwnership(c, "id") {
		return
	}

	listID, err := strconv.Atoi(c.Param("listId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid list id"})
		return
	}

	// Verify the list belongs to this user
	list, err := r.service.GetByID(uint(listID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "list not found"})
		return
	}

	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	if list.UserID != uint(userID) {
		c.JSON(http.StatusForbidden, gin.H{"message": "you cannot delete another user's list"})
		return
	}

	if err := r.service.Delete(uint(listID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "list deleted successfully"})
}

func (r *GameListRouter) AddItem(c *gin.Context) {
	if !utils.CheckOwnership(c, "id") {
		return
	}

	listID, err := strconv.Atoi(c.Param("listId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid list id"})
		return
	}

	// Verify the list belongs to this user
	list, err := r.service.GetByID(uint(listID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "list not found"})
		return
	}

	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	if list.UserID != uint(userID) {
		c.JSON(http.StatusForbidden, gin.H{"message": "you cannot modify another user's list"})
		return
	}

	var body struct {
		GameID uint `json:"game_id"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	item, err := r.service.AddItem(uint(listID), body.GameID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, item)
}

func (r *GameListRouter) RemoveItem(c *gin.Context) {
	if !utils.CheckOwnership(c, "id") {
		return
	}

	listID, err := strconv.Atoi(c.Param("listId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid list id"})
		return
	}

	// Verify the list belongs to this user
	list, err := r.service.GetByID(uint(listID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "list not found"})
		return
	}

	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	if list.UserID != uint(userID) {
		c.JSON(http.StatusForbidden, gin.H{"message": "you cannot modify another user's list"})
		return
	}

	itemID, err := strconv.Atoi(c.Param("itemId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid item id"})
		return
	}

	if err := r.service.RemoveItem(uint(itemID)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "game removed from list"})
}

func (r *GameListRouter) RemoveItemByGame(c *gin.Context) {
	if !utils.CheckOwnership(c, "id") {
		return
	}

	listID, err := strconv.Atoi(c.Param("listId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid list id"})
		return
	}

	// Verify the list belongs to this user
	list, err := r.service.GetByID(uint(listID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "list not found"})
		return
	}

	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	if list.UserID != uint(userID) {
		c.JSON(http.StatusForbidden, gin.H{"message": "you cannot modify another user's list"})
		return
	}

	gameID, err := strconv.Atoi(c.Param("gameId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid game id"})
		return
	}

	if err := r.service.RemoveItemByListAndGame(uint(listID), uint(gameID)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "game not found in list"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "game removed from list"})
}
