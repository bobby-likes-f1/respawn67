package main

import (
	"respawn67/database"
	"respawn67/routes"
)

// code example found at https://github.com/gin-gonic/examples/blob/master/group-routes/main.go

func main() {

	// Our server will live in the routes package
	routes.Run()

	database.Initialize()
}
