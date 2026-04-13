package routes

import (
	"net/http"
	"respawn67/models"

	"github.com/gin-gonic/gin"
)

type SignupRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type SignupResponse struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

func addAuthRoutes(rg *gin.RouterGroup) {
	auth := rg.Group("/auth")

	auth.POST("/signup", signup)
	auth.POST("/login", login)
}

func signup(c *gin.Context) {
	var req SignupRequest

	// Bind and validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request: " + err.Error(),
		})
		return
	}

	// Create user
	user := models.User{
		Username: req.Username,
		Email:    req.Email,
	}

	c.JSON(http.StatusCreated, SignupResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
	})
}

func login(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "login endpoint",
	})
}
