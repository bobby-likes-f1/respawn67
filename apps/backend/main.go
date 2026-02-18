package main

import (
	"respawn67/database"
	"respawn67/routes"
)

func main() {
	// Initialize database FIRST
	database.Initialize()

	// Then start server
	routes.Run()
}
