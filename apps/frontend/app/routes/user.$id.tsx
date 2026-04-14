import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
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
  Link as LinkIcon,
  LayoutGrid,
  Gamepad2,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  getUserById,
  getAllGames,
  getFavoriteGames,
  getPlaylistEntries,
  getPlaylistGames,
  getPublicReviews,
  getPublicUserLists,
  getListGames,
  type ApiUser,
  type ApiGame,
  type ApiReview,
  type ApiGameList,
  type PlaylistEntry,
} from "@/lib/api";
import { getInitials, getMemberSinceLabel, getStoredUser, type AuthUser } from "@/lib/auth";

const FALLBACK_COVER =
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co39at.webp";

function changeImageSize(url: string | null | undefined, size: string): string {
  if (!url) return FALLBACK_COVER;
  return url.replace(/t_[a-z0-9_]+/, `t_${size}`);
}

function formatDate(value?: string) {
  if (!value) return "Recently";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleDateString();
}

type BacklogStatus = "want_to_play" | "playing" | "completed";

function normalizeBacklogStatus(status: string): BacklogStatus {
  if (status === "playing") return "playing";
  if (status === "completed") return "completed";
  if (status === "backlog") return "want_to_play";
  return "want_to_play";
}

function statusToProgress(status: string) {
  if (status === "completed") return 100;
  if (status === "playing") return 45;
  return 0;
}

