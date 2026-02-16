package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

var DB *sql.DB

// Connect establishes connection to Turso database
func Connect(dbURL, authToken string) error {
	connStr := fmt.Sprintf("%s?authToken=%s", dbURL, authToken)

	var err error
	DB, err = sql.Open("libsql", connStr)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	fmt.Println("✓ Successfully connected to Turso database")
	return nil
}

// RunMigrations executes SQL migration files
func RunMigrations() error {
	migrationPath := filepath.Join("internal", "database", "migrations", "001_init.sql")
	
	sqlBytes, err := os.ReadFile(migrationPath)
	if err != nil {
		return fmt.Errorf("failed to read migration file: %w", err)
	}

	_, err = DB.Exec(string(sqlBytes))
	if err != nil {
		return fmt.Errorf("failed to execute migration: %w", err)
	}

	fmt.Println("✓ Migrations executed successfully")
	return nil
}

// Close closes the database connection
func Close() {
	if DB != nil {
		DB.Close()
		fmt.Println("✓ Database connection closed")
	}
}
