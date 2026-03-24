package routes

import (
	"log"
	"os"
	"respawn67/middleware"

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

// getRoutes will create our routes of our entire application
// this way every group of routes can be defined in their own file
// so this one won't be so messy
func getRoutes() {
	v1 := router.Group("/api/v1")

	// Public routes - no auth required
	addAuthRoutes(v1)
	addGameRoutes(v1)

	// Protected routes - require valid JWT token
	protected := v1.Group("")
	protected.Use(middleware.AuthRequired())
	addUserRoutes(protected)
	addPlaylistRoutes(protected)
	addFavoritesRoutes(protected)
}
