package routes

import (
	"net/http"
	"respawn67/models"
	"respawn67/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UsersRouter struct {
	service *services.UsersService
}

func NewUsersRouter() *UsersRouter {
	return &UsersRouter{service: services.NewUsersService()}
}

var usersRouter *UsersRouter

func GetUsersRouter() *UsersRouter {
	if usersRouter == nil {
		usersRouter = NewUsersRouter()
	}
	return usersRouter
}

func addUserRoutes(rg *gin.RouterGroup) {
	router := GetUsersRouter()

	users := rg.Group("/users")

	users.GET("/", router.GetAll)
	users.GET("/:id", router.GetUserByID)
	users.POST("/", router.PostUser)
	users.PUT("/:id", router.UpdateUser)
	users.DELETE("/:id", router.DeleteUser)
}

func (r *UsersRouter) GetAll(c *gin.Context) {
	users, err := r.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (r *UsersRouter) GetUserByID(c *gin.Context) {
	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	user, err := r.service.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (r *UsersRouter) PostUser(c *gin.Context) {
	var newUser models.User

	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	newUser, err := r.service.CreateUser(newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, newUser)
}

func (r *UsersRouter) UpdateUser(c *gin.Context) {
	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	var updatedUser models.User
	if err := c.ShouldBindJSON(&updatedUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request body",
			"error":   err.Error(),
		})
		return
	}

	user, err := r.service.UpdateUser(uint(id), updatedUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (r *UsersRouter) DeleteUser(c *gin.Context) {
	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	if err := r.service.DeleteUser(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "user deleted successfully"})
}