function formatBacklogStatus(status: BacklogStatus) {
  if (status === "want_to_play") return "Up Next";
  if (status === "playing") return "Playing";
  return "Completed";
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

type UserListItem = ApiGameList & {
  gameCount: number;
  coverImages: string[];
};

type ReviewCard = {
  id: number;
  gameId: number;
  game: string;
  rating: number;
  date: string;
  text: string;
  coverImageUrl: string | null;
};

export default function PublicProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [profileUser, setProfileUser] = useState<ApiUser | null>(null);

  const [favorites, setFavorites] = useState<ApiGame[]>([]);
  const [reviews, setReviews] = useState<ReviewCard[]>([]);
  const [backlogPreview, setBacklogPreview] = useState<BacklogPreviewItem[]>([]);
  const [userLists, setUserLists] = useState<UserListItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSessionUser(getStoredUser());
  }, []);

  // redirect if own profile
  useEffect(() => {
    if (!id || !sessionUser) return;
    if (String(sessionUser.id) === String(id)) {
      navigate("/account", { replace: true });
    }
  }, [id, sessionUser, navigate]);

  useEffect(() => {
    if (!id) return;

    let active = true;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const user = await getUserById(id);
        if (!active) return;
        setProfileUser(user);

        const [favoriteGames, userReviews, playlistEntries, playlistGames, allGames, lists] =
          await Promise.all([
            getFavoriteGames(user.id),
            getPublicReviews({ userId: user.id }),
            getPlaylistEntries(user.id).catch(() => []),
            getPlaylistGames(user.id).catch(() => []),
            getAllGames(),
            getPublicUserLists(user.id),
          ]);

        if (!active) return;

        setFavorites(favoriteGames);

        // game lookups
        const titleMap: Record<number, string> = {};
        const coverMap: Record<number, string | null> = {};
        for (const game of allGames) {
          titleMap[game.id] = game.title;
          coverMap[game.id] = game.cover_image_url ?? null;
        }

        // map reviews
        setReviews(
          userReviews.map((review) => ({
            id: review.id ?? review.ID ?? review.game_id,
            gameId: review.game_id,
            game: titleMap[review.game_id] ?? `Game #${review.game_id}`,
            rating: review.score,
            date: formatDate(review.created_at ?? review.CreatedAt),
            text: review.text && review.text.trim()
              ? review.text
              : `Thoughts on ${titleMap[review.game_id] ?? "this game"}.`,
            coverImageUrl: coverMap[review.game_id] ?? null,
          })),
        );

        // map backlog
        const entryByGameId = new Map<number, PlaylistEntry>();
        for (const entry of playlistEntries) {
          entryByGameId.set(entry.game_id, entry);
        }

        const preview = (playlistGames as ApiGame[]).map((game) => {
          const entry = entryByGameId.get(game.id);
          const status = normalizeBacklogStatus(entry?.status ?? "want_to_play");
          const baseProgress = statusToProgress(status);
          const backendHours = entry?.hours_played && entry.hours_played > 0 ? entry.hours_played : 0;
          const hoursTotal = 30; // Pending backend seed
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

        // map lists
        const enrichedLists: UserListItem[] = await Promise.all(
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
        if (active) setUserLists(enrichedLists);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const ratingDistribution = useMemo(() => {
    const distribution = [
      { stars: 1, count: 0 },
      { stars: 2, count: 0 },
      { stars: 3, count: 0 },
      { stars: 4, count: 0 },
      { stars: 5, count: 0 },
    ];
    for (const review of reviews) {
      const bucket = Math.min(5, Math.max(1, Math.ceil(review.rating / 2)));
      distribution[bucket - 1].count += 1;
    }
    return distribution;
  }, [reviews]);

  const maxRatingCount = Math.max(...ratingDistribution.map((r) => r.count), 1);
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "0.0";
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const stats = {
    games: backlogPreview.length,
    reviews: reviews.length,
    following: 0,
    followers: 0,
  };

  const recentActivity = reviews.slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="container mx-auto py-16 px-4">
          <p className="text-muted-foreground">Loading profile...</p>
        </main>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="container mx-auto py-16 px-4 space-y-4">
          <h1 className="text-4xl font-black tracking-tighter font-pixel">User Not Found</h1>
          <p className="text-muted-foreground">This user doesn't exist.</p>
          <Button variant="outline" asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </main>
      </div>
    );
  }

  const profileAvatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profileUser.username)}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="container mx-auto py-10 px-4 space-y-8">
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/60 pb-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 ring-4 ring-abyss-800 shadow-xl">
              <AvatarImage src={profileAvatar} alt={profileUser.username} />
              <AvatarFallback className="text-2xl bg-abyss-800 text-azure-50">
                {getInitials(profileUser.username)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{profileUser.username}</h1>
              <p className="text-sm text-muted-foreground">
                Member since {getMemberSinceLabel(profileUser as any) ?? "2026"}
              </p>
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
                    <h3 className="text-sm font-medium text-white uppercase tracking-wider">Favorite Games</h3>
                  </div>
                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {favorites.slice(0, 8).map((game) => (
                        <Link key={game.id} to={`/games/${game.id}`} className="relative aspect-[3/4] rounded-md overflow-hidden group border border-abyss-700 shadow-md bg-abyss-800/50">
                          <img src={changeImageSize(game.cover_image_url, "cover_big")} alt={game.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/10 flex items-end p-2">
                            <p className="text-azure-50 font-medium text-xs sm:text-sm line-clamp-2">{game.title}</p>
                          </div>
                        </Link>
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
                          <Link to={`/games/${activity.gameId}`} className="relative aspect-[3/4] rounded-md overflow-hidden border border-abyss-700 shadow-md bg-abyss-800/50 block">
                            <img
                              src={changeImageSize(activity.coverImageUrl, "cover_big")}
                              alt={activity.game}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/10 flex items-end p-2">
                              <p className="text-azure-50 font-medium text-xs sm:text-sm line-clamp-2">{activity.game}</p>
                            </div>
                          </Link>
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
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profileUser.username}'s gaming profile
                  </p>
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
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {reviews.map((review) => (
                  <div key={review.id} className="flex flex-col bg-abyss-900 border border-abyss-800 rounded-lg overflow-hidden hover:border-azure-500/50 hover:shadow-[0_0_15px_rgba(26,133,255,0.1)] transition-all duration-300">
                    <div className="w-full h-24 bg-abyss-950 border-b border-abyss-800 relative overflow-hidden">
                      <img src={changeImageSize(review.coverImageUrl, "screenshot_med")} alt={review.game} className="w-full h-full object-cover opacity-55" />
                      <div className="absolute inset-0 bg-gradient-to-t from-abyss-900 via-black/20 to-transparent z-10"></div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="min-w-0 pr-2">
                          <Link to={`/games/${review.gameId}`} className="hover:text-azure-300 transition-colors">
                            <h4 className="font-bold text-lg text-azure-50 leading-tight truncate">{review.game}</h4>
                          </Link>
                          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{review.date}</p>
                        </div>
                        <Badge className="bg-abyss-950 border border-abyss-700 flex gap-1 items-center text-abyss-50 shadow-sm shrink-0">
                          <Star className="w-3 h-3 fill-azure-400 text-azure-400" /> {review.rating}/10
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1 mt-1">{review.text}</p>
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
              </div>
              {backlogPreview.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {backlogPreview.map((game) => (
                    <div key={game.id} className="flex flex-row items-center p-4 gap-4 sm:gap-6 bg-abyss-900 border border-abyss-800 rounded-lg">
                      <div className="w-16 h-24 rounded-md overflow-hidden shrink-0 border border-abyss-700 shadow-sm bg-abyss-800">
                        <img src={changeImageSize(game.coverImageUrl, "cover_big")} alt={game.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 justify-center">
                        <Link to={`/games/${game.id}`} className="hover:text-azure-300 transition-colors">
                          <h4 className="font-bold text-lg truncate">{game.title}</h4>
                        </Link>
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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No backlog games yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lists" className="mt-8 outline-none animate-in fade-in-50 duration-500">
            <div className="flex justify-between items-baseline mb-6 border-b border-border/40 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {profileUser.username}'s Lists
              </h3>
            </div>
            {userLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userLists.map((list) => (
                  <Link
                    key={list.id}
                    to={`/lists/${list.id}`}
                    className="group flex flex-col bg-abyss-900 border border-abyss-700 rounded-xl overflow-hidden hover:border-azure-500/50 hover:shadow-[0_0_20px_rgba(26,133,255,0.12)] transition-all duration-300"
                  >
                    <div className="relative h-32 bg-abyss-950 overflow-hidden">
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
                            <img key={i} src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <LayoutGrid className="w-8 h-8 text-abyss-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-abyss-900 via-transparent to-transparent opacity-80" />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-abyss-900/80 border border-abyss-700 flex gap-1 items-center text-abyss-50 text-xs">
                          <Gamepad2 className="w-3 h-3 text-azure-400" />
                          {list.gameCount}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-bold text-lg text-azure-50 leading-tight truncate group-hover:text-azure-200 transition-colors">
                        {list.name}
                      </h3>
                      {list.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{list.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
                <LayoutGrid className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{profileUser.username} hasn't created any lists yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
