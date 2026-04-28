package services

import (
	"respawn67/models"
	"respawn67/repositories"
)

// GameCommunityHub is the aggregate response for GET /games/:id/community.
type GameCommunityHub struct {
	AverageRating      *float64                    `json:"average_rating"`
	ReviewCount        int                         `json:"review_count"`
	RatingDistribution map[string]int              `json:"rating_distribution"`
	Reviews            []models.Review             `json:"reviews"`
	Lists              []models.GameList           `json:"lists"`
	PlaylistUsers      []repositories.PlaylistUser `json:"playlist_users"`
}

type CommunityService struct {
	communityRepo *repositories.CommunityRepository
	gamesRepo     *repositories.GamesRepository
	reviewsRepo   *repositories.ReviewsRepository
}

func NewCommunityService() *CommunityService {
	return &CommunityService{
		communityRepo: repositories.NewCommunityRepository(),
		gamesRepo:     repositories.NewGamesRepository(),
		reviewsRepo:   repositories.NewReviewsRepository(),
	}
}

func (s *CommunityService) GetGameCommunityHub(gameID uint) (GameCommunityHub, error) {
	// 1. Game — for average_rating and review_count (already maintained on the model).
	game, err := s.gamesRepo.GetGameByID(gameID)
	if err != nil {
		return GameCommunityHub{}, err
	}

	// 2. Rating distribution — GROUP BY score query.
	dist, err := s.communityRepo.GetRatingDistribution(gameID)
	if err != nil {
		return GameCommunityHub{}, err
	}

	// 3. All reviews for the game.
	reviews, err := s.reviewsRepo.GetReviews(nil, &gameID)
	if err != nil {
		return GameCommunityHub{}, err
	}
	if reviews == nil {
		reviews = []models.Review{}
	}

	// 4. Game lists that contain this game.
	lists, err := s.communityRepo.GetListsContainingGame(gameID)
	if err != nil {
		return GameCommunityHub{}, err
	}
	if lists == nil {
		lists = []models.GameList{}
	}

	// 5. Users who have this game in their playlist.
	playlistUsers, err := s.communityRepo.GetPlaylistUsers(gameID)
	if err != nil {
		return GameCommunityHub{}, err
	}
	if playlistUsers == nil {
		playlistUsers = []repositories.PlaylistUser{}
	}

	return GameCommunityHub{
		AverageRating:      game.AverageRating,
		ReviewCount:        game.ReviewCount,
		RatingDistribution: dist,
		Reviews:            reviews,
		Lists:              lists,
		PlaylistUsers:      playlistUsers,
	}, nil
}
