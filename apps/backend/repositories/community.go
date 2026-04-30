package repositories

import (
	"respawn67/database"
	"respawn67/models"

	"gorm.io/gorm"
)

type CommunityRepository struct {
	db *gorm.DB
}

func NewCommunityRepository() *CommunityRepository {
	return &CommunityRepository{db: database.GetDB()}
}

// RatingDistributionRow is the raw result of the GROUP BY query.
type RatingDistributionRow struct {
	Score int16
	Count int
}

// PlaylistUser is a lightweight join of playlists + users for a given game.
type PlaylistUser struct {
	UserID      uint    `json:"user_id"`
	Username    string  `json:"username"`
	Status      string  `json:"status"`
	HoursPlayed float32 `json:"hours_played"`
}

// GetRatingDistribution returns a count per score value (1–10) for a game.
// Scores with no reviews are included as 0.
func (r *CommunityRepository) GetRatingDistribution(gameID uint) (map[string]int, error) {
	var rows []RatingDistributionRow
	result := r.db.Model(&models.Review{}).
		Select("score, COUNT(*) as count").
		Where("game_id = ?", gameID).
		Group("score").
		Scan(&rows)
	if result.Error != nil {
		return nil, result.Error
	}

	// Pre-fill all 10 buckets with 0 so the frontend always gets a complete map.
	dist := map[string]int{
		"1": 0, "2": 0, "3": 0, "4": 0, "5": 0,
		"6": 0, "7": 0, "8": 0, "9": 0, "10": 0,
	}
	for _, row := range rows {
		key := scoreKey(row.Score)
		dist[key] = row.Count
	}
	return dist, nil
}

// GetListsContainingGame returns all GameLists that include the given game.
func (r *CommunityRepository) GetListsContainingGame(gameID uint) ([]models.GameList, error) {
	var lists []models.GameList
	result := r.db.
		Joins("INNER JOIN game_list_items ON game_list_items.list_id = game_lists.id").
		Where("game_list_items.game_id = ?", gameID).
		Find(&lists)
	return lists, result.Error
}

// GetPlaylistUsers returns all users who have the game in their playlist,
// along with their status and hours played.
func (r *CommunityRepository) GetPlaylistUsers(gameID uint) ([]PlaylistUser, error) {
	var users []PlaylistUser
	result := r.db.Model(&models.Playlist{}).
		Select("users.id as user_id, users.username, playlists.status, playlists.hours_played").
		Joins("INNER JOIN users ON users.id = playlists.user_id").
		Where("playlists.game_id = ?", gameID).
		Scan(&users)
	return users, result.Error
}

// scoreKey converts an int16 score to its string map key.
func scoreKey(score int16) string {
	switch score {
	case 1:
		return "1"
	case 2:
		return "2"
	case 3:
		return "3"
	case 4:
		return "4"
	case 5:
		return "5"
	case 6:
		return "6"
	case 7:
		return "7"
	case 8:
		return "8"
	case 9:
		return "9"
	case 10:
		return "10"
	default:
		return "0"
	}
}
