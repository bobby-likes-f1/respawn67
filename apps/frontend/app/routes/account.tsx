import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Settings,
  Link as LinkIcon,
  LayoutGrid,
  Clock,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  getAllGames,
  getFavoriteGames,
  getPlaylistEntries,
  getPlaylistGames,
  getReviews,
  deleteReview,
  removeFavoriteByGame,
  removeFromPlaylist,
  updatePlaylistStatusByGame,
  updateReview,
  type ApiGame,
  type ApiReview,
} from "@/lib/api";
import { getInitials, getMemberSinceLabel, getStoredUser, type AuthUser } from "@/lib/auth";
import { useRequireAuth } from "@/lib/use-require-auth";
import type { Route } from "./+types/account";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Account | Respawn67" },
    { name: "description", content: "Manage your profile and view your gaming history." },
  ];
}

type BacklogPreviewItem = {
  id: number;
  title: string;
  platform: string;
  status: BacklogStatus;
  progress: number;
  hoursTotal: number;
  coverImageUrl: string | null;
};

type BacklogStatus = "backlog" | "playing" | "completed" | "abandoned";

const MOCK_LISTS = [
  { id: 1, title: "Top 10 Souls-likes", gameCount: 10, likes: 24, updated: "1 week ago" },
  { id: 2, title: "Co-op Weekend", gameCount: 4, likes: 5, updated: "1 month ago" },
  { id: 3, title: "Pile of Shame", gameCount: 42, likes: 1, updated: "2 months ago" },
];

const FALLBACK_COVER =
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co39at.webp";

function statusToProgress(status: string) {
  if (status === "completed") return 100;
  if (status === "playing") return 45;
  if (status === "abandoned") return 20;
  return 0;
}

function normalizeBacklogStatus(status: string): BacklogStatus {
  if (status === "playing") return "playing";
  if (status === "completed") return "completed";
  if (status === "abandoned") return "abandoned";
  return "backlog";
}

function toApiBacklogStatus(status: BacklogStatus) {
  if (status === "backlog") return "want_to_play";
  return status;
}

