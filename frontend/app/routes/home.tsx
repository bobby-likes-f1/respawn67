import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameCard } from "@/components/game-card";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Respawn67 | Discover Video Games" },
    { name: "description", content: "Rate, check and review your favorite video games." },
  ];
}

const MOCK_GAMES = [
  { id: 1, title: "Hades II", rating: 9.2, platform: ["PC"], image: "https://images.igdb.com/igdb/image/upload/t_cover_big/coaknx.webp" },
  { id: 2, title: "Ghost of Yotei", rating: 8.8, platform: ["PS5"], image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co9coo.webp" },
  { id: 3, title: "Resident Evil Requiem", rating: 9.5, platform: ["PC", "Xbox", "PS5", "Switch 2"], image: "https://images.igdb.com/igdb/image/upload/t_cover_big/cob3bo.webp" },
  { id: 4, title: "GTA VI", rating: 9.9, platform: ["PS5", "Xbox"], image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co9rwo.webp" },
  { id: 5, title: "Doom: The Dark Ages", rating: 8.5, platform: ["PC", "Xbox"], image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co9b3o.webp" },
  { id: 6, title: "Monster Hunter Wilds", rating: 9.0, platform: ["PC", "PS5"], image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co904o.webp" },
];

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 space-y-16">
      
      {/* Spotlight */}
      <section className="relative h-[450px] w-full overflow-hidden rounded-2xl bg-slate-900 flex items-end p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <Badge className="bg-yellow-500 text-black font-bold hover:bg-yellow-400">Spotlight</Badge>
          <h2 className="text-5xl font-extrabold text-white tracking-tighter">Elden Ring: Shadow of the Erdtree</h2>
          <p className="text-slate-300 text-lg">Return to the Lands Between and uncover the mysteries of Miquella in this massive expansion.</p>
          <Button size="lg" className="mt-4 px-8 py-6 text-lg">Read Review</Button>
        </div>
      </section>

      {/* Hot games */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-3xl font-bold tracking-tight">Hot 🔥</h3>
            <p className="text-muted-foreground">Games everyone is playing right now</p>
          </div>
          <Button variant="outline">View All</Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {MOCK_GAMES.map((game) => (
            <GameCard 
              key={game.id} 
              title={game.title} 
              rating={game.rating} 
              platform={game.platform} 
              image={game.image} 
            />
          ))}
        </div>
      </section>

      <hr className="border-border/60" />

      {/* Lists and news */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Most popular games list */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight">Most Popular</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="flex items-center p-3 gap-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <span className="text-3xl font-black text-muted-foreground/20 w-8">0{i}</span>
                <div className="flex-1">
                  <h4 className="font-bold">Trending Game {i}</h4>
                  <p className="text-xs text-muted-foreground">Action • RPG</p>
                </div>
                <Badge variant="secondary">⭐ 4.8</Badge>
              </Card>
            ))}
          </div>
        </section>

        {/* Latest news */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight">Latest News</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group cursor-pointer space-y-2">
                <div className="h-32 w-full bg-muted rounded-md mb-2 overflow-hidden">
                   <div className="w-full h-full bg-slate-800 group-hover:bg-slate-700 transition-colors" />
                </div>
                <p className="font-bold group-hover:text-primary transition-colors line-clamp-2 text-sm uppercase text-blue-500">Breaking News</p>
                <h4 className="text-md font-semibold leading-snug">The biggest gaming announcements from this weekend's showcase.</h4>
                <p className="text-xs text-muted-foreground">5 mins ago • By Staff Writer</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular reviews */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight">User Reviews</h3>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="bg-muted/30">
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md">Cyberpunk 2077</CardTitle>
                    <Badge className="bg-green-600">9/10</Badge>
                  </div>
                  <CardDescription>by @NightCityRunner</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm italic text-muted-foreground line-clamp-3">
                    "The redemption arc is complete. This is the masterpiece we were promised years ago."
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
      <footer className="border-t py-12 text-center text-muted-foreground text-sm">
        <p>&copy; 2026 Respawn67. Built with shadcn/ui.</p>
      </footer>
    </main>
  );
}