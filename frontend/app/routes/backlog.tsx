import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, PlayCircle, Clock, MoreHorizontal, Trophy, Dice5, LayoutGrid, List as ListIcon, Trash2, Edit2, ArrowRightCircle } from "lucide-react";
import type { Route } from "./+types/backlog";

export function meta({}: Route.MetaArgs) {
  return [{ title: "My Backlog | Respawn67" }];
}

// Extended Mock Data
const BACKLOG_GAMES = [
  { id: 1, title: "Baldur's Gate 3", platform: "PC", status: "playing", progress: 45, hoursPlayed: 60, hoursTotal: 120, cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp", priority: "High" },
  { id: 2, title: "Sea of Stars", platform: "Switch", status: "backlog", progress: 0, hoursPlayed: 0, hoursTotal: 30, cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co215b.webp", priority: "Medium" },
  { id: 3, title: "Alan Wake 2", platform: "PS5", status: "backlog", progress: 0, hoursPlayed: 0, hoursTotal: 20, cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6lz1.webp", priority: "High" },
  { id: 4, title: "Spider-Man 2", platform: "PS5", status: "completed", progress: 100, hoursPlayed: 25, hoursTotal: 25, cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/cobg1k.webp", priority: "Done" },
  { id: 5, title: "Hollow Knight", platform: "PC", status: "playing", progress: 80, hoursPlayed: 35, hoursTotal: 40, cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/cobfzp.webp", priority: "High" },
  { id: 6, title: "Cyberpunk 2077", platform: "PC", status: "abandoned", progress: 30, hoursPlayed: 15, hoursTotal: 60, cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/coaih8.webp", priority: "Low" },
];

export default function BacklogPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const processedGames = useMemo(() => {
    let filtered = BACKLOG_GAMES.filter(g => {
      const matchesTab = activeTab === "all" || g.status === activeTab;
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "time_short") return a.hoursTotal - b.hoursTotal;
      if (sortBy === "time_long") return b.hoursTotal - a.hoursTotal;
      if (sortBy === "progress") return b.progress - a.progress;
      return a.title.localeCompare(b.title); 
    });
  }, [activeTab, searchQuery, sortBy]);

  const totalHoursPlayed = BACKLOG_GAMES.reduce((acc, game) => acc + game.hoursPlayed, 0);
  const totalGamesCompleted = BACKLOG_GAMES.filter(g => g.status === "completed").length;
  const completionRate = Math.round((totalGamesCompleted / BACKLOG_GAMES.length) * 100);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      
      <div className="space-y-6 border-b pb-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter font-pixel">My Backlog</h1>
            <p className="text-muted-foreground mt-2">Track, prioritize, and conquer your gaming library.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="gap-2 flex-1 md:flex-none">
              <Dice5 className="w-4 h-4" /> Pick for Me
            </Button>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 flex-1 md:flex-none">
              <PlayCircle className="w-4 h-4" /> Add Game
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Total Games" value={BACKLOG_GAMES.length.toString()} />
          <StatBox label="Currently Playing" value={BACKLOG_GAMES.filter(g => g.status === "playing").length.toString()} />
          <StatBox label="Hours Logged" value={`${totalHoursPlayed}h`} />
          <StatBox label="Completion Rate" value={`${completionRate}%`} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search your library..." 
            className="pl-9" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
          <div className="flex bg-muted p-1 rounded-md border">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setViewMode("grid")}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setViewMode("list")}>
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title (A-Z)</SelectItem>
              <SelectItem value="progress">Highest Progress</SelectItem>
              <SelectItem value="time_short">Shortest to Beat</SelectItem>
              <SelectItem value="time_long">Longest to Beat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
          <TabsTrigger value="all">All Games</TabsTrigger>
          <TabsTrigger value="playing" className="gap-2">Playing <Badge variant="secondary" className="px-1 py-0 h-5 text-[10px] rounded-sm bg-emerald-500/10 text-emerald-600">{BACKLOG_GAMES.filter(g=>g.status==="playing").length}</Badge></TabsTrigger>
          <TabsTrigger value="backlog">Up Next</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="abandoned">Shelved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="animate-in fade-in-50 duration-500">
          
          {processedGames.length > 0 ? (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "flex flex-col gap-4"
            }>
              {processedGames.map((game) => (
                <BacklogItem key={game.id} game={game} view={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-muted/20 rounded-xl border border-dashed">
              <h3 className="text-lg font-medium text-muted-foreground">No games found.</h3>
              {searchQuery && <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>}
            </div>
          )}

        </TabsContent>
      </Tabs>
    </div>
  );
}


function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-muted/30 border rounded-lg p-4 flex flex-col justify-center items-center text-center">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  )
}

function BacklogItem({ game, view }: { game: any, view: "grid" | "list" }) {
  if (view === "list") {
    return (
      <Card className="flex items-center p-3 gap-4 hover:bg-accent/50 transition-colors group">
        <div className="w-12 h-16 rounded overflow-hidden shrink-0 bg-muted">
          <img src={game.cover} alt={game.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold truncate">{game.title}</h4>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <Badge variant="outline" className="text-[10px] py-0">{game.platform}</Badge>
            <span className="capitalize">{game.status}</span>
            <span>•</span>
            <span>{game.progress}% complete</span>
          </div>
        </div>
        <div className="hidden sm:block w-32">
          <Progress value={game.progress} className="h-2" />
        </div>
        <CardActions />
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden flex flex-col h-full hover:ring-2 hover:ring-primary/50 transition-all">
      <div className="relative">
        <AspectRatio ratio={16 / 9} className="bg-muted">
          <img src={game.cover} alt={game.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
        </AspectRatio>
        
        <div className="absolute top-2 right-2">
          {game.status === 'playing' && <Badge className="bg-emerald-500 animate-pulse">Playing</Badge>}
          {game.status === 'completed' && <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-500/50">Done</Badge>}
          {game.priority === 'High' && game.status === 'backlog' && <Badge variant="destructive">High Priority</Badge>}
        </div>

        <div className="absolute top-2 left-2">
           <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-white/20">{game.platform}</Badge>
        </div>

        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-bold text-lg text-white leading-tight drop-shadow-md truncate">{game.title}</h3>
        </div>
      </div>

      <CardContent className="p-4 flex-1 space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-medium text-foreground">{game.progress}%</span>
          </div>
          <Progress value={game.progress} className="h-2 bg-muted" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-md">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>{game.hoursPlayed}h played</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-md">
            <Trophy className="w-3 h-3 text-yellow-500" />
            <span>{game.hoursTotal}h est.</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t bg-muted/10">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {game.status}
        </div>
        <CardActions />
      </CardFooter>
    </Card>
  );
}

function CardActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="gap-2">
          <PlayCircle className="w-4 h-4" /> Mark as Playing
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <ArrowRightCircle className="w-4 h-4" /> Move to Up Next
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <Edit2 className="w-4 h-4" /> Edit Details
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive">
          <Trash2 className="w-4 h-4" /> Remove from Backlog
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}