package routes

import (
	"net/http"
	"respawn67/services"

	"github.com/gin-gonic/gin"
)

type AuthRouter struct {
	service *services.AuthService
}

func NewAuthRouter() *AuthRouter {
	return &AuthRouter{service: services.NewAuthService()}
}

var authRouter *AuthRouter

func GetAuthRouter() *AuthRouter {
	if authRouter == nil {
		authRouter = NewAuthRouter()
	}
	return authRouter
}

func addAuthRoutes(rg *gin.RouterGroup) {
	router := GetAuthRouter()

	authRoutes := rg.Group("/auth")

	authRoutes.POST("/signup", router.Signup)
	authRoutes.POST("/login", router.Login)
}

func (r *AuthRouter) Signup(c *gin.Context) {
	var body struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	user, err := r.service.Signup(body.Username, body.Email, body.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.IndentedJSON(http.StatusCreated, gin.H{
		"message": "user created successfully",
		"user":    user,
	})
}

func (r *AuthRouter) Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	token, user, err := r.service.Login(body.Email, body.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "login successful",
		"token":   token,
		"user":    user,
	})
}
