package config

import (
	"fmt"
	"os"
)

type Config struct {
	TursoURL   string
	TursoToken string
	ServerPort string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() (*Config, error) {
	config := &Config{
		TursoURL:   getEnv("TURSO_DATABASE_URL", ""),
		TursoToken: getEnv("TURSO_AUTH_TOKEN", ""),
		ServerPort: getEnv("SERVER_PORT", "8080"),
	}

	// Validate required fields
	if config.TursoURL == "" {
		return nil, fmt.Errorf("TURSO_DATABASE_URL is required")
	}
	if config.TursoToken == "" {
		return nil, fmt.Errorf("TURSO_AUTH_TOKEN is required")
	}

	return config, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
