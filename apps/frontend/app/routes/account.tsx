import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Star,
  Settings,
  Link as LinkIcon,
  LayoutGrid,
  Clock,
  BookOpen,
  FileText,
  Pencil,
  PenLine,
  Save,
  Trash2,
  X,
  Plus,
  MoreHorizontal,
  Gamepad2,
  ExternalLink,
  PlayCircle,
  ArrowRightCircle,
  CheckCircle2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  getAllArticles,
  getAllGames,
  getFavoriteGames,
  getGameGuides,
  getPlaylistEntries,
  getPlaylistGames,
  getReviews,
  deleteReview,
  removeFavoriteByGame,
  removeFromPlaylist,
  updatePlaylistEntryByGame,
  updateReview,
  getUserLists,
  getListGames,
  createList,
  updateList,
  deleteList,
  type ApiArticle,
  type ApiGame,
  type ApiGuide,
  type ApiReview,
  type ApiGameList,
  type PlaylistEntry,
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
  hoursPlayed: number;
  hoursTotal: number;
  coverImageUrl: string | null;
};

type BacklogStatus = "want_to_play" | "playing" | "completed";

type UserListItem = ApiGameList & {
  gameCount: number;
  coverImages: string[];
};

type UserGuideCard = ApiGuide & {
  gameTitle: string;
  gameCoverImageUrl: string | null;
};

const FALLBACK_COVER =
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co39at.webp";

export function statusToProgress(status: string) {
  if (status === "completed") return 100;
  if (status === "playing") return 45;
  return 0;
}

export function normalizeBacklogStatus(status: string): BacklogStatus {
  if (status === "playing") return "playing";
  if (status === "completed") return "completed";
  if (status === "backlog") return "want_to_play";
  return "want_to_play";
}

export function toApiBacklogStatus(status: BacklogStatus) {
  return status;
}

export function formatBacklogStatus(status: BacklogStatus) {
  if (status === "want_to_play") return "Up Next";
  if (status === "playing") return "Playing";
  return "Completed";
}

