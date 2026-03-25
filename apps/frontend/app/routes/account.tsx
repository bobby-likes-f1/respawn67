import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Settings, Link, LayoutGrid, Clock } from "lucide-react";
import { getInitials, getMemberSinceLabel, getStoredUser, type AuthUser } from "@/lib/auth";
import { useRequireAuth } from "@/lib/use-require-auth";
import type { Route } from "./+types/account";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Account | Respawn67" },
    { name: "description", content: "Manage your profile and vie w your gaming history." },
  ];
}

const MOCK_USER = {
  username: "rccar344",
  avatar: "https://github.com/shadcn.png",
  bio: "Just a gamer trying to clear a backlog that grows faster than I can play.",
  joinDate: "2024",
  stats: {
    games: 142,
    reviews: 45,
    following: 12,
    followers: 8
  },
  favorites: [
    { id: 1, title: "Outer Wilds", image: "https://images.igdb.com/igdb/image/upload/t_1080p/co1x7d.webp" },
    { id: 2, title: "Bloodborne", image: "https://images.igdb.com/igdb/image/upload/t_1080p/co1rpa.webp" },
    { id: 3, title: "Hades", image: "https://images.igdb.com/igdb/image/upload/t_1080p/co39at.webp" },
    { id: 4, title: "Disco Elysium", image: "https://images.igdb.com/igdb/image/upload/t_1080p/co1vxf.webp" }
  ],
  recentActivity: [
    { id: 101, title: "Helldivers 2", rating: 4, image: "https://images.igdb.com/igdb/image/upload/t_1080p/co7qvq.webp", date: "2 days ago" },
    { id: 102, title: "Dragon's Dogma 2", rating: 3, image: "https://images.igdb.com/igdb/image/upload/t_1080p/co7wqq.webp", date: "1 week ago" },
    { id: 103, title: "Cyberpunk 2077", rating: 5, image: "https://images.igdb.com/igdb/image/upload/t_1080p/coaih8.webp", date: "2 weeks ago" },
    { id: 104, title: "Lies of P", rating: 4, image: "https://images.igdb.com/igdb/image/upload/t_1080p/co65ze.webp", date: "1 month ago" }
  ],
  ratingsDistribution: [
    { stars: 1, count: 2 },
    { stars: 2, count: 5 },
    { stars: 3, count: 12 },
    { stars: 4, count: 18 },
    { stars: 5, count: 8 }
  ],
  reviews: [
    { id: 1, game: "Helldivers 2", rating: 4, date: "2 days ago", text: "Incredible cooperative chaos. The moment-to-moment gameplay loop is flawless, though connection issues hold it back slightly." },
    { id: 2, game: "Dragon's Dogma 2", rating: 3, date: "1 week ago", text: "A phenomenal core combat system trapped inside a world that desperately needs more fast travel and better performance." },
    { id: 3, game: "Cyberpunk 2077", rating: 5, date: "2 weeks ago", text: "Patch 2.0 and Phantom Liberty completely redeemed this game. Night City has never felt more alive. An absolute masterpiece now." },
    { id: 4, game: "Elden Ring", rating: 5, date: "3 weeks ago", text: "A masterclass in world design and exploration. Every corner discovered holds a new secret." },
    { id: 5, game: "Balatro", rating: 4, date: "1 month ago", text: "Dangerously addictive deck-building. Visually simple but mechanically deep." },
    { id: 6, game: "Baldur's Gate 3", rating: 5, date: "2 months ago", text: "The new gold standard for RPGs. The amount of player agency is staggering." }
  ],
  backlogPreview: [
    { id: 1, title: "Alan Wake 2", platform: "PS5", progress: 0, hoursTotal: 20 },
    { id: 2, title: "Sea of Stars", platform: "Switch", progress: 10, hoursTotal: 30 },
    { id: 3, title: "Remnant II", platform: "PC", progress: 45, hoursTotal: 60 }
  ],
  lists: [
    { id: 1, title: "Top 10 Souls-likes", gameCount: 10, likes: 24, updated: "1 week ago" },
    { id: 2, title: "Co-op Weekend", gameCount: 4, likes: 5, updated: "1 month ago" },
    { id: 3, title: "Pile of Shame", gameCount: 42, likes: 1, updated: "2 months ago" }
  ]
};

