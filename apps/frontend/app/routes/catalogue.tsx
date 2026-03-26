import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Star, Clock, Search, ArrowUpDown, Filter, X } from "lucide-react";
import { getAllGames, type ApiGame } from "@/lib/api";

type CatalogueGame = {
  id: number;
  title: string;
  rating: number;
  platform: string[];
  genre: string;
  timeToBeat: number;
  releaseDate: string;
  decade: string;
  image: string;
  description: string;
};

export const meta = () => {
  return [
    { title: "Game Catalogue | Respawn67" },
    {
      name: "description",
      content: "Browse our complete collection of video games.",
    },
  ];
};

const CATALOGUE_GAMES: CatalogueGame[] = [
  {
    id: 1,
    title: "Hades II",
    rating: 9.2,
    platform: ["PC"],
    genre: "Roguelike",
    timeToBeat: 22,
    releaseDate: "2024-03-19",
    decade: "2020s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/coaknx.webp",
    description:
      "Defy the god of the dead as you hack and slash your way out of the Underworld in this rogue-like dungeon crawler.",
  },
  {
    id: 2,
    title: "Ghost of Yotei",
    rating: 8.8,
    platform: ["PS5"],
    genre: "Action-Adventure",
    timeToBeat: 25,
    releaseDate: "2024-02-08",
    decade: "2020s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co9coo.webp",
    description:
      "Embark on a new samurai adventure in feudal Japan with breathtaking landscapes and intense combat.",
  },
  {
    id: 3,
    title: "Resident Evil Requiem",
    rating: 9.9,
    platform: ["PC", "Xbox", "PS5", "Switch 2"],
    genre: "Horror",
    timeToBeat: 12,
    releaseDate: "2026-01-15",
    decade: "2020s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/cob3bo.webp",
    description:
      "Experience the ultimate survival horror as the nightmare continues in this terrifying new chapter.",
  },
  {
    id: 4,
    title: "GTA VI",
    rating: 9.9,
    platform: ["PS5", "Xbox"],
    genre: "Action-Adventure",
    timeToBeat: 50,
    releaseDate: "2025-09-14",
    decade: "2020s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co9rwo.webp",
    description:
      "Return to Vice City in the most ambitious open-world experience ever created by Rockstar Games.",
  },
  {
    id: 5,
    title: "Doom: The Dark Ages",
    rating: 8.5,
    platform: ["PC", "Xbox"],
    genre: "FPS",
    timeToBeat: 15,
    releaseDate: "2025-10-15",
    decade: "2020s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co9b3o.webp",
    description:
      "Travel back in time and unleash medieval hell in this brutal prequel to the Doom Slayer saga.",
  },
  {
    id: 6,
    title: "Monster Hunter Wilds",
    rating: 9.0,
    platform: ["PC", "PS5"],
    genre: "Action RPG",
    timeToBeat: 50,
    releaseDate: "2025-02-28",
    decade: "2020s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co904o.webp",
    description:
      "Hunt massive beasts across stunning new environments in the next evolution of Monster Hunter.",
  },
  {
    id: 7,
    title: "Elden Ring",
    rating: 9.8,
    platform: ["PC", "PS5", "Xbox"],
    genre: "Action RPG",
    timeToBeat: 58,
    releaseDate: "2022-02-25",
    decade: "2020s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co4jni.webp",
    description:
      "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.",
  },
  {
    id: 8,
    title: "Hollow Knight",
    rating: 10,
    platform: ["PC", "Switch"],
    genre: "Metroidvania",
    timeToBeat: 40,
    releaseDate: "2017-02-24",
    decade: "2010s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/cobfzp.webp",
    description:
      "Descend into the depths of a forgotten kingdom in this award-winning hand-drawn metroidvania.",
  },
  {
    id: 9,
    title: "Hollow Knight: Silksong",
    rating: 10,
    platform: ["PC", "Switch"],
    genre: "Metroidvania",
    timeToBeat: 30,
    releaseDate: "2026-02-28",
    decade: "2020s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/cobebu.webp",
    description:
      "Play as Hornet and explore a haunted kingdom ruled by silk and song in this sequel to Hollow Knight.",
  },
  {
    id: 10,
    title: "No Man's Sky",
    rating: 8.7,
    platform: ["PC", "PS5", "Xbox"],
    genre: "Adventure",
    timeToBeat: 30,
    releaseDate: "2016-08-09",
    decade: "2010s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/coacrk.webp",
    description:
      "Explore an infinite universe of procedurally generated planets in this space exploration epic.",
  },
  {
    id: 11,
    title: "F1 25",
    rating: 8.6,
    platform: ["PC", "PS5", "Xbox"],
    genre: "Racing",
    timeToBeat: 20,
    releaseDate: "2025-09-23",
    decade: "2020s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co9mk6.webp",
    description:
      "Experience the pinnacle of racing simulation with the official game of the 2025 FIA Formula One season.",
  },
  {
    id: 12,
    title: "Resident Evil 4",
    rating: 9.4,
    platform: ["PC", "PS5", "Xbox"],
    genre: "Horror",
    timeToBeat: 16,
    releaseDate: "2023-03-24",
    decade: "2020s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co6bo0.webp",
    description:
      "Survival is just the beginning in this reimagined classic that redefined the horror genre.",
  },
  {
    id: 13,
    title: "Cyberpunk 2077",
    rating: 9.0,
    platform: ["PC", "PS5", "Xbox"],
    genre: "Action RPG",
    timeToBeat: 25,
    releaseDate: "2020-12-10",
    decade: "2020s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/coaih8.webp",
    description:
      "Become a cyberpunk outlaw and carve your path through Night City in this open-world RPG.",
  },
  {
    id: 14,
    title: "The Witcher 3",
    rating: 9.6,
    platform: ["PC", "PS5", "Xbox", "Switch"],
    genre: "Action RPG",
    timeToBeat: 51,
    releaseDate: "2015-05-19",
    decade: "2010s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/coaarl.webp",
    description:
      "Hunt monsters for coin and save the realm in this masterpiece of open-world fantasy storytelling.",
  },
  {
    id: 15,
    title: "Red Dead Redemption 2",
    rating: 9.7,
    platform: ["PC", "PS5", "Xbox"],
    genre: "Action-Adventure",
    timeToBeat: 50,
    releaseDate: "2018-10-26",
    decade: "2010s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co1q1f.webp",
    description:
      "Live the outlaw life in America's unforgiving heartland in this epic tale of loyalty and survival.",
  },
  {
    id: 16,
    title: "Baldur's Gate 3",
    rating: 9.8,
    platform: ["PC", "PS5"],
    genre: "RPG",
    timeToBeat: 100,
    releaseDate: "2023-08-03",
    decade: "2020s",
    image: "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.webp",
    description:
      "Gather your party and return to the Forgotten Realms in this award-winning RPG masterpiece.",
  },
];

