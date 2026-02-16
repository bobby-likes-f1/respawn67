package repository

import (
	"database/sql"
	"fmt"

	"backend/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create inserts a new user
func (r *UserRepository) Create(user *models.User) (int64, error) {
	query := `INSERT INTO users (username, email, password_hash, display_name, bio, 
		profile_picture_url, location, favorite_genres, is_verified, is_admin) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	result, err := r.db.Exec(query,
		user.Username, user.Email, user.PasswordHash, user.DisplayName, user.Bio,
		user.ProfilePictureURL, user.Location, user.FavoriteGenres,
		user.IsVerified, user.IsAdmin)
	if err != nil {
		return 0, fmt.Errorf("failed to create user: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to get last insert id: %w", err)
	}

	return id, nil
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(id int) (*models.User, error) {
	query := `SELECT id, username, email, password_hash, display_name, bio, 
		profile_picture_url, location, favorite_genres, is_verified, is_admin, 
		created_at, updated_at FROM users WHERE id = ?`

	user := &models.User{}
	var displayName, bio, profilePictureURL, location, favoriteGenres sql.NullString

	err := r.db.QueryRow(query, id).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash, &displayName, &bio,
		&profilePictureURL, &location, &favoriteGenres, &user.IsVerified, &user.IsAdmin,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user with ID %d not found", id)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Convert sql.Null* to pointers
	if displayName.Valid {
		user.DisplayName = &displayName.String
	}
	if bio.Valid {
		user.Bio = &bio.String
	}
	if profilePictureURL.Valid {
		user.ProfilePictureURL = &profilePictureURL.String
	}
	if location.Valid {
		user.Location = &location.String
	}
	if favoriteGenres.Valid {
		user.FavoriteGenres = &favoriteGenres.String
	}

	return user, nil
}

// GetByUsername retrieves a user by username
func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	query := `SELECT id, username, email, password_hash, display_name, bio, 
		profile_picture_url, location, favorite_genres, is_verified, is_admin, 
		created_at, updated_at FROM users WHERE username = ?`

	user := &models.User{}
	var displayName, bio, profilePictureURL, location, favoriteGenres sql.NullString

	err := r.db.QueryRow(query, username).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash, &displayName, &bio,
		&profilePictureURL, &location, &favoriteGenres, &user.IsVerified, &user.IsAdmin,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user with username %s not found", username)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Convert sql.Null* to pointers
	if displayName.Valid {
		user.DisplayName = &displayName.String
	}
	if bio.Valid {
		user.Bio = &bio.String
	}
	if profilePictureURL.Valid {
		user.ProfilePictureURL = &profilePictureURL.String
	}
	if location.Valid {
		user.Location = &location.String
	}
	if favoriteGenres.Valid {
		user.FavoriteGenres = &favoriteGenres.String
	}

	return user, nil
}

// GetAll retrieves all users
func (r *UserRepository) GetAll() ([]models.User, error) {
	query := `SELECT id, username, email, password_hash, display_name, bio, 
		profile_picture_url, location, favorite_genres, is_verified, is_admin,
		created_at, updated_at FROM users`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		var displayName, bio, profilePictureURL, location, favoriteGenres sql.NullString

		err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash,
			&displayName, &bio, &profilePictureURL, &location, &favoriteGenres,
			&user.IsVerified, &user.IsAdmin, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}

		// Convert sql.Null* to pointers
		if displayName.Valid {
			user.DisplayName = &displayName.String
		}
		if bio.Valid {
			user.Bio = &bio.String
		}
		if profilePictureURL.Valid {
			user.ProfilePictureURL = &profilePictureURL.String
		}
		if location.Valid {
			user.Location = &location.String
		}
		if favoriteGenres.Valid {
			user.FavoriteGenres = &favoriteGenres.String
		}

		users = append(users, user)
	}

	return users, nil
}

// Update updates an existing user
func (r *UserRepository) Update(id int, user *models.User) error {
	query := `UPDATE users SET username = ?, email = ?, display_name = ?, bio = ?,
		profile_picture_url = ?, location = ?, favorite_genres = ?, is_verified = ?,
		is_admin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`

	result, err := r.db.Exec(query,
		user.Username, user.Email, user.DisplayName, user.Bio, user.ProfilePictureURL,
		user.Location, user.FavoriteGenres, user.IsVerified, user.IsAdmin, id)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user with ID %d not found", id)
	}

	return nil
}

// Delete removes a user by ID
func (r *UserRepository) Delete(id int) error {
	query := `DELETE FROM users WHERE id = ?`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user with ID %d not found", id)
	}

	return nil
}
