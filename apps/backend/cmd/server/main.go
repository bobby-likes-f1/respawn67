package main

import (
	"fmt"
	"log"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv" // Add this
)

func main() {
	// Load .env file automatically
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Connect to database
	if err := database.Connect(cfg.TursoURL, cfg.TursoToken); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run migrations
	if err := database.RunMigrations(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize repositories
	gameRepo := repository.NewGameRepository(database.DB)
	userRepo := repository.NewUserRepository(database.DB)
	// Initialize handlers
	gameHandler := handlers.NewGameHandler(gameRepo)
	userHandler := handlers.NewUserHandler(userRepo)

	// Setup Gin router
	router := gin.Default()

	// Game routes
	router.GET("/games", gameHandler.GetGames)
	router.GET("/games/:id", gameHandler.GetGameByID)
	router.POST("/games", gameHandler.CreateGame)
	router.PUT("/games/:id", gameHandler.UpdateGame)
	router.DELETE("/games/:id", gameHandler.DeleteGame)

	// User routes - ADD THESE
	router.GET("/users", userHandler.GetUsers)
	router.GET("/users/:id", userHandler.GetUserByID)
	router.GET("/users/username/:username", userHandler.GetUserByUsername)
	router.POST("/users", userHandler.CreateUser)
	router.PUT("/users/:id", userHandler.UpdateUser)
	router.DELETE("/users/:id", userHandler.DeleteUser)
	// Start server
	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	fmt.Printf("🚀 Server starting on http://localhost%s\n", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
