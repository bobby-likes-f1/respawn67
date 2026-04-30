package routes

import (
	"net/http"
	"respawn67/models"
	"respawn67/services"
	"respawn67/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type GuidesRouter struct {
	service *services.GuidesService
}

func NewGuidesRouter() *GuidesRouter {
	return &GuidesRouter{service: services.NewGuidesService()}
}

var guidesRouter *GuidesRouter

func GetGuidesRouter() *GuidesRouter {
	if guidesRouter == nil {
		guidesRouter = NewGuidesRouter()
	}
	return guidesRouter
}

func addGuideRoutes(rg *gin.RouterGroup) {
	router := GetGuidesRouter()

	// Nested under /games/:id/guides
	guides := rg.Group("/games/:id/guides")
	guides.GET("/", router.GetByGameID)
	guides.POST("/", router.Create)
	guides.PUT("/:guideId", router.Update)
	guides.DELETE("/:guideId", router.Delete)
}

func (r *GuidesRouter) GetByGameID(c *gin.Context) {
	gameID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid game id"})
		return
	}

	guides, err := r.service.GetByGameID(uint(gameID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, guides)
}

func (r *GuidesRouter) Create(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}
	userID, _ := c.Get("userID")

	gameID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid game id"})
		return
	}

	var body struct {
		Title   string `json:"title"`
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body", "error": err.Error()})
		return
	}

	guide := models.Guide{
		GameID:  uint(gameID),
		UserID:  userID.(uint),
		Title:   body.Title,
		Content: body.Content,
	}

	created, err := r.service.Create(guide)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, created)
}

func (r *GuidesRouter) Update(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}
	userID, _ := c.Get("userID")

	guideID, err := strconv.Atoi(c.Param("guideId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid guide id"})
		return
	}

	var body struct {
		Title   string `json:"title"`
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body", "error": err.Error()})
		return
	}

	updated, err := r.service.Update(uint(guideID), userID.(uint), models.Guide{
		Title:   body.Title,
		Content: body.Content,
	})
	if err != nil {
		if err.Error() == "forbidden" {
			c.JSON(http.StatusForbidden, gin.H{"message": "you can only edit your own guides"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updated)
}

func (r *GuidesRouter) Delete(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}
	userID, _ := c.Get("userID")

	guideID, err := strconv.Atoi(c.Param("guideId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid guide id"})
		return
	}

	if err := r.service.Delete(uint(guideID), userID.(uint)); err != nil {
		if err.Error() == "forbidden" {
			c.JSON(http.StatusForbidden, gin.H{"message": "you can only delete your own guides"})
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "guide deleted successfully"})
}
