import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  Plus,
  Heart,
  Gamepad2,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  LayoutGrid,
  User,
} from "lucide-react";
import {
  getAllLists,
  getUserLists,
  getListGames,
  getAllUsers,
  createList,
  updateList,
  deleteList,
  type ApiGameList,
  type ApiGame,
} from "@/lib/api";
import { getStoredUser, type AuthUser } from "@/lib/auth";

export const meta = () => {
  return [
    { title: "Game Lists | Respawn67" },
    {
      name: "description",
      content: "Browse and create curated game lists.",
    },
  ];
};

const FALLBACK_COVER =
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co39at.webp";

function changeImageSize(
  url: string | null | undefined,
  size: string,
): string {
  if (!url) return FALLBACK_COVER;
  return url.replace(/t_[a-z0-9_]+/, `t_${size}`);
}

type EnrichedList = ApiGameList & {
  coverImages: string[];
  game_count: number;
  like_count: number;
  liked_by_me: boolean;
};

export default function ListsPage() {
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [allLists, setAllLists] = useState<ApiGameList[]>([]);
  const [myLists, setMyLists] = useState<ApiGameList[]>([]);
  const [listCovers, setListCovers] = useState<
    Record<number, string[]>
  >({});
  const [listGameCounts, setListGameCounts] = useState<
    Record<number, number>
  >({});
  const [likedListIds, setLikedListIds] = useState<Set<number>>(
    new Set(),
  );
  const [usernameById, setUsernameById] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<ApiGameList | null>(
    null,
  );
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSessionUser(getStoredUser());
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const lists = await getAllLists();
        if (!active) return;

        setAllLists(lists);

        try {
          const users = await getAllUsers();
          const uMap: Record<number, string> = {};
          for (const u of users) uMap[u.id] = u.username;
          if (active) setUsernameById(uMap);
        } catch {}

        const coverMap: Record<number, string[]> = {};
        const countMap: Record<number, number> = {};

        await Promise.all(
          lists.map(async (list) => {
            try {
              const games = await getListGames(list.id);
              coverMap[list.id] = games
                .slice(0, 4)
                .map((g) =>
                  changeImageSize(g.cover_image_url, "cover_big"),
                );
              countMap[list.id] = games.length;
            } catch {
              coverMap[list.id] = [];
              countMap[list.id] = 0;
            }
          }),
        );

        if (!active) return;
        setListCovers(coverMap);
        setListGameCounts(countMap);

        const user = getStoredUser();
        if (user) {
          try {
            const userLists = await getUserLists(user.id);
            if (active) setMyLists(userLists);
          } catch {}
        }
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load lists",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const enrichedAllLists: EnrichedList[] = useMemo(() => {
    return allLists.map((list) => ({
      ...list,
      coverImages: listCovers[list.id] || [],
      game_count: listGameCounts[list.id] || 0,
      like_count: list.like_count || 0,
      liked_by_me: likedListIds.has(list.id),
      username: usernameById[list.user_id],
    }));
  }, [allLists, listCovers, listGameCounts, likedListIds, usernameById]);

  const enrichedMyLists: EnrichedList[] = useMemo(() => {
    return myLists.map((list) => ({
      ...list,
      coverImages: listCovers[list.id] || [],
      game_count: listGameCounts[list.id] || 0,
      like_count: list.like_count || 0,
      liked_by_me: false,
      username: usernameById[list.user_id],
    }));
  }, [myLists, listCovers, listGameCounts, usernameById]);

  const processedAllLists = useMemo(() => {
    let filtered = enrichedAllLists.filter((l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return filtered.sort((a, b) => {
      if (sortBy === "most_liked")
        return b.like_count - a.like_count;
      if (sortBy === "most_games")
        return b.game_count - a.game_count;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return b.id - a.id;
    });
  }, [enrichedAllLists, searchTerm, sortBy]);

  const processedMyLists = useMemo(() => {
    return enrichedMyLists
      .filter((l) =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => b.id - a.id);
  }, [enrichedMyLists, searchTerm]);

  const handleToggleLike = (listId: number) => {
    setLikedListIds((prev) => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  };

  const openCreateDialog = () => {
    setEditingList(null);
    setFormName("");
    setFormDescription("");
    setDialogOpen(true);
  };

  const openEditDialog = (list: ApiGameList) => {
    setEditingList(list);
    setFormName(list.name);
    setFormDescription(list.description || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!sessionUser || !formName.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      if (editingList) {
        const updated = await updateList(
          sessionUser.id,
          editingList.id,
          {
            name: formName.trim(),
            description: formDescription.trim() || undefined,
          },
        );
        setAllLists((prev) =>
          prev.map((l) => (l.id === updated.id ? updated : l)),
        );
        setMyLists((prev) =>
          prev.map((l) => (l.id === updated.id ? updated : l)),
        );
      } else {
        const created = await createList(sessionUser.id, {
          name: formName.trim(),
          description: formDescription.trim() || undefined,
        });
        setAllLists((prev) => [created, ...prev]);
        setMyLists((prev) => [created, ...prev]);
        setListCovers((prev) => ({ ...prev, [created.id]: [] }));
        setListGameCounts((prev) => ({ ...prev, [created.id]: 0 }));
      }
      setDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save list",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (listId: number) => {
    if (!sessionUser) return;

    setError(null);
    try {
      await deleteList(sessionUser.id, listId);
      setAllLists((prev) => prev.filter((l) => l.id !== listId));
      setMyLists((prev) => prev.filter((l) => l.id !== listId));
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
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter font-pixel">
              Game Lists
            </h1>
            <p className="text-muted-foreground">Loading lists...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter font-pixel">
              Game Lists
            </h1>
            <p className="text-muted-foreground">
              Browse curated collections or create your own.
            </p>
          </div>

          {sessionUser && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2 bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400 border border-azure-400/50 shadow-[0_0_15px_rgba(26,133,255,0.4)] text-white"
                  onClick={openCreateDialog}
                >
                  <Plus className="w-4 h-4" /> Create List
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-abyss-900 border-abyss-700 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingList ? "Edit List" : "Create New List"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingList
                      ? "Update your list details."
                      : "Give your list a name and optional description."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                      Name
                    </label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Top 10 RPGs"
                      className="border-abyss-700 bg-abyss-950/70"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
                      Description
                    </label>
                    <textarea
                      value={formDescription}
                      onChange={(e) =>
                        setFormDescription(e.target.value)
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
                    onClick={() => setDialogOpen(false)}
                    className="border-abyss-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!formName.trim() || isSaving}
                    className="bg-azure-600 hover:bg-azure-500 text-white"
                  >
                    {isSaving
                      ? "Saving..."
                      : editingList
                        ? "Update"
                        : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {/* Search & Sort */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <div className="text-sm text-muted-foreground">
              {activeTab === "all"
                ? `${processedAllLists.length} lists`
                : `${processedMyLists.length} lists`}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="most_games">
                  Most Games
                </SelectItem>
                <SelectItem value="most_liked">
                  Most Liked
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
            <TabsTrigger value="all">All Lists</TabsTrigger>
            {sessionUser && (
              <TabsTrigger value="mine" className="gap-2">
                My Lists
                <Badge
                  variant="secondary"
                  className="px-1 py-0 h-5 text-[10px] rounded-sm bg-azure-500/10 text-azure-600"
                >
                  {myLists.length}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent
            value="all"
            className="animate-in fade-in-50 duration-500"
          >
            {processedAllLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedAllLists.map((list) => (
                  <ListCard
                    key={list.id}
                    list={list}
                    isOwner={
                      sessionUser?.id === list.user_id
                    }
                    onLike={() => handleToggleLike(list.id)}
                    onEdit={() => openEditDialog(list)}
                    onDelete={() => handleDelete(list.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                message={
                  searchTerm
                    ? `No lists matching "${searchTerm}".`
                    : "No lists have been created yet."
                }
              />
            )}
          </TabsContent>

          {sessionUser && (
            <TabsContent
              value="mine"
              className="animate-in fade-in-50 duration-500"
            >
              {processedMyLists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processedMyLists.map((list) => (
                    <ListCard
                      key={list.id}
                      list={list}
                      isOwner={true}
                      onLike={() => handleToggleLike(list.id)}
                      onEdit={() => openEditDialog(list)}
                      onDelete={() => handleDelete(list.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="You haven't created any lists yet. Click 'Create List' to get started!" />
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}

function ListCard({
  list,
  isOwner,
  onLike,
  onEdit,
  onDelete,
}: {
  list: EnrichedList;
  isOwner: boolean;
  onLike: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const coverImages = list.coverImages;
  const hasCovers = coverImages.length > 0;

  return (
    <Link
      to={`/lists/${list.id}`}
      className="group flex flex-col bg-abyss-900 border border-abyss-700 rounded-xl overflow-hidden hover:border-azure-500/50 hover:shadow-[0_0_20px_rgba(26,133,255,0.12)] transition-all duration-300"
    >
      {/* Cover Art Mosaic */}
      <div className="relative h-40 bg-abyss-950 overflow-hidden">
        {hasCovers ? (
          <div
            className={`grid h-full w-full ${
              coverImages.length === 1
                ? "grid-cols-1"
                : coverImages.length === 2
                  ? "grid-cols-2"
                  : coverImages.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2 grid-rows-2"
            }`}
          >
            {coverImages.slice(0, 4).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LayoutGrid className="w-10 h-10 text-abyss-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-abyss-900 via-transparent to-transparent opacity-80" />

        {/* Game count badge */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-abyss-900/80 border border-abyss-700 flex gap-1 items-center text-abyss-50 text-xs">
            <Gamepad2 className="w-3 h-3 text-azure-400" />
            {list.game_count}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-azure-50 leading-tight truncate group-hover:text-azure-200 transition-colors">
            {list.name}
          </h3>
          {list.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {list.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-abyss-800">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <Link
              to={`/users/${list.user_id}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-azure-400 transition-colors"
            >
              {list.username || `User #${list.user_id}`}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Like button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLike();
              }}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md border transition-all ${
                list.liked_by_me
                  ? "bg-azure-500/10 border-azure-500/30 text-azure-400"
                  : "bg-transparent border-abyss-700 text-muted-foreground hover:border-azure-500/30 hover:text-azure-400"
              }`}
            >
              <Heart
                className={`w-3 h-3 ${list.liked_by_me ? "fill-azure-400" : ""}`}
              />
              {list.like_count}
            </button>

            {/* Owner actions */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="p-1 rounded-md hover:bg-abyss-800 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40"
                >
                  <DropdownMenuItem
                    className="gap-2"
                    onSelect={(e) => {
                      e.preventDefault();
                      onEdit();
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onSelect={(e) => {
                      e.preventDefault();
                      onDelete();
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-24 bg-muted/20 rounded-xl border border-dashed">
      <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground">
        {message}
      </h3>
    </div>
  );
}
