import { useEffect, useMemo, useState, type PointerEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  Filter,
  PlayCircle,
  Clock,
  MoreHorizontal,
  Trophy,
  Dice5,
  LayoutGrid,
  List as ListIcon,
  Trash2,
  ArrowRightCircle,
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react";
import {
  getPlaylistEntries,
  getPlaylistGames,
  removeFromPlaylist,
  updatePlaylistEntryByGame,
  type ApiGame,
  type PlaylistEntry,
} from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useRequireAuth } from "@/lib/use-require-auth";
import type { Route } from "./+types/backlog";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "My Backlog | Respawn67" }];
}

type BacklogStatus = "want_to_play" | "playing" | "completed";
type BacklogTab = "all" | BacklogStatus;

type BacklogGame = {
  id: number;
  title: string;
  platform: string;
  status: BacklogStatus;
  progress: number;
  hoursPlayed: number;
  hoursTotal: number;
  cover: string;
  priority: "High" | "Medium" | "Low" | "Done";
};

const FALLBACK_COVER =
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co39at.webp";

export function normalizeStatus(status: string): BacklogStatus {
  if (status === "playing") return "playing";
  if (status === "completed") return "completed";
  if (status === "backlog") return "want_to_play";
  return "want_to_play";
}

export function toApiStatus(status: BacklogStatus): string {
  return status;
}

export function inferProgress(status: BacklogStatus): number {
  if (status === "completed") return 100;
  if (status === "playing") return 45;
  return 0;
}

export function inferPriority(status: BacklogStatus): BacklogGame["priority"] {
  if (status === "completed") return "Done";
  if (status === "playing") return "High";
  return "Medium";
}

export function mapBacklogGames(entries: PlaylistEntry[], games: ApiGame[]): BacklogGame[] {
  const entryMap = new Map<number, PlaylistEntry>();
  for (const entry of entries) {
    entryMap.set(entry.game_id, entry);
  }

  return games.map((game) => {
    const entry = entryMap.get(game.id);
    const status = normalizeStatus(entry?.status ?? "want_to_play");
    const hoursTotal = status === "completed" ? 40 : 30;
    const baseProgress = inferProgress(status);

    const backendHours = entry?.hours_played && entry.hours_played > 0 ? entry.hours_played : 0;
    const hoursPlayed = backendHours > 0 ? backendHours : Math.round((hoursTotal * baseProgress) / 100);
    const progress = backendHours > 0 ? Math.min(100, Math.round((backendHours / hoursTotal) * 100)) : baseProgress;

    return {
      id: game.id,
      title: game.title,
      platform: game.genre ?? "Unknown",
      status,
      progress,
      hoursPlayed,
      hoursTotal,
      cover: game.cover_image_url ?? FALLBACK_COVER,
      priority: inferPriority(status),
    };
  });
}

export function formatStatusLabel(status: BacklogStatus): string {
  if (status === "want_to_play") return "Up Next";
  if (status === "playing") return "Playing";
  return "Completed";
}

