package database

import (
	"log"
	"respawn67/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Initialize sets up the SQLite database connection
func Initialize() {
	var err error
	// dbName := os.Getenv("DB_NAME")
	dbName := "respawn67.db"
	DB, err = gorm.Open(sqlite.Open(dbName), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")

	doMigrate()
}

func doMigrate() {

	var err error
	err = DB.AutoMigrate(&models.Game{}, &models.User{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migrated successfully")
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}
