package routes

import (
	"net/http"
	"respawn67/models"
	"respawn67/services"
	"respawn67/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ReviewsRouter struct {
	service *services.ReviewsService
}

func NewReviewsRouter() *ReviewsRouter {
	return &ReviewsRouter{service: services.NewReviewsService()}
}

var reviewsRouter *ReviewsRouter

func GetReviewsRouter() *ReviewsRouter {
	if reviewsRouter == nil {
		reviewsRouter = NewReviewsRouter()
	}
	return reviewsRouter
}

func addReviewRoutes(rg *gin.RouterGroup) {
	router := GetReviewsRouter()

	reviews := rg.Group("/reviews")
	reviews.GET("/", router.GetReviews)
	reviews.GET("/:id", router.GetReviewByID)
	reviews.POST("/", router.PostReview)
	reviews.PUT("/user/:user_id/game/:game_id", router.UpdateReview)
	reviews.DELETE("/user/:user_id/game/:game_id", router.DeleteReview)
}

func (r *ReviewsRouter) GetReviews(c *gin.Context) {
	userIDStr := c.Query("user_id")
	gameIDStr := c.Query("game_id")

	var userID, gameID *uint

	if userIDStr != "" {
		id, err := strconv.Atoi(userIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
			return
		}
		uid := uint(id)
		userID = &uid
	}

	if gameIDStr != "" {
		id, err := strconv.Atoi(gameIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "invalid game id"})
			return
		}
		gid := uint(id)
		gameID = &gid
	}

	reviews, err := r.service.GetReviews(userID, gameID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

func (r *ReviewsRouter) GetReviewByID(c *gin.Context) {
	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid review id"})
		return
	}

	review, err := r.service.GetReviewByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, review)
}

func (r *ReviewsRouter) PostReview(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}

	var newReview models.Review

	if err := c.ShouldBindJSON(&newReview); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	newReview, err := r.service.CreateReview(newReview)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, newReview)
}

func (r *ReviewsRouter) UpdateReview(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}

	userIDStr := c.Param("user_id")
	gameIDStr := c.Param("game_id")

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	gameID, err := strconv.Atoi(gameIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid game id"})
		return
	}

	var updatedReview models.Review
	if err := c.ShouldBindJSON(&updatedReview); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	review, err := r.service.UpdateReview(uint(userID), uint(gameID), updatedReview)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, review)
}

func (r *ReviewsRouter) DeleteReview(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}

	userIDStr := c.Param("user_id")
	gameIDStr := c.Param("game_id")

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	gameID, err := strconv.Atoi(gameIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid game id"})
		return
	}

	if err := r.service.DeleteReview(uint(userID), uint(gameID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "review deleted successfully"})
}
