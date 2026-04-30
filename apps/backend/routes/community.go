package routes

import (
	"net/http"
	"respawn67/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CommunityRouter struct {
	service *services.CommunityService
}

func NewCommunityRouter() *CommunityRouter {
	return &CommunityRouter{service: services.NewCommunityService()}
}

var communityRouter *CommunityRouter

func GetCommunityRouter() *CommunityRouter {
	if communityRouter == nil {
		communityRouter = NewCommunityRouter()
	}
	return communityRouter
}

func addCommunityRoutes(rg *gin.RouterGroup) {
	router := GetCommunityRouter()
	rg.GET("/games/:id/community", router.GetGameCommunityHub)
}

func (r *CommunityRouter) GetGameCommunityHub(c *gin.Context) {
	gameID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid game id"})
		return
	}

	hub, err := r.service.GetGameCommunityHub(uint(gameID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "game not found"})
		return
	}

	c.JSON(http.StatusOK, hub)
}