export function changeImageSize(url: string | null | undefined, size: string): string {
  if (!url) return "https://via.placeholder.com/264x374?text=No+Image";
  return url.replace(/t_[a-z0-9]+/, `t_${size}`);
}

export function toCatalogueGame(game: ApiGame): CatalogueGame {
  const year = game.release_year ?? 2020 + (game.id % 6);
  const decade = `${Math.floor(year / 10) * 10}s`;
  const primaryGenre = game.genre?.split(",")[0]?.trim() || "Action";

  return {
    id: game.id,
    title: game.title,
    rating: Number((8 + (game.id % 20) / 10).toFixed(1)),
    platform: ["PC"],
    genre: primaryGenre,
    timeToBeat: 12 + (game.id % 24),
    releaseDate: `${year}-01-01`,
    decade,
    image: changeImageSize(game.cover_image_url, "1080p"),
    description:
      "Discover this title on Respawn67. Add it to your playlist, favorite it, and leave your own review.",
  };
}

export default function CataloguePage() {
  const [catalogueGames, setCatalogueGames] = useState<CatalogueGame[]>(CATALOGUE_GAMES);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedDecades, setSelectedDecades] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setIsLoading(true);
        const games = await getAllGames();
        if (!active) {
          return;
        }

        if (games.length > 0) {
          setCatalogueGames(games.map(toCatalogueGame));
        }
        setLoadError(null);
      } catch (err) {
        if (!active) {
          return;
        }
        setLoadError(err instanceof Error ? err.message : "Failed to sync catalogue data");
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

  const allPlatforms = Array.from(new Set<string>(catalogueGames.flatMap((g) => g.platform)));
  const allGenres = Array.from(new Set<string>(catalogueGames.map((g) => g.genre)));
  const allDecades = Array.from(new Set<string>(catalogueGames.map((g) => g.decade)));

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev: string[]) =>
      prev.includes(platform)
        ? prev.filter((p: string) => p !== platform)
        : [...prev, platform]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev: string[]) =>
      prev.includes(genre)
        ? prev.filter((g: string) => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleDecade = (decade: string) => {
    setSelectedDecades((prev: string[]) =>
      prev.includes(decade)
        ? prev.filter((d: string) => d !== decade)
        : [...prev, decade]
    );
  };

  const clearFilters = () => {
    setSelectedPlatforms([]);
    setSelectedGenres([]);
    setSelectedDecades([]);
  };

  const hasActiveFilters = selectedPlatforms.length > 0 || selectedGenres.length > 0 || selectedDecades.length > 0;

  const processedGames = useMemo(() => {
    let filtered = catalogueGames.filter((g) => {
      const matchesSearch = g.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.some(p => g.platform.includes(p));
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(g.genre);
      const matchesDecade = selectedDecades.length === 0 || selectedDecades.includes(g.decade);

      return matchesSearch && matchesPlatform && matchesGenre && matchesDecade;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "rating_high") return b.rating - a.rating;
      if (sortBy === "rating_low") return a.rating - b.rating;
      if (sortBy === "time_short") return a.timeToBeat - b.timeToBeat;
      if (sortBy === "time_long") return b.timeToBeat - a.timeToBeat;
      if (sortBy === "date_new") return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      if (sortBy === "date_old") return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      return a.title.localeCompare(b.title);
    });
  }, [catalogueGames, searchTerm, sortBy, selectedPlatforms, selectedGenres, selectedDecades]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter font-pixel">
            Game Catalogue
          </h1>
          <p className="text-muted-foreground">
            Browse our complete collection of games. Click any game to view details.
          </p>
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Syncing latest games from backend...</p>
          ) : null}
          {loadError ? (
            <p className="text-xs text-amber-300">{loadError}. Showing fallback catalogue data.</p>
          ) : null}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search games by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center justify-between w-full lg:w-auto gap-4 flex-wrap">
            <div className="text-sm text-muted-foreground">
              Showing {processedGames.length} of {catalogueGames.length} games
            </div>

            {/* Filter Button */}
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge className="ml-1 bg-azure-500 text-white">
                        {selectedPlatforms.length + selectedGenres.length + selectedDecades.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  {/* Platforms */}
                  <DropdownMenuLabel>Platforms</DropdownMenuLabel>
                  {allPlatforms.map(platform => (
                    <DropdownMenuCheckboxItem
                      key={platform}
                      checked={selectedPlatforms.includes(platform)}
                      onCheckedChange={() => togglePlatform(platform)}
                    >
                      {platform}
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator />

                  {/* Genres */}
                  <DropdownMenuLabel>Genres</DropdownMenuLabel>
                  {allGenres.map(genre => (
                    <DropdownMenuCheckboxItem
                      key={genre}
                      checked={selectedGenres.includes(genre)}
                      onCheckedChange={() => toggleGenre(genre)}
                    >
                      {genre}
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator />

                  {/* Decades */}
                  <DropdownMenuLabel>Decade</DropdownMenuLabel>
                  {allDecades.sort().map(decade => (
                    <DropdownMenuCheckboxItem
                      key={decade}
                      checked={selectedDecades.includes(decade)}
                      onCheckedChange={() => toggleDecade(decade)}
                    >
                      {decade}
                    </DropdownMenuCheckboxItem>
                  ))}

                  {hasActiveFilters && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={clearFilters} className="text-destructive cursor-pointer">
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="rating_high">Rating (High to Low)</SelectItem>
                <SelectItem value="rating_low">Rating (Low to High)</SelectItem>
                <SelectItem value="time_short">Shortest to Beat</SelectItem>
                <SelectItem value="time_long">Longest to Beat</SelectItem>
                <SelectItem value="date_new">Newest First</SelectItem>
                <SelectItem value="date_old">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {processedGames.map((game) => (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className="relative aspect-[3/4] overflow-hidden rounded-lg group cursor-pointer transition-all hover:ring-2 hover:ring-primary"
            >
              <img
                src={game.image}
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

        {processedGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No games found {searchTerm && `matching "${searchTerm}"`}{hasActiveFilters && " with selected filters"}. Try adjusting your search or filters.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
