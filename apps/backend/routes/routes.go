package routes

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

var router = gin.Default()

// Run will start the server
func Run() {
	getRoutes()

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
		log.Printf("Defaulting to port %s", port)
	}
	_ = router.Run(":" + port)
}

func getRoutes() {
	v1 := router.Group("/api/v1")
	addAuthRoutes(v1)
	addUserRoutes(v1)
	addGameRoutes(v1)
	addPlaylistRoutes(v1)
	addFavoritesRoutes(v1)
	addReviewRoutes(v1)
}
