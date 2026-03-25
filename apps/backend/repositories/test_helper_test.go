package repositories

import (
	"log"
	"respawn67/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// setupTestDB creates a fresh in-memory SQLite database for testing
func setupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatal("Failed to connect to test database:", err)
	}

	err = db.AutoMigrate(
		&models.Game{},
		&models.User{},
		&models.Playlist{},
		&models.Favorite{},
		&models.Review{},
	)
	if err != nil {
		log.Fatal("Failed to migrate test database:", err)
	}

	return db
}

// helper functions for creating test data
func strPtr(s string) *string {
	return &s
}

func int16Ptr(i int16) *int16 {
	return &i
}