export default function BacklogPage() {
  const navigate = useNavigate();
  const isAuthorized = useRequireAuth();
  const [games, setGames] = useState<BacklogGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [activeTab, setActiveTab] = useState<BacklogTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pickedGame, setPickedGame] = useState<BacklogGame | null>(null);
  const [pickToastOffsetX, setPickToastOffsetX] = useState(0);
  const [pickToastPointerStartX, setPickToastPointerStartX] = useState<number | null>(null);

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
        const [entries, playlistGames] = await Promise.all([
          getPlaylistEntries(user.id),
          getPlaylistGames(user.id),
        ]);

        if (!active) {
          return;
        }

        setGames(mapBacklogGames(entries, playlistGames));
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load backlog");
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

  const processedGames = useMemo(() => {
    const filtered = games.filter((g) => {
      const matchesTab = activeTab === "all" || g.status === activeTab;
      const matchesSearch = g.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "time_short") return a.hoursTotal - b.hoursTotal;
      if (sortBy === "time_long") return b.hoursTotal - a.hoursTotal;
      if (sortBy === "progress") return b.progress - a.progress;
      return a.title.localeCompare(b.title);
    });
  }, [activeTab, games, searchQuery, sortBy]);

  const totalHoursPlayed = games.reduce(
    (acc, game) => acc + game.hoursPlayed,
    0,
  );
  const totalGamesCompleted = games.filter(
    (g) => g.status === "completed",
  ).length;
  const completionRate = Math.round(
    (totalGamesCompleted / Math.max(games.length, 1)) * 100,
  );

  const handlePickForMe = () => {
    const pickPool = games.filter((game) => game.status !== "completed");
    const source = pickPool.length > 0 ? pickPool : games;
    if (source.length === 0) {
      setError("No games available to pick right now.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * source.length);
    const selected = source[randomIndex];
    setPickedGame(selected);
    setPickToastOffsetX(0);
    setPickToastPointerStartX(null);
  };

  const dismissPickToast = () => {
    setPickedGame(null);
    setPickToastOffsetX(0);
    setPickToastPointerStartX(null);
  };

  const openPickedGame = () => {
    if (!pickedGame) {
      return;
    }

    const selectedId = pickedGame.id;
    dismissPickToast();
    navigate(`/games/${selectedId}`);
  };

  const handlePickToastPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setPickToastPointerStartX(event.clientX);
  };

  const handlePickToastPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (pickToastPointerStartX === null) {
      return;
    }
    setPickToastOffsetX(event.clientX - pickToastPointerStartX);
  };

  const handlePickToastPointerUp = () => {
    if (Math.abs(pickToastOffsetX) > 90) {
      dismissPickToast();
      return;
    }

    setPickToastOffsetX(0);
    setPickToastPointerStartX(null);
  };

  const handleTabChange = (value: string) => {
    if (
      value === "all" ||
      value === "want_to_play" ||
      value === "playing" ||
      value === "completed"
    ) {
      setActiveTab(value);
    }
  };

  const handleStatusUpdate = async (gameId: number, nextStatus: BacklogStatus) => {
    const user = getStoredUser();
    if (!user) {
      return;
    }

    setIsMutating(true);
    setError(null);

    const previous = games;
    setGames((current) =>
      current.map((game) => {
        if (game.id !== gameId) {
          return game;
        }

        let hoursPlayed = game.hoursPlayed;
        if (nextStatus === "want_to_play") {
          hoursPlayed = 0;
        } else if (nextStatus === "completed") {
          hoursPlayed = game.hoursTotal;
        }

        const progress = Math.min(100, Math.round((hoursPlayed / (game.hoursTotal || 1)) * 100));
        return {
          ...game,
          status: nextStatus,
          progress,
          hoursPlayed,
          priority: inferPriority(nextStatus),
        };
      }),
    );

    const gameToUpdate = games.find((g) => g.id === gameId);
    let hoursToSend: number | undefined;
    if (nextStatus === "want_to_play") {
      hoursToSend = 0;
    } else if (nextStatus === "completed" && gameToUpdate) {
      hoursToSend = gameToUpdate.hoursTotal;
    }

    try {
      await updatePlaylistEntryByGame(user.id, gameId, {
        status: toApiStatus(nextStatus),
        ...(hoursToSend !== undefined ? { hours_played: hoursToSend } : {}),
      });
    } catch (err) {
      setGames(previous);
      setError(err instanceof Error ? err.message : "Failed to update game status");
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateHours = async (gameId: number, hoursPlayed: number) => {
    const user = getStoredUser();
    if (!user) return;

    setIsMutating(true);
    setError(null);

    const previous = games;
    setGames((current) =>
      current.map((game) => {
        if (game.id !== gameId) return game;
        
        let status = game.status;
        if (status === "want_to_play" && hoursPlayed > 0) {
          status = "playing";
        }
        if (hoursPlayed >= game.hoursTotal && game.hoursTotal > 0) {
          status = "completed";
        }

        const progress = Math.min(100, Math.round((hoursPlayed / (game.hoursTotal || 1)) * 100));
        return {
          ...game,
          status,
          hoursPlayed,
          progress,
        };
      }),
    );

    const gameToUpdate = games.find((g) => g.id === gameId);
    if (!gameToUpdate) return;

    let targetStatus = gameToUpdate.status;
    if (targetStatus === "want_to_play" && hoursPlayed > 0) {
      targetStatus = "playing";
    }
    if (hoursPlayed >= gameToUpdate.hoursTotal && gameToUpdate.hoursTotal > 0) {
      targetStatus = "completed";
    }

    try {
      await updatePlaylistEntryByGame(user.id, gameId, { 
        status: targetStatus, 
        hours_played: hoursPlayed 
      });
    } catch (err) {
      setGames(previous);
      setError(err instanceof Error ? err.message : "Failed to update logged hours");
    } finally {
      setIsMutating(false);
    }
  };

  const handleRemove = async (gameId: number) => {
    const user = getStoredUser();
    if (!user) {
      return;
    }

    setIsMutating(true);
    setError(null);

    const previous = games;
    setGames((current) => current.filter((game) => game.id !== gameId));

    try {
      await removeFromPlaylist(user.id, gameId);
    } catch (err) {
      setGames(previous);
      setError(err instanceof Error ? err.message : "Failed to remove game");
    } finally {
      setIsMutating(false);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <p className="text-muted-foreground">Loading backlog...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {pickedGame ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
          <div
            className="pointer-events-auto w-full max-w-md rounded-xl border border-azure-400/45 bg-abyss-900/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur transition-transform"
            style={{
              transform: `translateX(${pickToastOffsetX}px)`,
              opacity: Math.max(0.35, 1 - Math.abs(pickToastOffsetX) / 240),
            }}
            onPointerDown={handlePickToastPointerDown}
            onPointerMove={handlePickToastPointerMove}
            onPointerUp={handlePickToastPointerUp}
            onPointerCancel={handlePickToastPointerUp}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-azure-300">
                  <Sparkles className="h-3.5 w-3.5" /> Pick for me
                </p>
                <h3 className="mt-1 text-lg font-bold text-azure-50">{pickedGame.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Swipe this card left or right to dismiss.</p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={dismissPickToast}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button className="flex-1" onClick={openPickedGame}>
                Open game
              </Button>
              <Button variant="outline" className="flex-1" onClick={dismissPickToast}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-6 border-b pb-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter font-pixel">
              My Backlog
            </h1>
            <p className="text-muted-foreground mt-2">
              Track, prioritize, and conquer your gaming library.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className="gap-2 flex-1 md:flex-none"
              onClick={handlePickForMe}
              disabled={isMutating || isLoading}
            >
              <Dice5 className="w-4 h-4" /> Pick for Me
            </Button>
            <Button
              asChild
              className="gap-2 bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400 border border-azure-400/50 shadow-[0_0_15px_rgba(26,133,255,0.4)] text-white flex-1 md:flex-none"
            >
              <Link to="/catalogue">
                <PlayCircle className="w-4 h-4" /> Add Game
              </Link>
            </Button>
          </div>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox
            label="Total Games"
            value={games.length.toString()}
          />
          <StatBox
            label="Currently Playing"
            value={games.filter(
              (g) => g.status === "playing",
            ).length.toString()}
          />
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
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("list")}
            >
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

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
          <TabsTrigger value="all">All Games</TabsTrigger>
          <TabsTrigger value="playing" className="gap-2">
            Playing{" "}
            <Badge
              variant="secondary"
              className="px-1 py-0 h-5 text-[10px] rounded-sm bg-azure-500/10 text-azure-600"
            >
              {games.filter((g) => g.status === "playing").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="want_to_play">Up Next</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent
          value={activeTab}
          className="animate-in fade-in-50 duration-500"
        >
          {processedGames.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "flex flex-col gap-4 max-w-4xl mx-auto w-full"
              }
            >
              {processedGames.map((game) => (
                <BacklogItem
                  key={game.id}
                  game={game}
                  view={viewMode}
                  isMutating={isMutating}
                  gameId={game.id}
                  onMarkPlaying={() => handleStatusUpdate(game.id, "playing")}
                  onMoveToBacklog={() => handleStatusUpdate(game.id, "want_to_play")}
                  onMarkCompleted={() => handleStatusUpdate(game.id, "completed")}
                  onRemove={() => handleRemove(game.id)}
                  onUpdateHours={(hours) => handleUpdateHours(game.id, hours)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-muted/20 rounded-xl border border-dashed">
              <h3 className="text-lg font-medium text-muted-foreground">
                No games found.
              </h3>
              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters.
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-abyss-900/50 border border-abyss-700 rounded-lg p-4 flex flex-col justify-center items-center text-center">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function BacklogItem({
  game,
  view,
  gameId,
  isMutating,
  onMarkPlaying,
  onMoveToBacklog,
  onMarkCompleted,
  onRemove,
  onUpdateHours,
}: {
  game: BacklogGame;
  view: "grid" | "list";
  gameId: number;
  isMutating: boolean;
  onMarkPlaying: () => void;
  onMoveToBacklog: () => void;
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

  const handleSaveHours = () => {
    onUpdateHours(draftHours);
    setIsLogHoursOpen(false);
  };

  const handleOpenLogHours = () => {
    setIsLogHoursOpen(true);
  };

  const renderCard = () => {
    if (view === "list") {
      return (
        <Card className="flex flex-row items-center p-3 sm:p-4 gap-4 sm:gap-6 bg-abyss-900 border border-abyss-700 hover:ring-2 hover:ring-primary transition-all group text-left w-full">
          <div className="w-12 sm:w-16 h-16 sm:h-24 rounded-md overflow-hidden shrink-0 bg-muted border shadow-sm">
            <img src={game.cover} alt={game.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col flex-1 min-w-0 justify-center">
            <h4 className="font-bold text-base sm:text-lg truncate">{game.title}</h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
              <Badge className="text-[10px] py-0 bg-abyss-950/80 text-abyss-50 border border-abyss-700 uppercase tracking-tighter">{game.platform}</Badge>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-azure-500" />
                <span className="font-bold text-foreground">{game.hoursPlayed}h</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col w-40 lg:w-56 shrink-0 gap-1.5 px-4 border-l border-abyss-800">
            <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              <span>{formatStatusLabel(game.status)}</span>
              <span>{game.progress}%</span>
            </div>
            <Progress value={game.progress} className="h-1.5" />
          </div>
          <div className="shrink-0">
            <CardActions
              gameId={gameId}
              isMutating={isMutating}
              onMarkPlaying={onMarkPlaying}
              onMoveToBacklog={onMoveToBacklog}
              onMarkCompleted={onMarkCompleted}
              onRemove={onRemove}
              onOpenLogHours={handleOpenLogHours}
            />
          </div>
        </Card>
      );
    }
    return (
      <Card className={`group overflow-hidden flex flex-col h-full bg-abyss-900/50 border transition-all duration-300 ${game.status === 'playing' ? 'border-azure-500/50 ring-1 ring-azure-500/20 shadow-[0_4px_20px_rgba(59,130,246,0.15)]' : 'border-abyss-700 hover:border-abyss-600'}`}>
        <div className="relative">
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <img src={game.cover} alt={game.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-abyss-950/20 to-transparent" />
          </AspectRatio>
          <div className="absolute top-3 right-3 flex flex-col gap-2 scale-90 origin-top-right">
            {game.status === "playing" && (
              <Badge className="bg-azure-500 text-white font-black shadow-lg shadow-azure-500/40 border-none animate-in zoom-in duration-300">PLAYING</Badge>
            )}
            {game.status === "completed" && (
              <Badge className="bg-azure-900/50 text-azure-200 border border-azure-500/30 font-black shadow-lg shadow-black/20">DONE</Badge>
            )}
            {game.priority === "High" && game.status === "want_to_play" && (
              <Badge variant="destructive" className="font-black">HIGH PRIORITY</Badge>
            )}
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-black/40 backdrop-blur-md text-white border-white/10 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">{game.platform}</Badge>
          </div>
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="font-black text-xl text-white leading-none drop-shadow-2xl truncate tracking-tight">{game.title}</h3>
          </div>
        </div>
        <CardContent className="p-4 flex-1 space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Current Progress</span>
              <span className="text-foreground">{game.progress}%</span>
            </div>
            <div className="relative group/progress">
              <Progress value={game.progress} className={`h-2.5 bg-abyss-800 border border-abyss-700/50 ${game.status === 'playing' ? 'shadow-[0_0_10px_rgba(59,130,246,0.2)]' : ''}`} />
              {game.status === 'playing' && (
                <div className="absolute inset-0 bg-azure-500/20 animate-pulse rounded-full pointer-events-none" />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 group/time">
                <div className="p-1.5 rounded-md bg-azure-500/10 border border-azure-500/20 group-hover/time:bg-azure-500/20 transition-colors">
                  <Clock className="w-3.5 h-3.5 text-azure-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold leading-none">Played</span>
                  <span className="text-sm font-bold">{game.hoursPlayed}h</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-abyss-950/50 border border-abyss-800 p-2.5 rounded-lg">
              <Trophy className="w-3.5 h-3.5 text-azure-400 opacity-70" />
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase font-bold leading-none">Estimate</span>
                <span className="text-xs font-semibold">{game.hoursTotal}h to beat</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-abyss-800 bg-abyss-950/20">
          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{formatStatusLabel(game.status)}</div>
          <CardActions
            gameId={gameId}
            isMutating={isMutating}
            onMarkPlaying={onMarkPlaying}
            onMoveToBacklog={onMoveToBacklog}
            onMarkCompleted={onMarkCompleted}
            onRemove={onRemove}
            onOpenLogHours={handleOpenLogHours}
          />
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      {renderCard()}
      <Dialog open={isLogHoursOpen} onOpenChange={setIsLogHoursOpen}>
        <DialogContent className="sm:max-w-[450px] bg-abyss-950 border-abyss-800">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black tracking-tighter">LOG HOURS</DialogTitle>
            <DialogDescription className="text-muted-foreground">
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

function CardActions({
  gameId,
  isMutating,
  onMarkPlaying,
  onMoveToBacklog,
  onMarkCompleted,
  onRemove,
  onOpenLogHours,
}: {
  gameId: number;
  isMutating: boolean;
  onMarkPlaying: () => void;
  onMoveToBacklog: () => void;
  onMarkCompleted: () => void;
  onRemove: () => void;
  onOpenLogHours: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isMutating}>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="gap-2" onSelect={onMarkPlaying}>
          <PlayCircle className="w-4 h-4" /> Mark as Playing
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onSelect={onOpenLogHours}>
          <Clock className="w-4 h-4" /> Log Hours Played
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onSelect={onMoveToBacklog}>
          <ArrowRightCircle className="w-4 h-4" /> Move to Up Next
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onSelect={onMarkCompleted}>
          <CheckCircle2 className="w-4 h-4" /> Mark as Completed
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2">
          <Link to={`/games/${gameId}`}>
            <ArrowRightCircle className="w-4 h-4" /> Open Game Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={onRemove}
        >
          <Trash2 className="w-4 h-4" /> Remove from Backlog
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
