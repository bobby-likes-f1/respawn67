import { useEffect, useMemo, useState } from "react";
import { Link, type LoaderFunctionArgs, useLoaderData } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Eye,
  Heart,
  ListPlus,
  LayoutGrid,
  CircleCheckBig,
  CircleAlert,
  MessageCircleMore,
  Clock,
} from "lucide-react";
import {
  addFavorite,
  addToPlaylist,
  createReview,
  deleteReview,
  getFavoriteEntries,
  getGameById,
  getPlaylistEntries,
  getPublicReviews,
  getReviews,
  getUserById,
  removeFavoriteByGame,
  removeFromPlaylist,
  updateReview,
  type ApiGame,
  type ApiReview,
<<<<<<< HEAD
  type ApiUser,
=======
>>>>>>> ce7bf038c4d48d0ca69d1916c659b97eb25b6b5e
} from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";

const FALLBACK_COVER =
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co39at.webp";

export function changeImageSize(url: string | null | undefined, size: string): string {
  if (!url) return "https://via.placeholder.com/264x374?text=No+Image";
  return url.replace(/t_[a-z0-9]+/, `t_${size}`);
}

const MOCK_GAMES_DB: Record<string, any> = {
  "1": {
    id: "1",
    title: "Outer Wilds",
    developer: "Mobius Digital",
    year: "2019",
    tagline: "WELCOME TO THE SPACE PROGRAM.",
    description:
      "Welcome to the Space Program! You are the newest recruit of Outer Wilds Ventures, a fledgling space program searching for answers in a strange, constantly evolving solar system.",
    bannerImage: "https://images.igdb.com/igdb/image/upload/t_1080p_2x/co65ac.webp",
    posterImage: "https://images.igdb.com/igdb/image/upload/t_1080p/co65ac.webp",
    genres: ["SCI-FI", "ADVENTURE", "MYSTERY"],
    platforms: ["PC", "PS5", "SWITCH"],
    rating: 9.8,
    stats: { views: "842K", lists: "215K", likes: "401K" },
  },
};

export function toUiGameData(game: ApiGame | null, fallbackId: string) {
  if (!game) {
    return MOCK_GAMES_DB[fallbackId] || MOCK_GAMES_DB["1"];
  }

  const genres = (game.genre ?? "Action")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  // Derive time to beat from game ID (same as games page)
  const derivedTimeToBeat = 12 + (game.id % 24);

  return {
    id: String(game.id),
    title: game.title,
    developer: game.developer ?? "Unknown Studio",
    year: game.release_year ? String(game.release_year) : "TBA",
    tagline: `${game.title.toUpperCase()} AWAITS.`,
    description:
      "Discover this title on Respawn67. Add it to your playlist, favorite it, and leave your own review.",
    bannerImage: changeImageSize(game.cover_image_url, "720p") ?? FALLBACK_COVER,
    posterImage: changeImageSize(game.cover_image_url, "cover_big") ?? FALLBACK_COVER,
    genres: genres.length > 0 ? genres : ["ACTION"],
    platforms: ["PC", "CONSOLE"],
    rating: undefined,
    stats: { views: "-", lists: "-", likes: "-" },
    timeToBeat: {
<<<<<<< HEAD
      mainStory: game.main_story_hours ?? derivedTimeToBeat,
      mainPlusExtras: game.main_plus_extras_hours ?? null,
      completionist: game.completionist_hours ?? null,
=======
      main: game.time_to_beat_main ?? null,
      extras: game.time_to_beat_extras ?? null,
      completionist: game.time_to_beat_completionist ?? null,
>>>>>>> ce7bf038c4d48d0ca69d1916c659b97eb25b6b5e
    },
  };
}