export function formatDate(value?: string) {
  if (!value) {
    return "Recently";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString();
}

export function getReviewCreatedAt(review: ApiReview) {
  return review.created_at ?? review.CreatedAt;
}

export function changeImageSize(url: string | null | undefined, size: string) {
  if (!url) return FALLBACK_COVER;
  return url.replace(/t_[a-z0-9]+/, `t_${size}`);
}

export function normalizeReviewScore(score: number) {
  return Math.min(10, Math.max(1, Math.round(score)));
}

export default function AccountPage() {
  const isAuthorized = useRequireAuth();
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);

  const [favorites, setFavorites] = useState<ApiGame[]>([]);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [backlogPreview, setBacklogPreview] = useState<BacklogPreviewItem[]>([]);
  const [gameTitleById, setGameTitleById] = useState<Record<number, string>>({});
  const [gameCoverById, setGameCoverById] = useState<Record<number, string | null>>({});
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [guides, setGuides] = useState<UserGuideCard[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReviewGameId, setEditingReviewGameId] = useState<number | null>(null);
  const [draftReviewScore, setDraftReviewScore] = useState("0");
  const [draftReviewText, setDraftReviewText] = useState("");
  const [busyFavoriteId, setBusyFavoriteId] = useState<number | null>(null);
  const [busyReviewGameId, setBusyReviewGameId] = useState<number | null>(null);
  const [deletingReviewGameId, setDeletingReviewGameId] = useState<number | null>(null);
  const [busyBacklogGameId, setBusyBacklogGameId] = useState<number | null>(null);

  const [userLists, setUserLists] = useState<UserListItem[]>([]);
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [editingListItem, setEditingListItem] = useState<ApiGameList | null>(null);
  const [listFormName, setListFormName] = useState("");
  const [listFormDescription, setListFormDescription] = useState("");
  const [isSavingList, setIsSavingList] = useState(false);

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

        const [favoriteGames, userReviews, playlistEntries, playlistGames, allGames, allArticles] = await Promise.all([
          getFavoriteGames(user.id),
          getReviews({ userId: user.id }),
          getPlaylistEntries(user.id),
          getPlaylistGames(user.id),
          getAllGames(),
          getAllArticles().catch(() => []),
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

        setArticles(
          allArticles
            .filter((article) => article.user_id === user.id)
            .sort((a, b) => {
              const aTime = new Date(a.updated_at ?? a.UpdatedAt ?? a.created_at ?? a.CreatedAt ?? 0).getTime();
              const bTime = new Date(b.updated_at ?? b.UpdatedAt ?? b.created_at ?? b.CreatedAt ?? 0).getTime();
              return bTime - aTime;
            }),
        );

        const guideGroups = await Promise.all(
          allGames.map(async (game) => {
            try {
              const gameGuides = await getGameGuides(game.id);
              return gameGuides
                .filter((guide) => guide.user_id === user.id)
                .map((guide) => ({
                  ...guide,
                  gameTitle: game.title,
                  gameCoverImageUrl: game.cover_image_url ?? null,
                }));
            } catch {
              return [] as UserGuideCard[];
            }
          }),
        );
        if (!active) return;
        setGuides(
          guideGroups
            .flat()
            .sort((a, b) => {
              const aTime = new Date(a.updated_at ?? a.UpdatedAt ?? a.created_at ?? a.CreatedAt ?? 0).getTime();
              const bTime = new Date(b.updated_at ?? b.UpdatedAt ?? b.created_at ?? b.CreatedAt ?? 0).getTime();
              return bTime - aTime;
            }),
        );

        setReviews(
          userReviews.map((review) => ({
            ...review,
            text:
              review.text && review.text.trim()
                ? review.text
                : `Thoughts on ${titleMap[review.game_id] ?? "this game"}.`,
          })),
        );

        const entryByGameId = new Map<number, PlaylistEntry>();
        for (const entry of playlistEntries) {
          entryByGameId.set(entry.game_id, entry);
        }

        const preview = playlistGames.map((game) => {
          const entry = entryByGameId.get(game.id);
          const status = normalizeBacklogStatus(entry?.status ?? "want_to_play");
          const baseProgress = statusToProgress(status);
          const backendHours = entry?.hours_played && entry.hours_played > 0 ? entry.hours_played : 0;
          const hoursTotal = 30; // Will be properly seeded eventually
          const progress = backendHours > 0 ? Math.min(100, Math.round((backendHours / hoursTotal) * 100)) : baseProgress;

          const hoursPlayed = backendHours > 0 ? backendHours : Math.round((hoursTotal * baseProgress) / 100);

          return {
            id: game.id,
            title: game.title,
            platform: game.genre ?? "Unknown",
            status,
            progress,
            hoursPlayed,
            hoursTotal,
            coverImageUrl: game.cover_image_url ?? null,
          };
        });

        setBacklogPreview(preview);

        try {
          const lists = await getUserLists(user.id);
          const enriched: UserListItem[] = await Promise.all(
            lists.map(async (list) => {
              try {
                const games = await getListGames(list.id);
                return {
                  ...list,
                  gameCount: games.length,
                  coverImages: games.slice(0, 4).map((g) =>
                    changeImageSize(g.cover_image_url, "cover_big"),
                  ),
                };
              } catch {
                return { ...list, gameCount: 0, coverImages: [] };
              }
            }),
          );
          if (active) setUserLists(enriched);
        } catch {}
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
    articles: articles.length,
    guides: guides.length,
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
      current.map((game) => {
        if (game.id !== gameId) return game;

        let hoursPlayed = game.hoursPlayed;
        if (nextStatus === "want_to_play") {
          hoursPlayed = 0;
        } else if (nextStatus === "completed") {
          hoursPlayed = game.hoursTotal;
        }

        const progress = Math.min(100, Math.round((hoursPlayed / (game.hoursTotal || 1)) * 100));
        return { ...game, status: nextStatus, hoursPlayed, progress };
      }),
    );

    const gameToUpdate = backlogPreview.find((g) => g.id === gameId);
    let hoursToSend: number | undefined;
    if (nextStatus === "want_to_play") {
      hoursToSend = 0;
    } else if (nextStatus === "completed" && gameToUpdate) {
      hoursToSend = gameToUpdate.hoursTotal;
    }

    try {
      await updatePlaylistEntryByGame(user.id, gameId, {
        status: toApiBacklogStatus(nextStatus),
        ...(hoursToSend !== undefined ? { hours_played: hoursToSend } : {}),
      });
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

  const handleBacklogUpdateHours = async (gameId: number, hoursPlayed: number) => {
    const user = getStoredUser();
    if (!user) {
      setError("No user session found");
      return;
    }

    setError(null);
    setBusyBacklogGameId(gameId);

    const previous = backlogPreview;
    setBacklogPreview((current) =>
      current.map((game) => {
        if (game.id !== gameId) return game;

        let status = game.status;
        if (status === "want_to_play" && hoursPlayed > 0) status = "playing";
        if (hoursPlayed >= game.hoursTotal && game.hoursTotal > 0) status = "completed";

        const progress = Math.min(100, Math.round((hoursPlayed / (game.hoursTotal || 1)) * 100));
        return { ...game, status, hoursPlayed, progress };
      }),
    );

    const gameToUpdate = backlogPreview.find((g) => g.id === gameId);
    if (!gameToUpdate) return;

    let targetStatus: BacklogStatus = gameToUpdate.status;
    if (targetStatus === "want_to_play" && hoursPlayed > 0) targetStatus = "playing";
    if (hoursPlayed >= gameToUpdate.hoursTotal && gameToUpdate.hoursTotal > 0) targetStatus = "completed";

    try {
      await updatePlaylistEntryByGame(user.id, gameId, {
        status: toApiBacklogStatus(targetStatus),
        hours_played: hoursPlayed,
      });
    } catch (err) {
      setBacklogPreview(previous);
      setError(err instanceof Error ? err.message : "Failed to update logged hours");
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
              <span className="text-2xl font-bold">{stats.articles}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Articles</span>
            </div>
            <div className="bg-muted/30 border rounded-lg p-4 flex flex-col justify-center items-center text-center lg:min-w-[110px]">
              <span className="text-2xl font-bold">{stats.guides}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Guides</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full space-y-6">
          <div className="w-full">
            <TabsList className="bg-muted/50 p-1 flex w-full h-auto">
              <TabsTrigger value="profile" className="flex-1 text-sm sm:text-base py-2">Profile</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1 text-sm sm:text-base py-2">Reviews</TabsTrigger>
              <TabsTrigger value="writing" className="flex-1 text-sm sm:text-base py-2">Writing</TabsTrigger>
              <TabsTrigger value="backlog" className="flex-1 text-sm sm:text-base py-2">Backlog</TabsTrigger>
              <TabsTrigger value="lists" className="flex-1 text-sm sm:text-base py-2">Lists</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="mt-8 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              <div className="lg:col-span-8 space-y-10">
                <section>
                  <div className="flex justify-between items-baseline border-b border-border/40 pb-2 mb-4">
                    <h3 className="text-sm font-medium text-white uppercase tracking-wider">Favorite Games</h3>
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
                          <img src={changeImageSize(game.cover_image_url, "cover_big")} alt={game.title} className="w-full h-full object-cover opacity-100" />
                          <div className="absolute inset-0 bg-black/10 flex items-end p-2">
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
                    <h3 className="text-sm font-medium text-white uppercase tracking-wider">Recent Activity</h3>
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
                              className="w-full h-full object-cover opacity-100"
                            />
                            <div className="absolute inset-0 bg-black/10 flex items-end p-2">
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

                <section>
                  <div className="flex justify-between items-baseline border-b border-border/40 pb-2 mb-4">
                    <h3 className="text-sm font-medium text-white uppercase tracking-wider">Community Writing</h3>
                    <span className="text-xs text-muted-foreground">Articles and guides</span>
                  </div>
                  {articles.length > 0 || guides.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {articles.slice(0, 2).map((article) => (
                        <Link
                          key={`article-${article.id}`}
                          to={`/articles/${article.id}`}
                          className="group rounded-lg border border-abyss-800 bg-abyss-900/60 p-4 transition hover:border-azure-500/60 hover:bg-abyss-900"
                        >
                          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-azure-300">
                            <FileText className="h-3.5 w-3.5" />
                            Article
                          </div>
                          <h4 className="line-clamp-2 text-base font-bold text-azure-50 transition group-hover:text-azure-200">
                            {article.title}
                          </h4>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {article.content}
                          </p>
                        </Link>
                      ))}
                      {guides.slice(0, 2).map((guide) => (
                        <div
                          key={`guide-${guide.game_id}-${guide.id}`}
                          className="group rounded-lg border border-abyss-800 bg-abyss-900/60 p-4 transition hover:border-azure-500/60 hover:bg-abyss-900"
                        >
                          <Link to={`/games/${guide.game_id}/community/guides/${guide.id}`}>
                            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-azure-300">
                              <BookOpen className="h-3.5 w-3.5" />
                              Guide
                            </div>
                            <h4 className="line-clamp-2 text-base font-bold text-azure-50 transition group-hover:text-azure-200">
                              {guide.title}
                            </h4>
                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                              {guide.gameTitle}
                            </p>
                          </Link>
                          <Link
                            to={`/games/${guide.game_id}/community/guides/${guide.id}/edit`}
                            className="mt-4 inline-flex items-center gap-2 rounded-md border border-abyss-700 bg-abyss-950/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
                          >
                            <PenLine className="h-3.5 w-3.5" />
                            Edit Guide
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No articles or guides published yet.</p>
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

          <TabsContent value="writing" className="mt-8 outline-none animate-in fade-in-50 duration-500">
            <div className="grid gap-8 lg:grid-cols-2">
              <section>
                <div className="mb-5 flex items-center justify-between border-b border-border/40 pb-2">
                  <h3 className="text-sm font-medium text-white uppercase tracking-wider">My Articles</h3>
                  <span className="text-xs font-bold text-azure-400">{articles.length}</span>
                </div>
                {articles.length > 0 ? (
                  <div className="space-y-3">
                    {articles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/articles/${article.id}`}
                        className="group block rounded-lg border border-abyss-800 bg-abyss-900/70 p-4 transition hover:border-azure-500/60 hover:bg-abyss-900"
                      >
                        <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-azure-300">
                          <FileText className="h-3.5 w-3.5" />
                          {formatDate(article.created_at ?? article.CreatedAt)}
                        </div>
                        <h4 className="text-lg font-bold text-azure-50 transition group-hover:text-azure-200">
                          {article.title}
                        </h4>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {article.content}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No articles yet.</p>
                )}
              </section>

              <section>
                <div className="mb-5 flex items-center justify-between border-b border-border/40 pb-2">
                  <h3 className="text-sm font-medium text-white uppercase tracking-wider">My Guides</h3>
                  <span className="text-xs font-bold text-azure-400">{guides.length}</span>
                </div>
                {guides.length > 0 ? (
                  <div className="space-y-3">
                    {guides.map((guide) => (
                      <div
                        key={`${guide.game_id}-${guide.id}`}
                        className="group rounded-lg border border-abyss-800 bg-abyss-900/70 p-3 transition hover:border-azure-500/60 hover:bg-abyss-900"
                      >
                        <div className="grid grid-cols-[64px_1fr] gap-4">
                          <Link to={`/games/${guide.game_id}/community/guides/${guide.id}`}>
                            <img
                              src={changeImageSize(guide.gameCoverImageUrl, "cover_big")}
                              alt={`${guide.gameTitle} cover`}
                              className="aspect-[3/4] w-16 rounded-md border border-abyss-700 object-cover"
                            />
                          </Link>
                          <div className="min-w-0 py-1">
                            <Link to={`/games/${guide.game_id}/community/guides/${guide.id}`}>
                              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-azure-300">
                                <BookOpen className="h-3.5 w-3.5" />
                                {guide.gameTitle}
                              </div>
                              <h4 className="line-clamp-2 text-base font-bold text-azure-50 transition group-hover:text-azure-200">
                                {guide.title}
                              </h4>
                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                {guide.content}
                              </p>
                            </Link>
                            <Link
                              to={`/games/${guide.game_id}/community/guides/${guide.id}/edit`}
                              className="mt-4 inline-flex items-center gap-2 rounded-md border border-abyss-700 bg-abyss-950/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
                            >
                              <PenLine className="h-3.5 w-3.5" />
                              Edit Guide
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-abyss-700 bg-abyss-900/40 p-6">
                    <p className="text-sm text-muted-foreground">No guides yet.</p>
                    <Link
                      to="/community"
                      className="mt-4 inline-flex rounded-lg bg-azure-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-azure-500"
                    >
                      Find a Game Community
                    </Link>
                  </div>
                )}
              </section>
            </div>
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
                    <BacklogCardItem
                      key={game.id}
                      game={game}
                      isBusy={busyBacklogGameId === game.id}
                      onMarkPlaying={() => handleBacklogStatusChange(game.id, "playing")}
                      onMoveToUpNext={() => handleBacklogStatusChange(game.id, "want_to_play")}
                      onMarkCompleted={() => handleBacklogStatusChange(game.id, "completed")}
                      onRemove={() => handleBacklogRemove(game.id)}
                      onUpdateHours={(hours) => handleBacklogUpdateHours(game.id, hours)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No backlog games yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lists" className="mt-8 outline-none animate-in fade-in-50 duration-500">
            <div className="flex justify-between items-baseline mb-6 border-b border-border/40 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">My Lists</h3>
              <Button
                size="sm"
                className="gap-2 bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400 border border-azure-400/50 shadow-[0_0_15px_rgba(26,133,255,0.4)] text-white"
                onClick={() => {
                  setEditingListItem(null);
                  setListFormName("");
                  setListFormDescription("");
                  setListDialogOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5" /> New List
              </Button>
            </div>
            {userLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userLists.map((list) => (
                  <Link
                    key={list.id}
                    to={`/lists/${list.id}`}
                    className="group relative flex flex-col bg-abyss-900 border border-abyss-700 hover:border-azure-500/50 hover:shadow-[0_0_20px_rgba(26,133,255,0.12)] rounded-xl overflow-hidden transition-all duration-300"
                  >
                    <div className="relative h-32 bg-abyss-950 overflow-hidden shrink-0">
                      {list.coverImages.length > 0 ? (
                        <div
                          className={`grid h-full w-full ${
                            list.coverImages.length === 1
                              ? "grid-cols-1"
                              : list.coverImages.length === 2
                                ? "grid-cols-2"
                                : list.coverImages.length === 3
                                  ? "grid-cols-3"
                                  : "grid-cols-2 grid-rows-2"
                          }`}
                        >
                          {list.coverImages.slice(0, 4).map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt=""
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <LayoutGrid className="w-8 h-8 text-abyss-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-abyss-900 via-transparent to-transparent opacity-80" />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-abyss-900/80 border border-abyss-700 flex gap-1 items-center text-abyss-50 text-xs shadow-sm">
                          <Gamepad2 className="w-3 h-3 text-azure-400" />
                          {list.gameCount}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start flex-1 w-full min-w-0">
                        <div className="min-w-0 pr-4 flex-1">
                          <h4 className="font-bold text-lg text-azure-50 mb-1 truncate group-hover:text-azure-300 transition-colors duration-300">
                            {list.name}
                          </h4>
                          {list.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {list.description}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="p-1.5 -mr-1.5 -mt-1 rounded-md hover:bg-abyss-800 transition-colors text-muted-foreground shrink-0"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 border-abyss-700 bg-abyss-900">
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer focus:bg-abyss-800"
                              onSelect={(e) => {
                                e.preventDefault();
                                navigate(`/lists/${list.id}`);
                              }}
                            >
                              <ExternalLink className="w-4 h-4 text-azure-400" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer focus:bg-abyss-800"
                              onSelect={(e) => {
                                e.preventDefault();
                                setEditingListItem(list);
                                setListFormName(list.name);
                                setListFormDescription(list.description || "");
                                setListDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-abyss-800" />
                            <DropdownMenuItem
                              className="gap-2 text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
                              onSelect={async (e) => {
                                e.preventDefault();
                                if (!sessionUser) return;
                                try {
                                  await deleteList(sessionUser.id, list.id);
                                  setUserLists((prev) =>
                                    prev.filter((l) => l.id !== list.id),
                                  );
                                } catch (err) {
                                  setError(
                                    err instanceof Error
                                      ? err.message
                                      : "Failed to delete list",
                                  );
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
                <LayoutGrid className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No lists yet. Create one to curate your favorite games!</p>
              </div>
            )}

            <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
              <DialogContent className="bg-abyss-900 border-abyss-700 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingListItem ? "Edit List" : "Create New List"}</DialogTitle>
                  <DialogDescription>
                    {editingListItem ? "Update your list details." : "Give your list a name and optional description."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">Name</label>
                    <Input
                      value={listFormName}
                      onChange={(e) => setListFormName(e.target.value)}
                      placeholder="e.g. Top 10 RPGs"
                      className="border-abyss-700 bg-abyss-950/70"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">Description</label>
                    <textarea
                      value={listFormDescription}
                      onChange={(e) => setListFormDescription(e.target.value)}
                      placeholder="What's this list about?"
                      rows={3}
                      className="w-full rounded-md border border-abyss-700 bg-abyss-950/70 px-3 py-2 text-sm text-foreground outline-none transition focus:border-azure-500 resize-none"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setListDialogOpen(false)} className="border-abyss-700">
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!sessionUser || !listFormName.trim()) return;
                      setIsSavingList(true);
                      setError(null);
                      try {
                        if (editingListItem) {
                          const updated = await updateList(sessionUser.id, editingListItem.id, {
                            name: listFormName.trim(),
                            description: listFormDescription.trim() || undefined,
                          });
                          setUserLists((prev) => prev.map((l) => l.id === updated.id ? { ...updated, gameCount: l.gameCount, coverImages: l.coverImages } : l));
                        } else {
                          const created = await createList(sessionUser.id, {
                            name: listFormName.trim(),
                            description: listFormDescription.trim() || undefined,
                          });
                          setUserLists((prev) => [{ ...created, gameCount: 0, coverImages: [] }, ...prev]);
                        }
                        setListDialogOpen(false);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to save list");
                      } finally {
                        setIsSavingList(false);
                      }
                    }}
                    disabled={!listFormName.trim() || isSavingList}
                    className="bg-azure-600 hover:bg-azure-500 text-white"
                  >
                    {isSavingList ? "Saving..." : editingListItem ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function BacklogCardItem({
  game,
  isBusy,
  onMarkPlaying,
  onMoveToUpNext,
  onMarkCompleted,
  onRemove,
  onUpdateHours,
}: {
  game: BacklogPreviewItem;
  isBusy: boolean;
  onMarkPlaying: () => void;
  onMoveToUpNext: () => void;
  onMarkCompleted: () => void;
  onRemove: () => void;
  onUpdateHours: (hours: number) => void;
}) {
  const [isLogHoursOpen, setIsLogHoursOpen] = useState(false);
  const [draftHours, setDraftHours] = useState(game.hoursPlayed);

  useEffect(() => {
    if (!isLogHoursOpen) {
      setDraftHours(game.hoursPlayed);
    }
  }, [game.hoursPlayed, isLogHoursOpen]);

  const handleOpenLogHours = () => {
    setIsLogHoursOpen(true);
  };

  const handleSaveHours = () => {
    onUpdateHours(draftHours);
    setIsLogHoursOpen(false);
  };

  return (
    <>
      <div className="flex flex-row items-center p-4 gap-4 sm:gap-6 bg-abyss-900 border border-abyss-800 rounded-lg">
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
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-azure-500" />
              <span className="text-xs font-bold text-foreground">{game.hoursPlayed}h</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-col w-48 shrink-0 gap-1.5 px-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Est. {game.hoursTotal}h</span>
            <span className="font-medium text-foreground">{game.progress}%</span>
          </div>
          <Progress value={game.progress} className="h-2" />
        </div>
        <div className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isBusy}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2" onSelect={onMarkPlaying}>
                <PlayCircle className="w-4 h-4" /> Mark as Playing
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onSelect={handleOpenLogHours}>
                <Clock className="w-4 h-4" /> Log Hours Played
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onSelect={onMoveToUpNext}>
                <ArrowRightCircle className="w-4 h-4" /> Move to Up Next
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onSelect={onMarkCompleted}>
                <CheckCircle2 className="w-4 h-4" /> Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                onSelect={onRemove}
              >
                <Trash2 className="w-4 h-4" /> Remove from Backlog
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isLogHoursOpen} onOpenChange={setIsLogHoursOpen}>
        <DialogContent className="sm:max-w-[450px] bg-abyss-950 border-abyss-800">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black tracking-tighter">LOG HOURS</DialogTitle>
            <DialogDescription>
              Update your progress for <span className="text-foreground font-bold">{game.title}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-8 pt-4">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">New Total</span>
                  <span className="text-3xl font-black text-azure-500 tracking-tighter">{draftHours}h</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Current</span>
                  <span className="text-xl font-bold opacity-50">{game.hoursPlayed}h</span>
                </div>
              </div>
              <div className="relative px-2 py-4 bg-abyss-900/50 border border-abyss-800 rounded-xl">
                <Slider
                  value={[draftHours]}
                  max={Math.max(game.hoursTotal, game.hoursPlayed) * 1.5}
                  step={1}
                  onValueChange={(vals) => setDraftHours(vals[0])}
                  className="py-4"
                />
              </div>
              <div className="bg-azure-500/5 border border-azure-500/10 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-azure-500">
                  <span>Projected Completion</span>
                  <span>{Math.min(100, Math.round((draftHours / game.hoursTotal) * 100))}%</span>
                </div>
                <Progress value={(draftHours / (game.hoursTotal || 1)) * 100} className="h-2" />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-abyss-800">
              <Button variant="ghost" onClick={() => setIsLogHoursOpen(false)} className="font-bold uppercase tracking-widest text-[10px]">Discard</Button>
              <Button onClick={handleSaveHours} className="bg-azure-600 hover:bg-azure-500 text-white font-black uppercase tracking-widest text-[10px] px-8">Confirm Log</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