function formatBacklogStatus(status: BacklogStatus) {
  if (status === "backlog") return "Backlog";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value?: string) {
  if (!value) {
    return "Recently";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString();
}

function getReviewCreatedAt(review: ApiReview) {
  return review.created_at ?? review.CreatedAt;
}

function changeImageSize(url: string | null | undefined, size: string) {
  if (!url) return FALLBACK_COVER;
  return url.replace(/t_[a-z0-9]+/, `t_${size}`);
}

function normalizeReviewScore(score: number) {
  return Math.min(10, Math.max(1, Math.round(score)));
}

export default function AccountPage() {
  const isAuthorized = useRequireAuth();
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);

  const [favorites, setFavorites] = useState<ApiGame[]>([]);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [backlogPreview, setBacklogPreview] = useState<BacklogPreviewItem[]>([]);
  const [gameTitleById, setGameTitleById] = useState<Record<number, string>>({});
  const [gameCoverById, setGameCoverById] = useState<Record<number, string | null>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReviewGameId, setEditingReviewGameId] = useState<number | null>(null);
  const [draftReviewScore, setDraftReviewScore] = useState("0");
  const [draftReviewText, setDraftReviewText] = useState("");
  const [busyFavoriteId, setBusyFavoriteId] = useState<number | null>(null);
  const [busyReviewGameId, setBusyReviewGameId] = useState<number | null>(null);
  const [deletingReviewGameId, setDeletingReviewGameId] = useState<number | null>(null);
  const [busyBacklogGameId, setBusyBacklogGameId] = useState<number | null>(null);

  useEffect(() => {
    setSessionUser(getStoredUser());
  }, []);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    const user = getStoredUser();
    if (!user) {
      setError("No user session found");
      setIsLoading(false);
      return;
    }

    let active = true;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [favoriteGames, userReviews, playlistEntries, playlistGames, allGames] = await Promise.all([
          getFavoriteGames(user.id),
          getReviews({ userId: user.id }),
          getPlaylistEntries(user.id),
          getPlaylistGames(user.id),
          getAllGames(),
        ]);

        if (!active) {
          return;
        }

        setFavorites(favoriteGames);

        const titleMap: Record<number, string> = {};
        const coverMap: Record<number, string | null> = {};
        for (const game of allGames) {
          titleMap[game.id] = game.title;
          coverMap[game.id] = game.cover_image_url ?? null;
        }
        setGameTitleById(titleMap);
        setGameCoverById(coverMap);

        setReviews(
          userReviews.map((review) => ({
            ...review,
            text:
              review.text && review.text.trim()
                ? review.text
                : `Thoughts on ${titleMap[review.game_id] ?? "this game"}.`,
          })),
        );

        const statusByGameId = new Map<number, string>();
        for (const entry of playlistEntries) {
          statusByGameId.set(entry.game_id, entry.status);
        }

        const preview = playlistGames.map((game) => {
          const status = normalizeBacklogStatus(statusByGameId.get(game.id) ?? "want_to_play");
          return {
            id: game.id,
            title: game.title,
            platform: game.genre ?? "Unknown",
            status,
            progress: statusToProgress(status),
            hoursTotal: 30,
            coverImageUrl: game.cover_image_url ?? null,
          };
        });

        setBacklogPreview(preview);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load account data");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthorized]);

  const profileUser = useMemo(() => {
    if (!sessionUser) {
      return {
        username: "Player",
        avatar: "",
        bio: "Track your favorites, reviews, and backlog here.",
      };
    }

    return {
      username: sessionUser.username,
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(sessionUser.username)}`,
      bio: `Signed in as ${sessionUser.email}`,
    };
  }, [sessionUser]);

  const memberSince = getMemberSinceLabel(sessionUser) ?? "2026";

  const ratingDistribution = useMemo(() => {
    const distribution = [
      { stars: 1, count: 0 },
      { stars: 2, count: 0 },
      { stars: 3, count: 0 },
      { stars: 4, count: 0 },
      { stars: 5, count: 0 },
    ];

    for (const review of reviews) {
      const bucket = Math.min(5, Math.max(1, Math.ceil(review.score / 2)));
      distribution[bucket - 1].count += 1;
    }

    return distribution;
  }, [reviews]);

  const maxRatingCount = Math.max(...ratingDistribution.map((r) => r.count), 1);
  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return "0.0";
    }

    const total = reviews.reduce((sum, review) => sum + review.score, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const stats = {
    games: backlogPreview.length,
    reviews: reviews.length,
    following: 0,
    followers: 0,
  };

  const reviewCards = useMemo(() => {
    return reviews.map((review) => ({
      id: review.id ?? review.ID ?? review.game_id,
      gameId: review.game_id,
      game: gameTitleById[review.game_id] ?? `Game #${review.game_id}`,
      rating: review.score,
      date: formatDate(getReviewCreatedAt(review)),
      text: review.text ?? "",
      coverImageUrl: gameCoverById[review.game_id] ?? null,
    }));
  }, [gameCoverById, gameTitleById, reviews]);

  const recentActivity = reviewCards.slice(0, 4);

  const startEditingReview = (review: ApiReview) => {
    setError(null);
    setEditingReviewGameId(review.game_id);
    setDraftReviewScore(String(normalizeReviewScore(review.score)));
    setDraftReviewText(review.text ?? "");
  };

  const cancelEditingReview = () => {
    setEditingReviewGameId(null);
    setDraftReviewScore("0");
    setDraftReviewText("");
  };

  const handleFavoriteRemove = async (gameId: number) => {
    const user = getStoredUser();
    if (!user) {
      setError("No user session found");
      return;
    }

    setError(null);
    setBusyFavoriteId(gameId);

    const previous = favorites;
    setFavorites((current) => current.filter((game) => game.id !== gameId));

    try {
      await removeFavoriteByGame(user.id, gameId);
    } catch (err) {
      setFavorites(previous);
      setError(err instanceof Error ? err.message : "Failed to update favorites");
    } finally {
      setBusyFavoriteId(null);
    }
  };

  const handleReviewSave = async (gameId: number) => {
    const user = getStoredUser();
    if (!user) {
      setError("No user session found");
      return;
    }

    const nextScore = Number(draftReviewScore);
    if (!Number.isFinite(nextScore) || nextScore < 1 || nextScore > 10) {
      setError("Rating must be between 1 and 10");
      return;
    }

    setError(null);
    setBusyReviewGameId(gameId);

    const trimmedText = draftReviewText.trim();

    try {
      const savedReview = await updateReview(user.id, gameId, {
        score: nextScore,
        text: trimmedText || undefined,
      });

      setReviews((current) =>
        current.map((review) => {
          if (review.game_id !== gameId) {
            return review;
          }

          return {
            ...review,
            ...savedReview,
            score: nextScore,
            text: trimmedText || null,
          };
        }),
      );
      cancelEditingReview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review");
    } finally {
      setBusyReviewGameId(null);
    }
  };

  const handleReviewDelete = async (gameId: number) => {
    const user = getStoredUser();
    if (!user) {
      setError("No user session found");
      return;
    }

    setError(null);
    setDeletingReviewGameId(gameId);

    const previous = reviews;
    setReviews((current) => current.filter((review) => review.game_id !== gameId));

    try {
      await deleteReview(user.id, gameId);
      if (editingReviewGameId === gameId) {
        cancelEditingReview();
      }
    } catch (err) {
      setReviews(previous);
      setError(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setDeletingReviewGameId(null);
    }
  };

  const handleBacklogStatusChange = async (gameId: number, nextStatus: BacklogStatus) => {
    const user = getStoredUser();
    if (!user) {
      setError("No user session found");
      return;
    }

    setError(null);
    setBusyBacklogGameId(gameId);

    const previous = backlogPreview;
    setBacklogPreview((current) =>
      current.map((game) =>
        game.id === gameId
          ? {
              ...game,
              status: nextStatus,
              progress: statusToProgress(nextStatus),
            }
          : game,
      ),
    );

    try {
      await updatePlaylistStatusByGame(user.id, gameId, toApiBacklogStatus(nextStatus));
    } catch (err) {
      setBacklogPreview(previous);
      setError(err instanceof Error ? err.message : "Failed to update backlog item");
    } finally {
      setBusyBacklogGameId(null);
    }
  };

  const handleBacklogRemove = async (gameId: number) => {
    const user = getStoredUser();
    if (!user) {
      setError("No user session found");
      return;
    }

    setError(null);
    setBusyBacklogGameId(gameId);

    const previous = backlogPreview;
    setBacklogPreview((current) => current.filter((game) => game.id !== gameId));

    try {
      await removeFromPlaylist(user.id, gameId);
    } catch (err) {
      setBacklogPreview(previous);
      setError(err instanceof Error ? err.message : "Failed to remove backlog item");
    } finally {
      setBusyBacklogGameId(null);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <p className="text-muted-foreground">Loading account...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="container mx-auto py-10 px-4 space-y-8">
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/60 pb-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 ring-4 ring-abyss-800 shadow-xl">
              <AvatarImage src={profileUser.avatar} alt={profileUser.username} />
              <AvatarFallback className="text-2xl bg-abyss-800 text-azure-50">
                {getInitials(profileUser.username)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">{profileUser.username}</h1>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex border-abyss-700 bg-abyss-900/50 hover:bg-abyss-800 text-azure-100 hover:text-white"
                  disabled
                >
                  <Settings className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:flex gap-3 w-full lg:w-auto">
            <div className="bg-muted/30 border rounded-lg p-4 flex flex-col justify-center items-center text-center lg:min-w-[110px]">
              <span className="text-2xl font-bold">{stats.games}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Total Games</span>
            </div>
            <div className="bg-muted/30 border rounded-lg p-4 flex flex-col justify-center items-center text-center lg:min-w-[110px]">
              <span className="text-2xl font-bold">{stats.reviews}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Reviews</span>
            </div>
            <div className="bg-muted/30 border rounded-lg p-4 flex flex-col justify-center items-center text-center lg:min-w-[110px]">
              <span className="text-2xl font-bold">{stats.following}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Following</span>
            </div>
            <div className="bg-muted/30 border rounded-lg p-4 flex flex-col justify-center items-center text-center lg:min-w-[110px]">
              <span className="text-2xl font-bold">{stats.followers}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Followers</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full space-y-6">
          <div className="w-full">
            <TabsList className="bg-muted/50 p-1 flex w-full h-auto">
              <TabsTrigger value="profile" className="flex-1 text-sm sm:text-base py-2">Profile</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1 text-sm sm:text-base py-2">Reviews</TabsTrigger>
              <TabsTrigger value="backlog" className="flex-1 text-sm sm:text-base py-2">Backlog</TabsTrigger>
              <TabsTrigger value="lists" className="flex-1 text-sm sm:text-base py-2">Lists</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="mt-8 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              <div className="lg:col-span-8 space-y-10">
                <section>
                  <div className="flex justify-between items-baseline border-b border-border/40 pb-2 mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Favorite Games</h3>
                    <span className="text-xs text-muted-foreground">Remove favorites from here</span>
                  </div>
                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {favorites.slice(0, 8).map((game) => (
                        <div key={game.id} className="relative aspect-[3/4] rounded-md overflow-hidden group border border-abyss-700 shadow-md bg-abyss-800/50">
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="absolute right-2 top-2 z-20 h-8 w-8 border border-abyss-700 bg-abyss-950/90 text-azure-50 hover:bg-abyss-900"
                            onClick={() => handleFavoriteRemove(game.id)}
                            disabled={busyFavoriteId === game.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <img src={changeImageSize(game.cover_image_url, "cover_big")} alt={game.title} className="w-full h-full object-cover opacity-70" />
                          <div className="absolute inset-0 bg-black/35 flex items-end p-2">
                            <p className="text-azure-50 font-medium text-xs sm:text-sm line-clamp-2">{game.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No favorite games yet.</p>
                  )}
                </section>

                <section>
                  <div className="flex justify-between items-baseline border-b border-border/40 pb-2 mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
                    <span className="text-xs text-muted-foreground">Latest reviews</span>
                  </div>
                  {recentActivity.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="space-y-3 group">
                          <div className="relative aspect-[3/4] rounded-md overflow-hidden border border-abyss-700 shadow-md bg-abyss-800/50">
                            <img
                              src={changeImageSize(activity.coverImageUrl, "cover_big")}
                              alt={activity.game}
                              className="w-full h-full object-cover opacity-75"
                            />
                            <div className="absolute inset-0 bg-black/35 flex items-end p-2">
                              <p className="text-azure-50 font-medium text-xs sm:text-sm line-clamp-2">{activity.game}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <Badge className="bg-abyss-900/80 border border-abyss-700 flex gap-1 items-center text-abyss-50 text-xs">
                              <Star className="w-3 h-3 fill-azure-400 text-azure-400" /> {activity.rating}/10
                            </Badge>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{activity.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent review activity.</p>
                  )}
                </section>
              </div>

              <div className="lg:col-span-4 space-y-10">
                <section className="space-y-3 pt-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">{profileUser.bio}</p>
                  <a href="#" className="inline-flex items-center gap-1.5 text-sm text-azure-500 hover:text-azure-400 transition-colors font-medium">
                    <LinkIcon className="w-3.5 h-3.5" /> github.com/{profileUser.username}
                  </a>
                </section>

                <section>
                  <div className="flex justify-between items-baseline border-b border-border/40 pb-2 mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ratings</h3>
                    <span className="text-xs text-azure-500 font-bold">{stats.reviews} Total</span>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-abyss-800 bg-abyss-900/40 p-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Average Score</p>
                      <p className="mt-1 text-2xl font-bold text-azure-100">{averageRating}<span className="text-sm text-muted-foreground">/10</span></p>
                    </div>

                    <div className="space-y-2">
                      {[...ratingDistribution].sort((a, b) => b.stars - a.stars).map((rate) => {
                        const widthPercentage = Math.max((rate.count / maxRatingCount) * 100, rate.count > 0 ? 8 : 0);
                        return (
                          <div key={rate.stars} className="grid grid-cols-[40px_1fr_32px] items-center gap-2">
                            <div className="text-xs font-medium text-abyss-300">
                              {rate.stars}
                              <Star className="w-2.5 h-2.5 inline fill-abyss-300 ml-0.5 -mt-0.5" />
                            </div>
                            <div className="h-2 rounded-full border border-abyss-800 bg-abyss-950 overflow-hidden">
                              <div className="h-full rounded-full bg-azure-500" style={{ width: `${widthPercentage}%` }} />
                            </div>
                            <div className="text-right text-xs text-muted-foreground">{rate.count}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8 outline-none animate-in fade-in-50 duration-500">
            {reviewCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {reviewCards.map((review) => (
                  <div key={review.id} className="flex flex-col bg-abyss-900 border border-abyss-800 rounded-lg overflow-hidden hover:border-azure-500/50 hover:shadow-[0_0_15px_rgba(26,133,255,0.1)] transition-all duration-300">
                    <div className="w-full h-24 bg-abyss-950 border-b border-abyss-800 relative overflow-hidden">
                      <img
                        src={changeImageSize(review.coverImageUrl, "screenshot_med")}
                        alt={review.game}
                        className="w-full h-full object-cover opacity-55"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-abyss-900 via-black/20 to-transparent z-10"></div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="min-w-0 pr-2">
                          <h4 className="font-bold text-lg text-azure-50 leading-tight truncate">{review.game}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{review.date}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className="bg-abyss-950 border border-abyss-700 flex gap-1 items-center text-abyss-50 shadow-sm">
                            <Star className="w-3 h-3 fill-azure-400 text-azure-400" /> {review.rating}/10
                          </Badge>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-abyss-700 bg-abyss-950/70 hover:bg-abyss-900"
                            onClick={() => {
                              const sourceReview = reviews.find((item) => item.game_id === review.gameId);
                              if (sourceReview) {
                                startEditingReview(sourceReview);
                              }
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-abyss-700 bg-abyss-950/70 hover:bg-abyss-900"
                            onClick={() => handleReviewDelete(review.gameId)}
                            disabled={deletingReviewGameId === review.gameId || busyReviewGameId === review.gameId}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {editingReviewGameId === review.gameId ? (
                        <div className="mt-1 flex flex-1 flex-col gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Rating</label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              step={1}
                              value={draftReviewScore}
                              onChange={(event) => setDraftReviewScore(event.target.value)}
                              className="border-abyss-700 bg-abyss-950/70"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Review</label>
                            <textarea
                              value={draftReviewText}
                              onChange={(event) => setDraftReviewText(event.target.value)}
                              rows={5}
                              className="min-h-28 w-full rounded-md border border-abyss-700 bg-abyss-950/70 px-3 py-2 text-sm text-foreground outline-none transition focus:border-azure-500"
                            />
                          </div>

                          <div className="mt-auto flex items-center gap-2">
                            <Button
                              type="button"
                              className="gap-2 bg-azure-600 hover:bg-azure-500 text-white"
                              onClick={() => handleReviewSave(review.gameId)}
                              disabled={busyReviewGameId === review.gameId}
                            >
                              <Save className="h-4 w-4" /> Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="gap-2 border-abyss-700 bg-transparent hover:bg-abyss-800"
                              onClick={() => handleReviewDelete(review.gameId)}
                              disabled={deletingReviewGameId === review.gameId || busyReviewGameId === review.gameId}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="gap-2 border-abyss-700 bg-transparent hover:bg-abyss-800"
                              onClick={cancelEditingReview}
                              disabled={busyReviewGameId === review.gameId || deletingReviewGameId === review.gameId}
                            >
                              <X className="h-4 w-4" /> Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mt-1">{review.text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No reviews posted yet.</p>
            )}
          </TabsContent>

          <TabsContent value="backlog" className="mt-8 outline-none animate-in fade-in-50 duration-500">
            <div className="w-full">
              <div className="flex justify-between items-baseline mb-6 border-b border-border/40 pb-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Backlog</h3>
                <span className="text-xs text-azure-500 font-medium">Update status or remove games here</span>
              </div>
              {backlogPreview.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {backlogPreview.map((game) => (
                    <div key={game.id} className="flex flex-row items-center p-4 gap-4 sm:gap-6 bg-abyss-900 border border-abyss-800 rounded-lg">
                      <div className="w-16 h-24 rounded-md overflow-hidden shrink-0 border border-abyss-700 shadow-sm bg-abyss-800">
                        <img
                          src={changeImageSize(game.coverImageUrl, "cover_big")}
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 justify-center">
                        <h4 className="font-bold text-lg truncate">{game.title}</h4>
                        <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted-foreground mt-1.5">
                          <Badge variant="outline" className="text-[10px] py-0 bg-background border-abyss-700">{game.platform}</Badge>
                          <span className="font-medium text-foreground/80 text-xs sm:text-sm">{formatBacklogStatus(game.status)}</span>
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col w-48 shrink-0 gap-1.5 px-4">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Est. {game.hoursTotal}h</span>
                          <span className="font-medium text-foreground">{game.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-abyss-950 rounded-full overflow-hidden border border-abyss-800">
                          <div className="h-full bg-azure-500" style={{ width: `${game.progress}%` }} />
                        </div>
                      </div>
                      <div className="flex min-w-[168px] flex-col gap-2">
                        <Select
                          value={game.status}
                          onValueChange={(value) => handleBacklogStatusChange(game.id, value as BacklogStatus)}
                          disabled={busyBacklogGameId === game.id}
                        >
                          <SelectTrigger className="border-abyss-700 bg-abyss-950/80">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="backlog">Backlog</SelectItem>
                            <SelectItem value="playing">Playing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="abandoned">Abandoned</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2 border-abyss-700 bg-transparent hover:bg-abyss-800"
                          onClick={() => handleBacklogRemove(game.id)}
                          disabled={busyBacklogGameId === game.id}
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No backlog games yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lists" className="mt-8 outline-none animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_LISTS.map((list) => (
                <div key={list.id} className="relative group cursor-pointer mt-2">
                  <div className="absolute -inset-1 bg-gradient-to-r from-azure-600 to-azure-400 rounded-lg blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative bg-abyss-900 border border-abyss-800 rounded-lg p-5 flex flex-col gap-5 hover:bg-abyss-800/80 transition-all duration-300 ease-out shadow-lg">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 pr-4">
                        <h4 className="font-bold text-lg text-azure-50 mb-1.5 truncate group-hover:text-azure-300 transition-colors duration-300">{list.title}</h4>
                        <div className="flex items-center text-xs text-muted-foreground gap-3">
                          <span className="flex items-center gap-1 font-medium"><LayoutGrid className="w-3 h-3 text-azure-500" /> {list.gameCount} Games</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-azure-500" /> {list.updated}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] py-0 h-5 bg-abyss-950 border-abyss-700 text-muted-foreground shrink-0">
                        ♥ {list.likes}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
