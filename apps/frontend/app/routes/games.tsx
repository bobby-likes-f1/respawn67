import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameCard } from "@/components/game-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Route } from "./+types/games";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Browse Games | Respawn67" },
    { name: "description", content: "Discover and explore thousands of video games." },
  ];
}

const MOCK_GAMES = [
  { id: 1, title: "Hades II", rating: 9.2, platform: ["PC"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/coaknx.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/coaknx.webp", description: "Defy the god of the dead as you hack and slash your way out of the Underworld in this rogue-like dungeon crawler." },
  { id: 2, title: "Ghost of Yotei", rating: 8.8, platform: ["PS5"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/co9coo.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/co9coo.webp", description: "Embark on a new samurai adventure in feudal Japan with breathtaking landscapes and intense combat." },
  { id: 3, title: "Resident Evil Requiem", rating: 9.9, platform: ["PC", "Xbox", "PS5", "Switch 2"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/cob3bo.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/cob3bo.webp", description: "Experience the ultimate survival horror as the nightmare continues in this terrifying new chapter." },
  { id: 4, title: "GTA VI", rating: 9.9, platform: ["PS5", "Xbox"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/co9rwo.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/co9rwo.webp", description: "Return to Vice City in the most ambitious open-world experience ever created by Rockstar Games." },
  { id: 5, title: "Doom: The Dark Ages", rating: 8.5, platform: ["PC", "Xbox"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/co9b3o.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/co9b3o.webp", description: "Travel back in time and unleash medieval hell in this brutal prequel to the Doom Slayer saga." },
  { id: 6, title: "Monster Hunter Wilds", rating: 9.0, platform: ["PC", "PS5"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/co904o.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/co904o.webp", description: "Hunt massive beasts across stunning new environments in the next evolution of Monster Hunter." },
  { id: 7, title: "Elden Ring", rating: 9.8, platform: ["PC", "PS5", "Xbox"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/co4jni.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/co4jni.webp", description: "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring." },
  { id: 8, title: "Hollow Knight", rating: 10, platform: ["PC", "Switch"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/cobfzp.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/cobfzp.webp", description: "Descend into the depths of a forgotten kingdom in this award-winning hand-drawn metroidvania." },
  { id: 9, title: "Hollow Knight: Silksong", rating: 10, platform: ["PC", "Switch"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/cobebu.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/cobebu.webp", description: "Play as Hornet and explore a haunted kingdom ruled by silk and song in this sequel to Hollow Knight." },
  { id: 10, title: "No Man's Sky", rating: 8.7, platform: ["PC", "PS5", "Xbox"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/coacrk.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/coacrk.webp", description: "Explore an infinite universe of procedurally generated planets in this space exploration epic." },
  { id: 11, title: "F1 25", rating: 8.6, platform: ["PC", "PS5", "Xbox"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/co9mk6.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/co9mk6.webp", description: "Experience the pinnacle of racing simulation with the official game of the 2025 FIA Formula One season." },
  { id: 12, title: "Resident Evil 4", rating: 9.4, platform: ["PC", "PS5", "Xbox"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/co6bo0.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/co6bo0.webp", description: "Survival is just the beginning in this reimagined classic that redefined the horror genre." },
  { id: 13, title: "Cyberpunk 2077", rating: 9.0, platform: ["PC", "PS5", "Xbox"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/coaih8.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/coaih8.webp", description: "Become a cyberpunk outlaw and carve your path through Night City in this open-world RPG." },
  { id: 14, title: "The Witcher 3", rating: 9.6, platform: ["PC", "PS5", "Xbox", "Switch"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/coaarl.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/coaarl.webp", description: "Hunt monsters for coin and save the realm in this masterpiece of open-world fantasy storytelling." },
  { id: 15, title: "Red Dead Redemption 2", rating: 9.7, platform: ["PC", "PS5", "Xbox"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/co1q1f.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/co1q1f.webp", description: "Live the outlaw life in America's unforgiving heartland in this epic tale of loyalty and survival." },
  { id: 16, title: "Baldur's Gate 3", rating: 9.8, platform: ["PC", "PS5"], image: "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.webp", spotlightImage: "https://images.igdb.com/igdb/image/upload/t_original/co670h.webp", description: "Gather your party and return to the Forgotten Realms in this award-winning RPG masterpiece." },
];

export default function GamesPage() {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // Get top 4 games by rating for spotlight
  const spotlightGames = [...MOCK_GAMES].sort((a, b) => b.rating - a.rating).slice(0, 4);

  // Get games ranked 5-8 for Most Popular
  const mostPopularGames = [...MOCK_GAMES].sort((a, b) => b.rating - a.rating).slice(4, 8);

  // News items based on games
  const newsItems = [
    {
      game: MOCK_GAMES[3], // GTA VI
      title: "GTA VI Breaks All Records in First Week",
      description: "Rockstar's latest masterpiece shatters sales records across all platforms, becoming the biggest entertainment launch of all time.",
      timeAgo: "2 hours ago"
    },
    {
      game: MOCK_GAMES[7], // Hollow Knight
      title: "Hollow Knight Community Reaches 10 Million Players",
      description: "Team Cherry's indie masterpiece continues to captivate players years after launch with its haunting world and challenging gameplay.",
      timeAgo: "5 hours ago"
    },
    {
      game: MOCK_GAMES[12], // Cyberpunk 2077
      title: "Cyberpunk 2077 Wins Best Ongoing Game Award",
      description: "CD Projekt Red's redemption story complete as the game receives critical acclaim for its massive transformation since launch.",
      timeAgo: "1 day ago"
    }
  ];

  const gamesPerPage = 4;
  const totalPages = Math.ceil(MOCK_GAMES.length / gamesPerPage);
  const displayedGames = MOCK_GAMES.slice(currentPage * gamesPerPage, (currentPage + 1) * gamesPerPage);

  useEffect(() => {
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 2.5; // Increment by 2.5% every 100ms (100ms * 40 = 4000ms)
      });
    }, 100);

    const slideInterval = setInterval(() => {
      setCurrentGameIndex((prev) => (prev + 1) % spotlightGames.length);
      setProgress(0);
    }, 4000); // Auto-rotate every 4 seconds

    return () => {
      clearInterval(progressInterval);
      clearInterval(slideInterval);
    };
  }, [currentGameIndex, spotlightGames.length]);

  const currentGame = spotlightGames[currentGameIndex];

  const nextGame = () => {
    setCurrentGameIndex((prev) => (prev + 1) % spotlightGames.length);
    setProgress(0);
  };

  const prevGame = () => {
    setCurrentGameIndex((prev) => (prev - 1 + spotlightGames.length) % spotlightGames.length);
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
              backgroundImage: `url(${currentGame.spotlightImage})`,
              backgroundPosition: 'center 40%'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 rounded-2xl" />
          
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-500 text-black font-bold hover:bg-yellow-400">Spotlight</Badge>
              <Badge variant="secondary">⭐ {currentGame.rating}</Badge>
              <div className="flex gap-1 ml-2">
                {currentGame.platform.map((p) => (
                  <Badge key={p} className="bg-white/20 text-white border border-white/30 text-xs">{p}</Badge>
                ))}
              </div>
            </div>
            <h2 className="text-5xl font-extrabold text-white tracking-tighter">{currentGame.title}</h2>
            <p className="text-slate-300 text-lg">{currentGame.description}</p>
            <Button size="lg" className="mt-4 px-8 py-6 text-lg bg-emerald-600 hover:bg-emerald-700 font-bold">Read Review</Button>
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
                  index === currentGameIndex ? 'w-8' : 'w-2'
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
          <div>
            <h3 className="text-3xl font-bold tracking-tight">Top Rated Games</h3>
            <p className="text-muted-foreground">The highest rated games of all time according to our community</p>
          </div>
          
          <div className="relative flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="hover:bg-white/10 text-black p-3 transition-all hover:scale-125 disabled:opacity-30 disabled:hover:scale-100"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
              {displayedGames.map((game) => (
                <div 
                  key={game.id}
                  className="relative aspect-[3/4] overflow-hidden rounded-lg group cursor-pointer transition-all hover:ring-2 hover:ring-primary"
                >
                  <img
                    src={game.image}
                    alt={game.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                    <h4 className="font-bold leading-tight text-white">{game.title}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/80 uppercase tracking-wider">
                        {game.platform.join(", ")}
                      </p>
                      <Badge className="bg-yellow-500 text-black font-bold text-xs">
                        ⭐ {game.rating}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
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
            <h3 className="text-2xl font-bold tracking-tight">Most Popular</h3>
            <div className="space-y-4">
              {mostPopularGames.map((game, index) => (
                <div 
                  key={game.id} 
                  className="relative h-40 rounded-lg overflow-hidden group cursor-pointer transition-all hover:ring-2 hover:ring-primary"
                >
                  <img
                    src={game.image}
                    alt={game.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                    <h4 className="font-bold text-white">{game.title}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/80">{game.platform.join(" • ")}</p>
                      <Badge className="bg-yellow-500 text-black font-bold text-xs">
                        ⭐ {game.rating}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Latest news */}
          <section className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight">Latest News</h3>
            <div className="space-y-6">
              {newsItems.map((news, i) => (
                <div key={i} className="group cursor-pointer space-y-2">
                  <div className="relative h-32 w-full rounded-md mb-2 overflow-hidden">
                    <img
                      src={news.game.image}
                      alt={news.game.title}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  </div>
                  <p className="font-bold group-hover:text-primary transition-colors line-clamp-2 text-sm uppercase text-blue-500">Breaking News</p>
                  <h4 className="text-md font-semibold leading-snug">{news.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{news.description}</p>
                  <p className="text-xs text-muted-foreground">{news.timeAgo} • By Staff Writer</p>
                </div>
              ))}
            </div>
          </section>

          {/* Popular reviews */}
          <section className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight">User Reviews</h3>
            <div className="space-y-4">
              {[1].map((i) => (
                <Card key={i} className="bg-muted/30">
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-md">Hollow Knight</CardTitle>
                      <Badge className="bg-green-600">6/10</Badge>
                    </div>
                    <CardDescription>by @DeanBro</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm italic text-muted-foreground line-clamp-3">
                      "I would die every 10 seconds, if I wanted to struggle I would rather code something"
                    </p>
                  </CardContent>
                </Card>
              ))}
              {[1].map((i) => (
                <Card key={i} className="bg-muted/30">
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-md">Hollow Knight</CardTitle>
                      <Badge className="bg-green-600">10/10</Badge>
                    </div>
                    <CardDescription>by @BobbyTheMemeLord</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm italic text-muted-foreground line-clamp-3">
                      "DeanBro has a massive skill issue, this game is a masterpiece and I will fight anyone who says otherwise"
                    </p>
                  </CardContent>
                </Card>
              ))
              }
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