export default function AccountPage() {
  const isAuthorized = useRequireAuth();
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setSessionUser(getStoredUser());
  }, []);

  const profileUser = useMemo(() => {
    if (!sessionUser) {
      return MOCK_USER;
    }

    return {
      ...MOCK_USER,
      username: sessionUser.username,
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(sessionUser.username)}`,
      bio: `Signed in as ${sessionUser.email}`,
    };
  }, [sessionUser]);

  const maxRatingCount = Math.max(...MOCK_USER.ratingsDistribution.map(r => r.count));
  const memberSince = getMemberSinceLabel(sessionUser) ?? MOCK_USER.joinDate;

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="container mx-auto py-10 px-4 space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/60 pb-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 ring-4 ring-abyss-800 shadow-xl">
              <AvatarImage src={profileUser.avatar} alt={profileUser.username} />
              <AvatarFallback className="text-2xl bg-abyss-800 text-azure-50">{getInitials(profileUser.username)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">{profileUser.username}</h1>
                <Button variant="outline" size="sm" className="hidden sm:flex border-abyss-700 bg-abyss-900/50 hover:bg-abyss-800 text-azure-100 hover:text-white">
                  <Settings className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:flex gap-3 w-full lg:w-auto">
            <div className="bg-muted/30 border rounded-lg p-4 flex flex-col justify-center items-center text-center lg:min-w-[110px]">
              <span className="text-2xl font-bold">{MOCK_USER.stats.games}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Total Games</span>
            </div>
            <div className="bg-muted/30 border rounded-lg p-4 flex flex-col justify-center items-center text-center lg:min-w-[110px]">
              <span className="text-2xl font-bold">{MOCK_USER.stats.reviews}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Reviews</span>
            </div>
            <div className="bg-muted/30 border rounded-lg p-4 flex flex-col justify-center items-center text-center lg:min-w-[110px]">
              <span className="text-2xl font-bold">{MOCK_USER.stats.following}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Following</span>
            </div>
            <div className="bg-muted/30 border rounded-lg p-4 flex flex-col justify-center items-center text-center lg:min-w-[110px]">
              <span className="text-2xl font-bold">{MOCK_USER.stats.followers}</span>
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
                    <span className="text-xs text-muted-foreground cursor-pointer hover:text-azure-400">Edit Favorites</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {MOCK_USER.favorites.map((game) => (
                      <div key={game.id} className="relative aspect-[3/4] rounded-md overflow-hidden group border border-abyss-700 shadow-md bg-abyss-800/50 hover:bg-abyss-800 transition-colors flex items-center justify-center p-4">
                        <p className="text-azure-50 font-medium text-center">{game.title}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-baseline border-b border-border/40 pb-2 mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:text-azure-400">All Activity</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {MOCK_USER.recentActivity.map((activity) => (
                      <div key={activity.id} className="space-y-3 group cursor-pointer">
                        <div className="relative aspect-[3/4] rounded-md overflow-hidden border border-abyss-700 shadow-md bg-abyss-800/50 hover:bg-abyss-800 transition-colors flex items-center justify-center p-4">
                          <p className="text-azure-50 font-medium text-center leading-snug">{activity.title}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <Badge className="bg-abyss-900/80 hover:bg-abyss-800 transition-colors border border-abyss-700 flex gap-1 items-center text-abyss-50 text-xs">
                            <Star className="w-3 h-3 fill-azure-400 text-azure-400" /> {activity.rating}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <div className="lg:col-span-4 space-y-10">
                <section className="space-y-3 pt-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">{profileUser.bio}</p>
                  <a href="#" className="inline-flex items-center gap-1.5 text-sm text-azure-500 hover:text-azure-400 transition-colors font-medium">
                    <Link className="w-3.5 h-3.5" /> github.com/{profileUser.username}
                  </a>
                </section>

                <section>
                  <div className="flex justify-between items-baseline border-b border-border/40 pb-2 mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ratings</h3>
                    <span className="text-xs text-azure-500 font-bold">{MOCK_USER.stats.reviews} Total</span>
                  </div>
                  
                  <div className="flex h-32 gap-1.5 px-2">
                    {MOCK_USER.ratingsDistribution.map((rate) => {
                      const heightPercentage = Math.max((rate.count / maxRatingCount) * 100, 4);
                      return (
                        <div key={rate.stars} className="flex-1 flex flex-col justify-end group h-full">
                          <div className="text-center text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mb-1">{rate.count}</div>
                          <div 
                            className="w-full bg-azure-500 rounded-t-sm hover:bg-azure-400 transition-colors cursor-pointer"
                            style={{ height: `${heightPercentage}%` }}
                          />
                          <div className="mt-2 text-center text-xs text-abyss-400 font-medium">
                            {rate.stars}<Star className="w-2.5 h-2.5 inline fill-abyss-400 ml-0.5 -mt-0.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-8 outline-none animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
              {MOCK_USER.reviews.map((review) => (
                <div key={review.id} className="flex flex-col bg-abyss-900 border border-abyss-800 rounded-lg overflow-hidden hover:border-azure-500/50 hover:shadow-[0_0_15px_rgba(26,133,255,0.1)] transition-all duration-300">
                  {/* Banner Placeholder */}
                  <div className="w-full h-24 bg-abyss-950 border-b border-abyss-800 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-abyss-900 via-transparent to-transparent z-10"></div>
                    <span className="text-[10px] text-abyss-700 font-bold tracking-widest uppercase z-0 opacity-40">{review.game} Art</span>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-lg text-azure-50 leading-tight truncate">{review.game}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{review.date}</p>
                      </div>
                      <Badge className="bg-abyss-950 hover:bg-abyss-900 transition-colors border border-abyss-700 flex gap-1 items-center text-abyss-50 shrink-0 shadow-sm">
                        <Star className="w-3 h-3 fill-azure-400 text-azure-400" /> {review.rating}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 mt-1">{review.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="backlog" className="mt-8 outline-none animate-in fade-in-50 duration-500">
            <div className="w-full">
              <div className="flex justify-between items-baseline mb-6 border-b border-border/40 pb-2">
                 <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recently Added to Backlog</h3>
                 <span className="text-xs text-azure-500 hover:text-azure-400 transition-colors cursor-pointer font-medium">View Full Backlog &rarr;</span>
              </div>
              <div className="flex flex-col gap-4">
                {MOCK_USER.backlogPreview.map((game) => (
                  <div key={game.id} className="flex flex-row items-center p-4 gap-4 sm:gap-6 bg-abyss-900 border border-abyss-800 rounded-lg hover:bg-gradient-to-r hover:from-abyss-800 hover:to-abyss-900 hover:border-azure-500/30 transition-all group">
                    <div className="w-16 h-24 rounded-md overflow-hidden shrink-0 border border-abyss-700 shadow-sm bg-abyss-800 flex items-center justify-center">
                       <span className="text-[10px] text-center text-abyss-500 px-1 font-medium">{game.title}</span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                      <h4 className="font-bold text-lg truncate group-hover:text-azure-300 transition-colors">{game.title}</h4>
                      <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted-foreground mt-1.5">
                        <Badge variant="outline" className="text-[10px] py-0 bg-background border-abyss-700">{game.platform}</Badge>
                        <span className="font-medium text-foreground/80 text-xs sm:text-sm">In Backlog</span>
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
                    <div className="shrink-0 flex items-center justify-center pl-4 sm:pl-6 border-l border-abyss-800">
                      <span className="text-xs text-azure-500 group-hover:text-azure-400 font-bold cursor-pointer flex items-center gap-1 transition-colors uppercase tracking-wider">Manage</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="lists" className="mt-8 outline-none animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_USER.lists.map((list) => (
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
                      <Badge variant="outline" className="text-[10px] py-0 h-5 bg-abyss-950 border-abyss-700 text-muted-foreground group-hover:border-azure-500/50 group-hover:text-azure-400 transition-colors duration-300 shadow-sm shrink-0">
                         ♥ {list.likes}
                      </Badge>
                    </div>
                    
                    <div className="flex items-end mt-1">
                      <div className="flex -space-x-4">
                        {[1, 2, 3, 4, 5].slice(0, Math.min(5, list.gameCount)).map(i => (
                           <div key={i} className="w-12 h-16 rounded shadow-md bg-abyss-950 border border-abyss-700 flex items-center justify-center overflow-hidden shrink-0 relative transition-transform duration-300 ease-out group-hover:-translate-y-1 hover:!translate-y-[-8px] hover:z-20">
                             <div className="absolute inset-0 bg-gradient-to-br from-transparent to-abyss-900/60 mix-blend-overlay"></div>
                             <LayoutGrid className="w-4 h-4 text-abyss-800 opacity-60" />
                           </div>
                        ))}
                        {list.gameCount > 5 && (
                          <div className="w-12 h-16 rounded border border-abyss-800/50 flex items-center justify-center shrink-0 z-10 backdrop-blur-sm -ml-2 pl-2 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                            <span className="text-[10px] text-muted-foreground font-bold">+{list.gameCount - 5}</span>
                          </div>
                        )}
                      </div>
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
