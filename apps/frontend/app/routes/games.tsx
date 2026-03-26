import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, Clock } from "lucide-react";
import { getAllGames, type ApiGame } from "@/lib/api";
import type { Route } from "./+types/games";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Browse Games | Respawn67" },
    {
      name: "description",
      content: "Discover and explore thousands of video games.",
    },
  ];
}

// helper to change igdb image size
export function changeImageSize(url: string | null | undefined, size: string): string {
  if (!url) return "https://via.placeholder.com/264x374?text=No+Image";
  // replace t_{oldSize} with t_{newSize}
  return url.replace(/t_[a-z0-9]+/, `t_${size}`);
}

// turn ApiGame into ui data with defaults
export function transformGameData(game: ApiGame) {
  // keep these deterministic so ssr and client match
  const derivedRating = Number((8 + (game.id % 20) / 10).toFixed(1));
  const derivedTimeToBeat = 12 + (game.id % 24);

  return {
    id: game.id,
    title: game.title,
    rating: derivedRating,
    platform: game.developer ? [game.developer] : ["PC"],
    timeToBeat: derivedTimeToBeat,
    image: game.cover_image_url || "",
    spotlightImage: game.cover_image_url || "",
    description:
      "Discover this title on Respawn67. Add it to your playlist, favorite it, and leave your own review.",
  };
}

const MOCK_GAMES = [
  {
    id: 1,
    title: "Hades II",
    rating: 9.2,
    platform: ["PC"],
    timeToBeat: 22,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/coaknx.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/coaknx.webp",
    description:
      "Defy the god of the dead as you hack and slash your way out of the Underworld in this rogue-like dungeon crawler.",
  },
  {
    id: 2,
    title: "Ghost of Yotei",
    rating: 8.8,
    platform: ["PS5"],
    timeToBeat: 25,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co9coo.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/co9coo.webp",
    description:
      "Embark on a new samurai adventure in feudal Japan with breathtaking landscapes and intense combat.",
  },
  {
    id: 3,
    title: "Resident Evil Requiem",
    rating: 9.9,
    platform: ["PC", "Xbox", "PS5", "Switch 2"],
    timeToBeat: 12,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/cob3bo.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/cob3bo.webp",
    description:
      "Experience the ultimate survival horror as the nightmare continues in this terrifying new chapter.",
  },
  {
    id: 4,
    title: "GTA VI",
    rating: 9.9,
    platform: ["PS5", "Xbox"],
    timeToBeat: 50,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co9rwo.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/co9rwo.webp",
    description:
      "Return to Vice City in the most ambitious open-world experience ever created by Rockstar Games.",
  },
  {
    id: 5,
    title: "Doom: The Dark Ages",
    rating: 8.5,
    platform: ["PC", "Xbox"],
    timeToBeat: 15,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co9b3o.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/co9b3o.webp",
    description:
      "Travel back in time and unleash medieval hell in this brutal prequel to the Doom Slayer saga.",
  },
  {
    id: 6,
    title: "Monster Hunter Wilds",
    rating: 9.0,
    platform: ["PC", "PS5"],
    timeToBeat: 50,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co904o.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/co904o.webp",
    description:
      "Hunt massive beasts across stunning new environments in the next evolution of Monster Hunter.",
  },
  {
    id: 7,
    title: "Elden Ring",
    rating: 9.8,
    platform: ["PC", "PS5", "Xbox"],
    timeToBeat: 58,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co4jni.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/co4jni.webp",
    description:
      "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.",
  },
  {
    id: 8,
    title: "Hollow Knight",
    rating: 10,
    platform: ["PC", "Switch"],
    timeToBeat: 40,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/cobfzp.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/cobfzp.webp",
    description:
      "Descend into the depths of a forgotten kingdom in this award-winning hand-drawn metroidvania.",
  },
  {
    id: 9,
    title: "Hollow Knight: Silksong",
    rating: 10,
    platform: ["PC", "Switch"],
    timeToBeat: 30,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/cobebu.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/cobebu.webp",
    description:
      "Play as Hornet and explore a haunted kingdom ruled by silk and song in this sequel to Hollow Knight.",
  },
  {
    id: 10,
    title: "No Man's Sky",
    rating: 8.7,
    platform: ["PC", "PS5", "Xbox"],
    timeToBeat: 30,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/coacrk.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/coacrk.webp",
    description:
      "Explore an infinite universe of procedurally generated planets in this space exploration epic.",
  },
  {
    id: 11,
    title: "F1 25",
    rating: 8.6,
    platform: ["PC", "PS5", "Xbox"],
    timeToBeat: 20,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co9mk6.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/co9mk6.webp",
    description:
      "Experience the pinnacle of racing simulation with the official game of the 2025 FIA Formula One season.",
  },
  {
    id: 12,
    title: "Resident Evil 4",
    rating: 9.4,
    platform: ["PC", "PS5", "Xbox"],
    timeToBeat: 16,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co6bo0.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/co6bo0.webp",
    description:
      "Survival is just the beginning in this reimagined classic that redefined the horror genre.",
  },
  {
    id: 13,
    title: "Cyberpunk 2077",
    rating: 9.0,
    platform: ["PC", "PS5", "Xbox"],
    timeToBeat: 25,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/coaih8.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/coaih8.webp",
    description:
      "Become a cyberpunk outlaw and carve your path through Night City in this open-world RPG.",
  },
  {
    id: 14,
    title: "The Witcher 3",
    rating: 9.6,
    platform: ["PC", "PS5", "Xbox", "Switch"],
    timeToBeat: 51,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/coaarl.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/coaarl.webp",
    description:
      "Hunt monsters for coin and save the realm in this masterpiece of open-world fantasy storytelling.",
  },
  {
    id: 15,
    title: "Red Dead Redemption 2",
    rating: 9.7,
    platform: ["PC", "PS5", "Xbox"],
    timeToBeat: 50,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co1q1f.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/co1q1f.webp",
    description:
      "Live the outlaw life in America's unforgiving heartland in this epic tale of loyalty and survival.",
  },
  {
    id: 16,
    title: "Baldur's Gate 3",
    rating: 9.8,
    platform: ["PC", "PS5"],
    timeToBeat: 100,
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.webp",
    spotlightImage:
      "https://images.igdb.com/igdb/image/upload/t_original/co670h.webp",
    description:
      "Gather your party and return to the Forgotten Realms in this award-winning RPG masterpiece.",
  },
];

