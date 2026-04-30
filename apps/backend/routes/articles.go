package routes

import (
	"net/http"
	"respawn67/models"
	"respawn67/services"
	"respawn67/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ArticlesRouter struct {
	service *services.ArticlesService
}

func NewArticlesRouter() *ArticlesRouter {
	return &ArticlesRouter{service: services.NewArticlesService()}
}

var articlesRouter *ArticlesRouter

func GetArticlesRouter() *ArticlesRouter {
	if articlesRouter == nil {
		articlesRouter = NewArticlesRouter()
	}
	return articlesRouter
}

func addArticleRoutes(rg *gin.RouterGroup) {
	router := GetArticlesRouter()

	articles := rg.Group("/articles")
	articles.GET("/", router.GetAll)
	articles.GET("/:id", router.GetByID)
	articles.POST("/", router.Create)
	articles.PUT("/:id", router.Update)
	articles.DELETE("/:id", router.Delete)
}

func (r *ArticlesRouter) GetAll(c *gin.Context) {
	articles, err := r.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, articles)
}

func (r *ArticlesRouter) GetByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid article id"})
		return
	}
	article, err := r.service.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "article not found"})
		return
	}
	c.JSON(http.StatusOK, article)
}

func (r *ArticlesRouter) Create(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}
	userID, _ := c.Get("userID")

	var article models.Article
	if err := c.ShouldBindJSON(&article); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body", "error": err.Error()})
		return
	}
	article.UserID = userID.(uint)

	created, err := r.service.Create(article)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusCreated, created)
}

func (r *ArticlesRouter) Update(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}
	userID, _ := c.Get("userID")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid article id"})
		return
	}

	var article models.Article
	if err := c.ShouldBindJSON(&article); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body", "error": err.Error()})
		return
	}

	updated, err := r.service.Update(uint(id), userID.(uint), article)
	if err != nil {
		if err.Error() == "forbidden" {
			c.JSON(http.StatusForbidden, gin.H{"message": "you can only edit your own articles"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updated)
}

func (r *ArticlesRouter) Delete(c *gin.Context) {
	if !utils.RequireAuth(c) {
		return
	}
	userID, _ := c.Get("userID")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid article id"})
		return
	}

	if err := r.service.Delete(uint(id), userID.(uint)); err != nil {
		if err.Error() == "forbidden" {
			c.JSON(http.StatusForbidden, gin.H{"message": "you can only delete your own articles"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "article deleted successfully"})
}