export function meta({ data }: any) {
  const title = data?.gameData?.title || "Game Details";
  return [
    { title: `${title} | Respawn67` },
    { name: "description", content: "View game description, reviews, and ratings." },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id ?? "1";
  console.log(`[Loader] Loading game with id: ${id}`);
  let gameData: ApiGame | null = null;

  try {
    gameData = await getGameById(id);
    console.log(`[Loader] Game data received:`, gameData);
  } catch (err) {
    console.error(`[Loader] Error fetching game:`, err);
    gameData = null;
  }

  return { gameData, id };
}

export default function GameDetailsPage() {
  const loaderData = useLoaderData<typeof loader>();
  const gameId = Number(loaderData.id);
  const uiData = toUiGameData(loaderData.gameData, loaderData.id ?? "1");

  const sessionUser = useMemo(() => getStoredUser(), []);
  const isAuthenticated = Boolean(sessionUser && getToken());

  const [isLiked, setIsLiked] = useState(false);
  const [inPlaylist, setInPlaylist] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [reviewUpdatedAt, setReviewUpdatedAt] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewToast, setReviewToast] = useState<{
    message: string;
    tone: "success" | "warning" | "info";
  } | null>(null);

  const [otherReviews, setOtherReviews] = useState<ApiReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const isReviewed = rating > 0;

  const [otherReviews, setOtherReviews] = useState<(ApiReview & { author?: ApiUser })[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    if (!reviewToast?.message) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setReviewToast(null);
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [reviewToast]);

  const showReviewToast = (
    message: string,
    tone: "success" | "warning" | "info" = "info",
  ) => {
    setReviewToast({ message, tone });
  };

  useEffect(() => {
    if (!isAuthenticated || !sessionUser || Number.isNaN(gameId)) {
      return;
    }

    let active = true;

    (async () => {
      try {
        setError(null);

        const [favoriteEntries, playlistEntries, reviewEntries, allGameReviews] = await Promise.all([
          getFavoriteEntries(sessionUser.id),
          getPlaylistEntries(sessionUser.id),
          getReviews({ userId: sessionUser.id, gameId }),
          getReviews({ gameId }),
        ]);

        if (!active) {
          return;
        }

        setIsLiked(favoriteEntries.some((entry) => entry.game_id === gameId));
        setInPlaylist(playlistEntries.some((entry) => entry.game_id === gameId));

        const existingReview = reviewEntries[0];
        if (existingReview) {
          setHasExistingReview(true);
          setRating(existingReview.score);
          setReviewText(existingReview.text ?? "");
          setReviewUpdatedAt(
            existingReview.updated_at ?? existingReview.UpdatedAt ?? existingReview.created_at ?? existingReview.CreatedAt ?? null,
          );
        } else {
          setHasExistingReview(false);
          setReviewText("");
          setReviewUpdatedAt(null);
        }

        // Filter out the current user's review from other reviews
        const filtered = allGameReviews.filter(
          (review) => review.user_id !== sessionUser.id,
        );
        setOtherReviews(filtered);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load interaction state");
      }
    })();

    return () => {
      active = false;
    };
  }, [gameId, isAuthenticated, sessionUser?.id]);

  // Fetch all reviews for the game
  useEffect(() => {
    if (Number.isNaN(gameId)) {
      return;
    }

    let active = true;
    setIsLoadingReviews(true);

    (async () => {
      try {
        const allReviews = await getPublicReviews({ gameId });
        if (!active) return;

        // Filter out current user's review from the list
        const otherUserReviews = allReviews.filter(
          (review) => !sessionUser || review.user_id !== sessionUser.id
        );

        // Fetch user info for each review
        const reviewsWithAuthors = await Promise.all(
          otherUserReviews.map(async (review) => {
            try {
              const author = await getUserById(review.user_id);
              return { ...review, author };
            } catch {
              return review;
            }
          })
        );

        if (!active) return;
        setOtherReviews(reviewsWithAuthors);
      } catch (err) {
        console.error("Failed to load reviews:", err);
        if (active) {
          setOtherReviews([]);
        }
      } finally {
        if (active) {
          setIsLoadingReviews(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [gameId, sessionUser?.id]);

  const interactionLabel = useMemo(() => {
    if (isSyncing) {
      return "Saving...";
    }
    if (rating < 1) {
      return "Set a rating to review";
    }
    return isReviewed ? "Edit review" : "Write review";
  }, [isReviewed, isSyncing, rating]);

  const openReviewEditor = () => {
    if (isSyncing) {
      return;
    }

    if (rating < 1) {
      showReviewToast("Set a rating first.", "warning");
      return;
    }

    setError(null);
    setIsReviewing(true);
  };

  const handleReviewDelete = async () => {
    if (!sessionUser || Number.isNaN(gameId) || !hasExistingReview) {
      return;
    }

    setError(null);
    setIsSyncing(true);

    const previousText = reviewText;
    const previousRating = rating;
    const previousUpdatedAt = reviewUpdatedAt;

    setHasExistingReview(false);
    setReviewText("");
    setRating(0);
    setHoverRating(0);
    setReviewUpdatedAt(null);
    setIsReviewing(false);

    try {
      await deleteReview(sessionUser.id, gameId);
      showReviewToast("Review deleted.", "success");
    } catch (err) {
      setHasExistingReview(true);
      setReviewText(previousText);
      setRating(previousRating);
      setReviewUpdatedAt(previousUpdatedAt);
      setError(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleFavorite = async () => {
    if (!sessionUser || Number.isNaN(gameId)) {
      return;
    }

    setError(null);
    setIsSyncing(true);

    const previous = isLiked;
    setIsLiked(!previous);

    try {
      if (previous) {
        await removeFavoriteByGame(sessionUser.id, gameId);
      } else {
        await addFavorite(sessionUser.id, gameId);
      }
    } catch (err) {
      setIsLiked(previous);
      setError(err instanceof Error ? err.message : "Failed to update favorite");
    } finally {
      setIsSyncing(false);
    }
  };

  const togglePlaylist = async () => {
    if (!sessionUser || Number.isNaN(gameId)) {
      return;
    }

    setError(null);
    setIsSyncing(true);

    const previous = inPlaylist;
    setInPlaylist(!previous);

    try {
      if (previous) {
        await removeFromPlaylist(sessionUser.id, gameId);
      } else {
        await addToPlaylist(sessionUser.id, gameId, "want_to_play");
      }
    } catch (err) {
      setInPlaylist(previous);
      setError(err instanceof Error ? err.message : "Failed to update playlist");
    } finally {
      setIsSyncing(false);
    }
  };

  const saveReview = async () => {
    if (!sessionUser || Number.isNaN(gameId) || rating < 1) {
      showReviewToast("Set a rating first.", "warning");
      return;
    }

    setError(null);
    setIsSyncing(true);

    const payload = {
      score: rating,
      text: reviewText.trim() || undefined,
    };

    try {
      if (hasExistingReview) {
        const updatedReview = await updateReview(sessionUser.id, gameId, payload);
        setReviewUpdatedAt(
          updatedReview.updated_at ?? updatedReview.UpdatedAt ?? updatedReview.created_at ?? updatedReview.CreatedAt ?? null,
        );
      } else {
        const createdReview = await createReview({
          user_id: sessionUser.id,
          game_id: gameId,
          score: rating,
          text: reviewText.trim() || undefined,
        });
        setHasExistingReview(true);
        setReviewUpdatedAt(
          createdReview.updated_at ?? createdReview.UpdatedAt ?? createdReview.created_at ?? createdReview.CreatedAt ?? null,
        );
      }

      setIsReviewing(false);
      showReviewToast(hasExistingReview ? "Review updated." : "Review saved.", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save review");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative pb-24 select-none">
      {reviewToast ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur ${
              reviewToast.tone === "success"
                ? "border-azure-400/60 bg-abyss-900/95 text-azure-50"
                : reviewToast.tone === "warning"
                  ? "border-azure-300/55 bg-abyss-800/95 text-azure-100"
                  : "border-abyss-600/90 bg-abyss-900/95 text-abyss-100"
            }`}
          >
            {reviewToast.tone === "success" ? (
              <CircleCheckBig className="h-4 w-4 shrink-0 text-azure-300" />
            ) : reviewToast.tone === "warning" ? (
              <CircleAlert className="h-4 w-4 shrink-0 text-azure-200" />
            ) : (
              <MessageCircleMore className="h-4 w-4 shrink-0 text-abyss-200" />
            )}
            <span>{reviewToast.message}</span>
          </div>
        </div>
      ) : null}

      <div className="w-full h-[45vh] sm:h-[55vh] relative flex items-center justify-center bg-abyss-950 overflow-hidden pointer-events-none">
        <img
          src={uiData.bannerImage}
          alt={`${uiData.title} Banner`}
          className="absolute inset-0 w-full h-full object-cover opacity-30 sm:opacity-40 animate-in fade-in duration-1000 ease-out"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <div className="absolute inset-0 bg-black/20 z-0 mix-blend-multiply"></div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 relative z-10 flex-1 flex flex-col xl:flex-row items-center xl:items-start xl:justify-center -mt-20 sm:-mt-32 gap-8 lg:gap-12 xl:gap-16">
        <div className="flex flex-col items-center shrink-0 w-48 sm:w-56 md:w-64 max-w-full">
          <div className="w-full aspect-[3/4] rounded-lg overflow-hidden border border-abyss-700/50 shadow-2xl bg-abyss-900 shadow-black/80 ring-1 ring-white/10 group cursor-pointer relative">
            <img
              src={uiData.posterImage}
              alt={`${uiData.title} Poster`}
              className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-500 ease-out"
            />
          </div>

          <div className="flex items-center justify-between w-full px-2 text-[11px] text-muted-foreground mt-4 font-medium tracking-wide">
            <span className="flex items-center gap-1" title="Watched/Logged">
              <Eye className="w-3.5 h-3.5 text-emerald-500" /> {uiData.stats.views}
            </span>
            <span className="flex items-center gap-1" title="Lists">
              <LayoutGrid className="w-3 h-3 text-blue-400" /> {uiData.stats.lists}
            </span>
            <span className="flex items-center gap-1" title="Likes">
              <Heart className="w-3 h-3 text-orange-500 fill-orange-500/20" /> {uiData.stats.likes}
            </span>
          </div>
        </div>

        <div className="flex-[2] flex flex-col pt-0 xl:pt-36 w-full max-w-2xl text-center xl:text-left">
          <div className="flex flex-col mb-4 lg:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight text-azure-50 leading-tight drop-shadow-xl select-text">
              {uiData.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-x-3 gap-y-1 mt-2 md:mt-1 font-sans">
              <span className="text-2xl md:text-[28px] text-muted-foreground/40 font-black tracking-tight drop-shadow-sm leading-none">
                {uiData.year || uiData.release_year}
              </span>
              <span className="text-base md:text-lg text-muted-foreground/70 font-semibold tracking-tight">
                Developed by <span className="text-azure-50 font-bold ml-1">{uiData.developer}</span>
              </span>
            </div>
          </div>

          <h3 className="text-xs uppercase tracking-widest text-muted-foreground/80 font-bold mb-4 text-balance">
            {uiData.tagline}
          </h3>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-pretty mb-8">
            {uiData.description}
          </p>

          <div className="flex flex-col gap-5 border-t border-abyss-800/60 pt-6">
            {(uiData.timeToBeat?.mainStory || uiData.timeToBeat?.mainPlusExtras || uiData.timeToBeat?.completionist) && (
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                <span className="uppercase text-[10px] sm:text-xs tracking-[0.2em] font-bold text-muted-foreground sm:w-20 shrink-0 text-center xl:text-left text-azure-500/80">Time To Beat</span>
                <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
                  {uiData.timeToBeat?.mainStory && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs py-0.5 px-3 bg-abyss-900 border-abyss-800 text-muted-foreground flex gap-1.5 items-center">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {uiData.timeToBeat.mainStory} hour{uiData.timeToBeat.mainStory !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
              <span className="uppercase text-[10px] sm:text-xs tracking-[0.2em] font-bold text-muted-foreground sm:w-20 shrink-0 text-center xl:text-left text-azure-500/80">Rating</span>
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
                {uiData.rating && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs py-0.5 px-3 bg-abyss-900 border-abyss-800 text-muted-foreground flex gap-1 items-center">
                    <Star className="w-3 h-3 fill-azure-400 text-azure-400" />
                    {uiData.rating}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-t border-abyss-800/20 sm:border-0 pt-4 sm:pt-0">
              <span className="uppercase text-[10px] sm:text-xs tracking-[0.2em] font-bold text-muted-foreground sm:w-20 shrink-0 text-center xl:text-left text-azure-500/80">Genres</span>
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
                {uiData.genres?.map((g: string) => (
                  <Badge key={g} variant="outline" className="text-[10px] sm:text-xs py-0.5 px-3 bg-abyss-900 border-abyss-800 text-muted-foreground">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-t border-abyss-800/20 sm:border-0 pt-4 sm:pt-0">
              <span className="uppercase text-[10px] sm:text-xs tracking-[0.2em] font-bold text-muted-foreground sm:w-20 shrink-0 text-center xl:text-left text-azure-500/80">Releases</span>
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
                {uiData.platforms?.map((p: string) => (
                  <Badge key={p} variant="outline" className="text-[10px] sm:text-xs py-0.5 px-3 bg-abyss-900 border-abyss-800 text-muted-foreground">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>

            {uiData.timeToBeat && (uiData.timeToBeat.main || uiData.timeToBeat.extras || uiData.timeToBeat.completionist) && (
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-t border-abyss-800/20 sm:border-0 pt-4 sm:pt-0">
                <span className="uppercase text-[10px] sm:text-xs tracking-[0.2em] font-bold text-muted-foreground sm:w-20 shrink-0 text-center xl:text-left text-azure-500/80">Time to Beat</span>
                <div className="w-full max-w-xs">
                  <div className="grid grid-cols-3 gap-2 bg-abyss-950/30 border border-abyss-800/50 rounded-lg overflow-hidden">
                    {uiData.timeToBeat.main && (
                      <div className="p-3 text-center border-r border-abyss-800/50 last:border-r-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Main</p>
                        <p className="text-sm font-bold text-azure-400 mt-1">{uiData.timeToBeat.main}h</p>
                      </div>
                    )}
                    {uiData.timeToBeat.extras && (
                      <div className="p-3 text-center border-r border-abyss-800/50 last:border-r-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">+ Extras</p>
                        <p className="text-sm font-bold text-azure-400 mt-1">{uiData.timeToBeat.extras}h</p>
                      </div>
                    )}
                    {uiData.timeToBeat.completionist && (
                      <div className="p-3 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">100%</p>
                        <p className="text-sm font-bold text-azure-400 mt-1">{uiData.timeToBeat.completionist}h</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 w-full max-w-sm xl:max-w-[280px] 2xl:max-w-[320px] mx-auto xl:mx-0 xl:pt-40 mt-12 xl:mt-0 relative z-20">
          {!isAuthenticated ? (
            <div className="bg-abyss-900 border border-abyss-800 rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] sticky top-24 ring-1 ring-white/5 p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-abyss-950/80 border border-abyss-800 flex items-center justify-center mb-1 shadow-inner">
                <Eye className="w-5 h-5 text-azure-500/80" />
              </div>
              <h3 className="text-lg font-bold text-azure-50 tracking-tight leading-tight">Sign in to rate or review</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">Share your gaming experiences, track your backlog, and join the community.</p>
              <Link
                to="/login"
                className="w-full bg-azure-600 hover:bg-azure-500 text-white font-bold py-2.5 rounded-lg transition-colors shadow-[0_0_15px_rgba(56,189,248,0.2)] text-sm text-center"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <div className="bg-abyss-900 border border-abyss-800 rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] sticky top-24 ring-1 ring-white/5 transition-all">
              {error ? <p className="text-xs text-red-400 px-4 py-2">{error}</p> : null}

              <div className="grid grid-cols-3 bg-abyss-950/60 divide-x divide-abyss-800/60">
                <div
                  onClick={openReviewEditor}
                  className={`p-3 pb-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 group hover:bg-azure-500/10 ${isReviewed ? "bg-azure-500/5 hover:bg-azure-500/15" : ""}`}
                >
                  <Eye className={`w-7 h-7 stroke-1 pb-1 transition-all duration-300 ${isReviewed ? "text-azure-400" : "text-muted-foreground group-hover:text-azure-400"}`} />
                  <span className={`text-[9.5px] uppercase font-bold tracking-wider transition-colors ${isReviewed ? "text-azure-400" : "text-muted-foreground group-hover:text-azure-400"}`}>
                    {isReviewed ? "Reviewed" : "Review"}
                  </span>
                </div>
                <div
                  onClick={() => {
                    if (!isSyncing) {
                      void toggleFavorite();
                    }
                  }}
                  className={`p-3 pb-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 group hover:bg-azure-500/10 ${isLiked ? "bg-azure-500/5 hover:bg-azure-500/15" : ""}`}
                >
                  <Heart className={`w-7 h-7 stroke-1 pb-1 transition-all duration-300 ${isLiked ? "text-azure-400 fill-azure-400" : "text-muted-foreground group-hover:text-azure-400"}`} />
                  <span className={`text-[9.5px] uppercase font-bold tracking-wider transition-colors ${isLiked ? "text-azure-400" : "text-muted-foreground group-hover:text-azure-400"}`}>
                    {isLiked ? "Liked" : "Like"}
                  </span>
                </div>
                <div
                  onClick={() => {
                    if (!isSyncing) {
                      void togglePlaylist();
                    }
                  }}
                  className={`p-3 pb-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 group hover:bg-azure-500/10 ${inPlaylist ? "bg-azure-500/5 hover:bg-azure-500/15" : ""}`}
                >
                  <ListPlus className={`w-7 h-7 stroke-1 pb-1 transition-all duration-300 ${inPlaylist ? "text-azure-400" : "text-muted-foreground group-hover:text-azure-400"}`} />
                  <span className={`text-[9.5px] uppercase font-bold tracking-wider transition-colors ${inPlaylist ? "text-azure-400" : "text-muted-foreground group-hover:text-azure-400"}`}>
                    {inPlaylist ? "In Playlist" : "Playlist"}
                  </span>
                </div>
              </div>

              <div className="px-4 py-6 border-t border-abyss-800/60 flex flex-col items-center gap-3 bg-abyss-900/60 backdrop-blur-sm shadow-inner group/rater">
                <div className="flex justify-between w-full max-w-[220px]">
                  <span className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Rate</span>
                </div>

                <div className="flex items-center gap-[2px] justify-center relative" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((index) => {
                    const valLeft = index * 2 - 1;
                    const valRight = index * 2;

                    const currentScore = hoverRating || rating;
                    const isFull = currentScore >= valRight;
                    const isHalf = currentScore === valLeft;

                    return (
                      <div key={index} className="relative w-9 h-9 sm:w-10 sm:h-10 cursor-pointer">
                        <Star className="absolute inset-0 w-full h-full fill-abyss-800 text-abyss-800/50" />

                        <div className={`absolute top-0 left-0 h-full overflow-hidden pointer-events-none transition-all duration-150 ${isHalf ? "w-1/2" : isFull ? "w-full" : "w-0"}`}>
                          <Star className="w-9 h-9 sm:w-10 sm:h-10 fill-azure-400 text-azure-400" />
                        </div>

                        <div
                          className="absolute top-0 left-0 w-1/2 h-full z-10"
                          onMouseEnter={() => setHoverRating(valLeft)}
                          onClick={() => {
                            setRating(valLeft);
                            setError(null);
                          }}
                        />
                        <div
                          className="absolute top-0 right-0 w-1/2 h-full z-10"
                          onMouseEnter={() => setHoverRating(valRight)}
                          onClick={() => {
                            setRating(valRight);
                            setError(null);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col text-[13px] font-semibold bg-abyss-900/60 divide-y divide-abyss-800/60 mt-0.5 relative transition-all duration-300">
                {isReviewing ? (
                  <div className="p-3 bg-abyss-950/40 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] uppercase font-bold text-azure-400 tracking-wider">Review</span>
                      <span className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString()}</span>
                    </div>
                    <textarea
                      autoFocus
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Write your review..."
                      className="w-full bg-abyss-900/80 border border-abyss-700/80 rounded-md p-3 text-sm text-azure-50 placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:border-azure-500 focus:ring-1 focus:ring-azure-500 min-h-[96px] shadow-inner"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsReviewing(false)}
                        className="flex-1 cursor-pointer py-2 rounded-md bg-abyss-800 hover:bg-abyss-700 text-muted-foreground hover:text-white transition-colors text-xs uppercase tracking-wider font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          void saveReview();
                        }}
                        className="flex-[2] cursor-pointer py-2 rounded-md bg-azure-600 hover:bg-azure-500 text-white transition-colors shadow-[0_0_8px_rgba(56,189,248,0.4)] text-xs uppercase tracking-wider font-bold"
                      >
                        {isSyncing ? "Saving..." : "Save Review"}
                      </button>
                    </div>
                  </div>
                ) : hasExistingReview ? (
                  <div className="border-t border-abyss-800/60 p-4">
                    <div className="rounded-lg border border-abyss-800 bg-abyss-950/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-azure-400">Your review</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {reviewUpdatedAt ? new Date(reviewUpdatedAt).toLocaleDateString() : "Saved just now"}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-abyss-700 bg-abyss-900 text-azure-50">
                          <Star className="mr-1 h-3 w-3 fill-azure-400 text-azure-400" /> {rating}/10
                        </Badge>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap text-sm font-normal leading-relaxed text-muted-foreground">
                        {reviewText.trim() || "No written review yet. You rated this game."}
                      </p>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={openReviewEditor}
                          className="flex-1 cursor-pointer rounded-md bg-abyss-800 py-2 text-xs font-bold uppercase tracking-wider text-azure-50 transition-colors hover:bg-abyss-700"
                        >
                          Edit review
                        </button>
                        <button
                          onClick={() => {
                            void handleReviewDelete();
                          }}
                          className="flex-1 cursor-pointer rounded-md border border-abyss-700 bg-transparent py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-abyss-800 hover:text-white"
                        >
                          {isSyncing ? "Deleting..." : "Delete review"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={openReviewEditor}
                    className="py-4 px-4 text-center cursor-pointer transition-colors border-t border-abyss-800/60 flex items-center justify-center gap-2 text-muted-foreground/80 hover:bg-abyss-800/80 hover:text-white"
                  >
                    {interactionLabel}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

<<<<<<< HEAD
      {/* Reviews Section */}
      {otherReviews.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 mt-16 mb-16 max-w-3xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-azure-50 mb-2">Community Reviews</h2>
            <p className="text-sm text-muted-foreground">
              {otherReviews.length} {otherReviews.length === 1 ? "review" : "reviews"} from other players
            </p>
          </div>

          <div className="space-y-4">
            {otherReviews.map((review) => (
              <div
                key={review.ID || review.id}
                className="bg-abyss-900 border border-abyss-800 rounded-lg p-5 hover:border-abyss-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-azure-50 truncate">
                      {review.author?.username || `User ${review.user_id}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : review.CreatedAt
                          ? new Date(review.CreatedAt).toLocaleDateString()
                          : "Recently"}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-abyss-700 bg-abyss-950 text-azure-50 shrink-0">
                    <Star className="mr-1 h-3 w-3 fill-azure-400 text-azure-400" />
                    {review.score}/10
                  </Badge>
                </div>

                {review.text && (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {review.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
=======
      <section className="container mx-auto px-4 sm:px-6 py-16 border-t border-abyss-800/30">
        <div className="flex justify-between items-baseline mb-8 border-b border-abyss-800/40 pb-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Community Reviews {otherReviews.length > 0 && `(${otherReviews.length})`}
          </h2>
        </div>

        {otherReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherReviews.map((review) => (
              <div
                key={`${review.user_id}-${review.id}`}
                className="flex flex-col bg-abyss-900 border border-abyss-800 rounded-lg overflow-hidden hover:border-azure-500/50 hover:shadow-[0_0_15px_rgba(26,133,255,0.1)] transition-all duration-300"
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6 shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${review.username || `User${review.user_id}`}`} />
                          <AvatarFallback className="text-[10px] font-bold">{review.username ? review.username.slice(0, 2).toUpperCase() : `U${review.user_id}`}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold text-azure-50 line-clamp-1">{review.username || `User ${review.user_id}`}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {review.created_at || review.CreatedAt
                          ? new Date(review.created_at || review.CreatedAt || "").toLocaleDateString()
                          : "Recently"}
                      </p>
                    </div>
                    <Badge className="bg-abyss-950 border border-abyss-700 flex gap-1 items-center text-abyss-50 shadow-sm shrink-0">
                      <Star className="w-3 h-3 fill-azure-400 text-azure-400" /> {review.score}/10
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mt-2">
                    {review.text?.trim() || "No written review. Rating only."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircleMore className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No community reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </section>
>>>>>>> ce7bf038c4d48d0ca69d1916c659b97eb25b6b5e
    </div>
  );
}
