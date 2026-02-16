package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"

	"backend/internal/models"
)

type GameRepository struct {
	db *sql.DB
}

func NewGameRepository(db *sql.DB) *GameRepository {
	return &GameRepository{db: db}
}

// Create inserts a new game
func (r *GameRepository) Create(game *models.Game) (int64, error) {
	var platformsJSON []byte
	var err error
	if len(game.Platforms) > 0 {
		platformsJSON, err = json.Marshal(game.Platforms)
		if err != nil {
			return 0, fmt.Errorf("failed to marshal platforms: %w", err)
		}
	}

	query := `INSERT INTO games (title, description, release_date, cover_image_url, spotlight_image_url, 
		developer, publisher, genres, platforms, average_rating, total_reviews, igdb_id) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	result, err := r.db.Exec(query,
		game.Title, game.Description, game.ReleaseDate, game.CoverImageURL, game.SpotlightImageURL,
		game.Developer, game.Publisher, game.Genres,
		sql.NullString{String: string(platformsJSON), Valid: len(platformsJSON) > 0},
		game.AverageRating, game.TotalReviews, game.IgdbID)
	if err != nil {
		return 0, fmt.Errorf("failed to create game: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to get last insert id: %w", err)
	}

	return id, nil
}

// GetByID retrieves a game by ID
func (r *GameRepository) GetByID(id int) (*models.Game, error) {
	query := `SELECT id, title, description, release_date, cover_image_url, spotlight_image_url,
		developer, publisher, genres, platforms, average_rating, total_reviews, igdb_id, 
		created_at, updated_at FROM games WHERE id = ?`

	game := &models.Game{}
	var description, releaseDate, coverImageURL, spotlightImageURL sql.NullString
	var developer, publisher, genres, platformsJSON sql.NullString
	var igdbID sql.NullInt64

	err := r.db.QueryRow(query, id).Scan(
		&game.ID, &game.Title, &description, &releaseDate, &coverImageURL,
		&spotlightImageURL, &developer, &publisher, &genres,
		&platformsJSON, &game.AverageRating, &game.TotalReviews, &igdbID,
		&game.CreatedAt, &game.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("game with ID %d not found", id)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get game: %w", err)
	}

	// Convert sql.Null* to pointers
	if description.Valid {
		game.Description = &description.String
	}
	if releaseDate.Valid {
		game.ReleaseDate = &releaseDate.String
	}
	if coverImageURL.Valid {
		game.CoverImageURL = &coverImageURL.String
	}
	if spotlightImageURL.Valid {
		game.SpotlightImageURL = &spotlightImageURL.String
	}
	if developer.Valid {
		game.Developer = &developer.String
	}
	if publisher.Valid {
		game.Publisher = &publisher.String
	}
	if genres.Valid {
		game.Genres = &genres.String
	}
	if igdbID.Valid {
		intVal := int(igdbID.Int64)
		game.IgdbID = &intVal
	}

	// Parse platforms JSON
	if platformsJSON.Valid && platformsJSON.String != "" {
		if err := json.Unmarshal([]byte(platformsJSON.String), &game.Platforms); err != nil {
			return nil, fmt.Errorf("failed to unmarshal platforms: %w", err)
		}
	}

	return game, nil
}

// GetAll retrieves all games
func (r *GameRepository) GetAll() ([]models.Game, error) {
	query := `SELECT id, title, description, release_date, cover_image_url, spotlight_image_url,
		developer, publisher, genres, platforms, average_rating, total_reviews, igdb_id,
		created_at, updated_at FROM games`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query games: %w", err)
	}
	defer rows.Close()

	var games []models.Game
	for rows.Next() {
		var game models.Game
		var description, releaseDate, coverImageURL, spotlightImageURL sql.NullString
		var developer, publisher, genres, platformsJSON sql.NullString
		var igdbID sql.NullInt64

		err := rows.Scan(&game.ID, &game.Title, &description, &releaseDate,
			&coverImageURL, &spotlightImageURL, &developer, &publisher,
			&genres, &platformsJSON, &game.AverageRating, &game.TotalReviews,
			&igdbID, &game.CreatedAt, &game.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan game: %w", err)
		}

		// Convert sql.Null* to pointers
		if description.Valid {
			game.Description = &description.String
		}
		if releaseDate.Valid {
			game.ReleaseDate = &releaseDate.String
		}
		if coverImageURL.Valid {
			game.CoverImageURL = &coverImageURL.String
		}
		if spotlightImageURL.Valid {
			game.SpotlightImageURL = &spotlightImageURL.String
		}
		if developer.Valid {
			game.Developer = &developer.String
		}
		if publisher.Valid {
			game.Publisher = &publisher.String
		}
		if genres.Valid {
			game.Genres = &genres.String
		}
		if igdbID.Valid {
			intVal := int(igdbID.Int64)
			game.IgdbID = &intVal
		}

		// Parse platforms JSON
		if platformsJSON.Valid && platformsJSON.String != "" {
			if err := json.Unmarshal([]byte(platformsJSON.String), &game.Platforms); err != nil {
				return nil, fmt.Errorf("failed to unmarshal platforms: %w", err)
			}
		}

		games = append(games, game)
	}

	return games, nil
}

// Update updates an existing game
func (r *GameRepository) Update(id int, game *models.Game) error {
	var platformsJSON []byte
	var err error
	if len(game.Platforms) > 0 {
		platformsJSON, err = json.Marshal(game.Platforms)
		if err != nil {
			return fmt.Errorf("failed to marshal platforms: %w", err)
		}
	}

	query := `UPDATE games SET title = ?, description = ?, release_date = ?, cover_image_url = ?,
		spotlight_image_url = ?, developer = ?, publisher = ?, genres = ?, platforms = ?,
		average_rating = ?, total_reviews = ?, igdb_id = ?, updated_at = CURRENT_TIMESTAMP 
		WHERE id = ?`

	result, err := r.db.Exec(query,
		game.Title, game.Description, game.ReleaseDate, game.CoverImageURL,
		game.SpotlightImageURL, game.Developer, game.Publisher, game.Genres,
		sql.NullString{String: string(platformsJSON), Valid: len(platformsJSON) > 0},
		game.AverageRating, game.TotalReviews, game.IgdbID, id)
	if err != nil {
		return fmt.Errorf("failed to update game: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("game with ID %d not found", id)
	}

	return nil
}

// Delete removes a game by ID
func (r *GameRepository) Delete(id int) error {
	query := `DELETE FROM games WHERE id = ?`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete game: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("game with ID %d not found", id)
	}

	return nil
}
