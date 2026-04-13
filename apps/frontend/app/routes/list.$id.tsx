import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Heart,
  Gamepad2,
  Plus,
  Trash2,
  Search,
  MoreHorizontal,
  Pencil,
  User,
} from "lucide-react";
import {
  getListById,
  getListGames,
  getAllGames,
  getUserById,
  addGameToList,
  removeGameFromList,
  updateList,
  deleteList,
  type ApiGameList,
  type ApiGame,
} from "@/lib/api";
import { getStoredUser, type AuthUser } from "@/lib/auth";

const FALLBACK_COVER =
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co39at.webp";

function changeImageSize(
  url: string | null | undefined,
  size: string,
): string {
  if (!url) return FALLBACK_COVER;
  return url.replace(/t_[a-z0-9_]+/, `t_${size}`);
}

export default function ListDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sessionUser, setSessionUser] = useState<AuthUser | null>(
    null,
  );
  const [list, setList] = useState<ApiGameList | null>(null);
  const [games, setGames] = useState<ApiGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [ownerUsername, setOwnerUsername] = useState<string | null>(null);

  const [addGameDialogOpen, setAddGameDialogOpen] = useState(false);
  const [allGames, setAllGames] = useState<ApiGame[]>([]);
  const [gameSearchTerm, setGameSearchTerm] = useState("");
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [isRemovingGameId, setIsRemovingGameId] = useState<
    number | null
  >(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isOwner = sessionUser && list
    ? sessionUser.id === list.user_id
    : false;

  useEffect(() => {
    setSessionUser(getStoredUser());
  }, []);

  useEffect(() => {
    if (!id) return;

    let active = true;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [listData, listGames] = await Promise.all([
          getListById(id),
          getListGames(id),
        ]);

        if (!active) return;

        setList(listData);
        setGames(listGames);
        setLikeCount(listData.like_count || 0);

        try {
          const owner = await getUserById(listData.user_id);
          if (active) setOwnerUsername(owner.username);
        } catch {}
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load list",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  // lazy load games for dialog
  useEffect(() => {
    if (!addGameDialogOpen || allGames.length > 0) return;

    (async () => {
      try {
        const games = await getAllGames();
        setAllGames(games);
      } catch {}
    })();
  }, [addGameDialogOpen, allGames.length]);

  const existingGameIds = useMemo(
    () => new Set(games.map((g) => g.id)),
    [games],
  );

  const filteredAvailableGames = useMemo(() => {
    return allGames
      .filter(
        (g) =>
          !existingGameIds.has(g.id) &&
          g.title
            .toLowerCase()
            .includes(gameSearchTerm.toLowerCase()),
      )
      .slice(0, 20);
  }, [allGames, existingGameIds, gameSearchTerm]);

  const handleAddGame = async (gameId: number) => {
    if (!sessionUser || !list) return;

    setIsAddingGame(true);
    setError(null);

    try {
      await addGameToList(sessionUser.id, list.id, gameId);

      // optimistic add
      const addedGame = allGames.find((g) => g.id === gameId);
      if (addedGame) {
        setGames((prev) => [...prev, addedGame]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add game",
      );
    } finally {
      setIsAddingGame(false);
    }
  };

  const handleRemoveGame = async (gameId: number) => {
    if (!sessionUser || !list) return;

    setIsRemovingGameId(gameId);
    setError(null);

    const previous = games;
    setGames((prev) => prev.filter((g) => g.id !== gameId));

    try {
      await removeGameFromList(sessionUser.id, list.id, gameId);
    } catch (err) {
      setGames(previous);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove game",
      );
    } finally {
      setIsRemovingGameId(null);
    }
  };

  const handleToggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const openEditDialog = () => {
    if (!list) return;
    setEditName(list.name);
    setEditDescription(list.description || "");
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!sessionUser || !list || !editName.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      const updated = await updateList(
        sessionUser.id,
        list.id,
        {
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        },
      );
      setList(updated);
      setEditDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update list",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteList = async () => {
    if (!sessionUser || !list) return;

    try {
      await deleteList(sessionUser.id, list.id);
      navigate("/lists");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete list",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="container mx-auto py-10 px-4">
          <p className="text-muted-foreground">Loading list...</p>
        </main>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="container mx-auto py-10 px-4 space-y-4">
          <h1 className="text-4xl font-black tracking-tighter font-pixel">
            List Not Found
          </h1>
          <p className="text-muted-foreground">
            This list doesn't exist or has been deleted.
          </p>
          <Button variant="outline" asChild>
            <Link to="/lists">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lists
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto py-10 px-4 space-y-8">
        {/* Back button */}
        <Button
          variant="ghost"
          asChild
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <Link to="/lists">
            <ArrowLeft className="w-4 h-4" />
            All Lists
          </Link>
        </Button>

        {/* Hero Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-border/60 pb-8">
          <div className="space-y-3 flex-1 min-w-0">
            <h1 className="text-4xl font-black tracking-tighter font-pixel">
              {list.name}
            </h1>
            {list.description && (
              <p className="text-muted-foreground text-lg max-w-2xl">
                {list.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link
                to={`/users/${list.user_id}`}
                className="flex items-center gap-1.5 hover:text-azure-400 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                {ownerUsername || `User #${list.user_id}`}
              </Link>
              <span className="flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-azure-400" />
                {games.length} game{games.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Like button */}
            <button
              type="button"
              onClick={handleToggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                liked
                  ? "bg-azure-500/10 border-azure-500/30 text-azure-400 shadow-[0_0_12px_rgba(26,133,255,0.15)]"
                  : "bg-abyss-900 border-abyss-700 text-muted-foreground hover:border-azure-500/30 hover:text-azure-400"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${liked ? "fill-azure-400" : ""}`}
              />
              <span>{likeCount}</span>
            </button>

            {isOwner && (
              <>
                <Dialog
                  open={addGameDialogOpen}
                  onOpenChange={setAddGameDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400 border border-azure-400/50 shadow-[0_0_15px_rgba(26,133,255,0.4)] text-white">
                      <Plus className="w-4 h-4" />
                      Add Game
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-abyss-900 border-abyss-700 sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add Game to List</DialogTitle>
                      <DialogDescription>
                        Search and add games to "{list.name}".
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search games..."
                          value={gameSearchTerm}
                          onChange={(e) =>
                            setGameSearchTerm(e.target.value)
                          }
                          className="pl-9 border-abyss-700 bg-abyss-950/70"
                        />
                      </div>
                      <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                        {filteredAvailableGames.length > 0 ? (
                          filteredAvailableGames.map((game) => (
                            <button
                              key={game.id}
                              type="button"
                              disabled={isAddingGame}
                              onClick={() =>
                                handleAddGame(game.id)
                              }
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-abyss-800 transition-colors text-left group"
                            >
                              <div className="w-10 h-14 rounded overflow-hidden shrink-0 border border-abyss-700 bg-abyss-950">
                                <img
                                  src={changeImageSize(
                                    game.cover_image_url,
                                    "cover_small",
                                  )}
                                  alt={game.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {game.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {game.genre || "Unknown"}{" "}
                                  {game.release_year
                                    ? `· ${game.release_year}`
                                    : ""}
                                </p>
                              </div>
                              <Plus className="w-4 h-4 text-muted-foreground group-hover:text-azure-400 transition-colors shrink-0" />
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            {gameSearchTerm
                              ? "No matching games found."
                              : "All games are already in this list."}
                          </p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-abyss-700 bg-abyss-900 hover:bg-abyss-800"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-40"
                  >
                    <DropdownMenuItem
                      className="gap-2"
                      onSelect={openEditDialog}
                    >
                      <Pencil className="w-4 h-4" />
                      Edit List
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                      onSelect={handleDeleteList}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete List
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {/* Games Grid */}
        {games.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {games.map((game) => (
              <div key={game.id} className="relative group">
                <Link
                  to={`/games/${game.id}`}
                  className="relative aspect-[3/4] overflow-hidden rounded-lg block cursor-pointer transition-all hover:ring-2 hover:ring-primary"
                >
                  <img
                    src={changeImageSize(
                      game.cover_image_url,
                      "cover_big",
                    )}
                    alt={game.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                    <h4 className="font-bold leading-tight text-white text-sm">
                      {game.title}
                    </h4>
                    <p className="text-[10px] text-white/70 uppercase tracking-wider">
                      {game.genre || "Unknown"}
                      {game.release_year
                        ? ` · ${game.release_year}`
                        : ""}
                    </p>
                  </div>
                </Link>

                {/* Remove button (owner only) */}
                {isOwner && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 top-2 z-20 h-7 w-7 border border-abyss-700 bg-abyss-950/90 text-azure-50 hover:bg-red-900/80 hover:text-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveGame(game.id)}
                    disabled={isRemovingGameId === game.id}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-muted/20 rounded-xl border border-dashed">
            <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No games in this list yet.
            </h3>
            {isOwner && (
              <p className="text-sm text-muted-foreground mt-2">
                Click "Add Game" to start building your list.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-abyss-900 border-abyss-700 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
            <DialogDescription>
              Update your list details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                Name
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="List name"
                className="border-abyss-700 bg-abyss-950/70"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) =>
                  setEditDescription(e.target.value)
                }
                placeholder="What's this list about?"
                rows={3}
                className="w-full rounded-md border border-abyss-700 bg-abyss-950/70 px-3 py-2 text-sm text-foreground outline-none transition focus:border-azure-500 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-abyss-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={!editName.trim() || isSaving}
              className="bg-azure-600 hover:bg-azure-500 text-white"
            >
              {isSaving ? "Saving..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