export default function GamesPage() {
  const [games, setGames] = useState<ReturnType<typeof transformGameData>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // fetch games on mount
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setIsLoading(true);
        const apiGames = await getAllGames();
        if (active) {
          const transformed = apiGames.map(transformGameData);
          setGames(transformed);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError("Failed to load games");
          // fall back to mock data on error
          setGames(MOCK_GAMES);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const displayGames = games.length > 0 ? games : MOCK_GAMES;

  // top 4 games for spotlight
  const spotlightGames = [...displayGames]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  // games ranked 5-8 for most popular
  const mostPopularGames = [...displayGames]
    .sort((a, b) => b.rating - a.rating)
    .slice(4, 8);

  // news items based on games
  const newsItems = [
    {
      game: displayGames[3] || displayGames[0],
      title: "New Game Released",
      description: "Check out the latest additions to our gaming library.",
      timeAgo: "2 hours ago",
    },
    {
      game: displayGames[7] || displayGames[1],
      title: "Community Spotlight",
      description: "Discover what players are currently playing and reviewing.",
      timeAgo: "5 hours ago",
    },
    {
      game: displayGames[12] || displayGames[2],
      title: "Game of the Week",
      description: "Find your next favorite game from our curated selection.",
      timeAgo: "1 day ago",
    },
  ];

  const gamesPerPage = 4;
  const totalPages = Math.ceil(displayGames.length / gamesPerPage);
  const displayedGames = displayGames.slice(
    currentPage * gamesPerPage,
    (currentPage + 1) * gamesPerPage,
  );

  useEffect(() => {
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 2.5;
      });
    }, 100);

    const slideInterval = setInterval(() => {
      setCurrentGameIndex((prev) => (prev + 1) % spotlightGames.length);
      setProgress(0);
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(slideInterval);
    };
  }, [spotlightGames.length]);

  const currentGame = spotlightGames[currentGameIndex] || spotlightGames[0];

  const nextGame = () => {
    setCurrentGameIndex((prev) => (prev + 1) % spotlightGames.length);
    setProgress(0);
  };

  const prevGame = () => {
    setCurrentGameIndex(
      (prev) => (prev - 1 + spotlightGames.length) % spotlightGames.length,
    );
    setProgress(0);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto py-10 px-4 space-y-16">
        {/* Spotlight Carousel */}
        <section className="relative h-[450px] w-full overflow-visible rounded-2xl bg-slate-900 flex items-end p-8 shadow-2xl">
          <div
            className="absolute inset-0 bg-cover transition-all duration-700 rounded-2xl"
            style={{
              backgroundImage: `url(${changeImageSize(currentGame.spotlightImage, "720p")})`,
              backgroundPosition: "center 40%",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 rounded-2xl" />

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-azure-500 text-white font-bold hover:bg-azure-400">
                Spotlight
              </Badge>
              <Badge className="bg-abyss-900/80 hover:bg-abyss-800 transition-colors border border-abyss-700 flex gap-1 items-center text-abyss-50">
                <Star className="w-3 h-3 fill-azure-400 text-azure-400" />
                {currentGame.rating}
              </Badge>
              <Badge className="bg-abyss-900/80 hover:bg-abyss-800 transition-colors border border-abyss-700 flex gap-1 items-center text-abyss-50">
                <Clock className="w-3 h-3 text-azure-400" />
                {currentGame.timeToBeat}h
              </Badge>
              <div className="flex gap-1 ml-2">
                {currentGame.platform.map((p) => (
                  <Badge
                    key={p}
                    className="bg-white/20 text-white border border-white/30 text-xs"
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
            <h2 className="text-5xl font-extrabold text-white tracking-tighter">
              {currentGame.title}
            </h2>
            <p className="text-slate-300 text-lg">{currentGame.description}</p>
            <Link to={`/games/${currentGame.id}`}>
              <Button
                size="lg"
                className="mt-4 px-8 py-6 text-lg bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400 border border-azure-400/50 shadow-[0_0_15px_rgba(26,133,255,0.4)] text-white font-bold"
              >
                View Game
              </Button>
            </Link>
          </div>

          {/* Navigation Buttons at edges */}
          <button
            onClick={prevGame}
            className="absolute -left-16 top-1/2 -translate-y-1/2 z-20 hover:bg-white/10 text-black p-3 transition-all hover:scale-125"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={nextGame}
            className="absolute -right-16 top-1/2 -translate-y-1/2 z-20 hover:bg-white/10 text-black p-3 transition-all hover:scale-125"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {spotlightGames.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentGameIndex(index);
                  setProgress(0);
                }}
                className={`h-2 rounded-full transition-all relative overflow-hidden ${
                  index === currentGameIndex ? "w-8" : "w-2"
                }`}
              >
                <div className="absolute inset-0 bg-white/50" />
                {index === currentGameIndex && (
                  <div
                    className="absolute inset-0 bg-white transition-all"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Hot games */}
        <section className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">
                Top Rated Games
              </h3>
              <p className="text-muted-foreground">
                The highest rated games of all time according to our community
              </p>
            </div>
            <Button
              onClick={() => navigate("/catalogue")}
              className="mt-1 bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400 border border-azure-400/50 shadow-[0_0_15px_rgba(26,133,255,0.4)] text-white"
            >
              View More Games
            </Button>
          </div>

          <div className="relative flex items-center gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="hover:bg-white/10 text-black p-3 transition-all hover:scale-125 disabled:opacity-30 disabled:hover:scale-100"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
              {displayedGames.map((game) => (
                <Link
                  key={game.id}
                  to={`/games/${game.id}`}
                  className="relative block aspect-[3/4] overflow-hidden rounded-lg group cursor-pointer transition-all hover:ring-2 hover:ring-primary"
                >
                  <img
                    src={changeImageSize(game.image, "cover_big")}
                    alt={game.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <Badge className="bg-abyss-900/80 hover:bg-abyss-800 transition-colors border border-abyss-700 flex gap-1 items-center text-abyss-50 text-xs">
                      <Star className="w-3 h-3 fill-azure-400 text-azure-400" />{" "}
                      {game.rating}
                    </Badge>
                    <Badge className="bg-abyss-900/80 hover:bg-abyss-800 transition-colors border border-abyss-700 flex gap-1 items-center text-abyss-50 text-xs">
                      <Clock className="w-3 h-3 text-azure-400" />
                      {game.timeToBeat}h
                    </Badge>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                    <h4 className="font-bold leading-tight text-white">
                      {game.title}
                    </h4>
                    <p className="text-xs text-white/80 uppercase tracking-wider">
                      {game.platform.join(", ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage === totalPages - 1}
              className="hover:bg-white/10 text-black p-3 transition-all hover:scale-125 disabled:opacity-30 disabled:hover:scale-100"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>
        </section>

        <hr className="border-border/60" />

        {/* Lists and news */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Most popular games list */}
          <section className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight">Trending Now</h3>
            <div className="space-y-4">
              {mostPopularGames.map((game) => (
                <Link
                  key={game.id}
                  to={`/games/${game.id}`}
                  className="relative block h-36 rounded-lg overflow-hidden group cursor-pointer transition-all hover:ring-2 hover:ring-primary"
                >
                  <img
                    src={changeImageSize(game.image, "screenshot_big")}
                    alt={game.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <Badge className="bg-abyss-900/80 hover:bg-abyss-800 transition-colors border border-abyss-700 flex gap-1 items-center text-abyss-50 text-xs">
                      <Star className="w-3 h-3 fill-azure-400 text-azure-400" />{" "}
                      {game.rating}
                    </Badge>
                    <Badge className="bg-abyss-900/80 hover:bg-abyss-800 transition-colors border border-abyss-700 flex gap-1 items-center text-abyss-50 text-xs">
                      <Clock className="w-3 h-3 text-azure-400" />
                      {game.timeToBeat}h
                    </Badge>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                    <h4 className="font-bold text-white">{game.title}</h4>
                    <p className="text-xs text-white/80">
                      {game.platform.join(" • ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Latest news */}
          <section className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight">Latest News</h3>
            <div className="space-y-6">
              {newsItems.map((news, i) => (
                <Link
                  key={i}
                  to={`/games/${news.game.id}`}
                  className="block rounded-lg border border-abyss-800/80 bg-abyss-900/30 p-3 group cursor-pointer space-y-3 transition-colors hover:border-azure-500/40"
                >
                  <div className="relative h-36 w-full rounded-md overflow-hidden">
                    <img
                      src={changeImageSize(news.game.image, "screenshot_big")}
                      alt={news.game.title}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  </div>
                  <p className="font-bold group-hover:text-primary transition-colors line-clamp-1 text-sm uppercase text-azure-500">
                    Breaking News
                  </p>
                  <h4 className="text-md font-semibold leading-snug line-clamp-2">
                    {news.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {news.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {news.timeAgo} • By Staff Writer
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Popular reviews */}
          <section className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight">User Reviews</h3>
            <div className="space-y-4">
              {[1].map((i) => (
                <Card
                  key={i}
                  className="bg-gradient-to-br from-abyss-800 to-abyss-900 border border-abyss-700 shadow-md hover:border-azure-500/30 transition-colors"
                >
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-md">Hollow Knight</CardTitle>
                      <Badge className="bg-abyss-900/80 hover:bg-abyss-800 transition-colors border border-abyss-700 flex gap-1 items-center text-abyss-50">
                        <Star className="w-3 h-3 fill-azure-400 text-azure-400" />
                        6/10
                      </Badge>
                    </div>
                    <CardDescription>by @DeanBro</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm italic text-muted-foreground line-clamp-3">
                      "I would die every 10 seconds, if I wanted to struggle I
                      would rather code something"
                    </p>
                  </CardContent>
                </Card>
              ))}
              {[1].map((i) => (
                <Card
                  key={i}
                  className="bg-gradient-to-br from-abyss-800 to-abyss-900 border border-abyss-700 shadow-md hover:border-azure-500/30 transition-colors"
                >
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-md">Hollow Knight</CardTitle>
                      <Badge className="bg-abyss-900/80 hover:bg-abyss-800 transition-colors border border-abyss-700 flex gap-1 items-center text-abyss-50">
                        <Star className="w-3 h-3 fill-azure-400 text-azure-400" />
                        10/10
                      </Badge>
                    </div>
                    <CardDescription>by @BobbyTheMemeLord</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm italic text-muted-foreground line-clamp-3">
                      "DeanBro has a massive skill issue, this game is a
                      masterpiece and I will fight anyone who says otherwise"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t py-12 text-center text-muted-foreground text-sm">
        <p>&copy; 2026 Respawn67. Built with shadcn/ui.</p>
      </footer>
    </div>
  );
}
