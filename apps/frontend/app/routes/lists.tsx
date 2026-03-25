import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, LayoutGrid, Plus, TrendingUp, Flame, Sparkles, X } from "lucide-react";

export function meta() {
  return [
    { title: "Lists | Respawn67" },
    { name: "description", content: "Discover community-curated game lists on Respawn67." },
  ];
}

export const MOCK_LISTS = [
  {
    id: 1,
    title: "The 10 Games That Made Me Who I Am",
    description: "A personal retrospective on the games that shaped my taste, worldview, and relationship with the medium.",
    author: "s-arkal",
    gameCount: 10,
    likes: 1240,
    updated: "2 days ago",
    tags: ["Personal", "Essential"],
    covers: [
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co39at.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/cobfzp.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/coaih8.webp",
    ],
    games: [
      { title: "Elden Ring", year: "2022", note: "The game that broke me and rebuilt me. Nothing compares." },
      { title: "Hades", year: "2020", note: "Showed me that roguelikes could have actual stories worth caring about." },
      { title: "Hollow Knight", year: "2017", note: "The first game I ever 100%'d. Still haunts me." },
      { title: "Baldur's Gate 3", year: "2023", note: "An absurd achievement. Proof that ambition pays off." },
      { title: "Cyberpunk 2077", year: "2020", note: "The redemption arc is real. Phantom Liberty is flawless." },
    ],
  },
  {
    id: 2,
    title: "Best Games to Play When Your Brain is Off",
    description: "No story, no decisions, no consequences. Just pure, meditative play. Great for winding down after a long day.",
    author: "ThePaleKing",
    gameCount: 15,
    likes: 8430,
    updated: "3 days ago",
    tags: ["Chill", "Popular"],
    covers: [
      "https://images.igdb.com/igdb/image/upload/t_cover_big/coacrk.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co904o.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co9coo.webp",
    ],
    games: [
      { title: "No Man's Sky", year: "2016", note: "Fly around. Mine stuff. Chill." },
      { title: "Monster Hunter Wilds", year: "2025", note: "The loop is so satisfying it loops itself." },
      { title: "Ghost of Yotei", year: "2025", note: "Walk around feudal Japan and feel at peace." },
    ],
  },
  {
    id: 3,
    title: "Games That Made Me Actually Feel Something",
    description: "The ones that stuck with me long after the credits rolled. Warning: contains spoilers and emotional damage.",
    author: "MaleniaBlade",
    gameCount: 12,
    likes: 5210,
    updated: "1 week ago",
    tags: ["Emotional", "Story"],
    covers: [
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/coaarl.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/cobfzp.webp",
    ],
    games: [
      { title: "Red Dead Redemption 2", year: "2018", note: "The ending made me sit in silence for 20 minutes." },
      { title: "The Witcher 3", year: "2015", note: "I still think about Ciri." },
      { title: "Baldur's Gate 3", year: "2023", note: "I actually talked to my companions like real people." },
      { title: "Hollow Knight", year: "2017", note: "Grief, sacrifice, and a dying kingdom. Perfect." },
    ],
  },
  {
    id: 4,
    title: "The Absolute Worst Protagonist Decisions in Gaming History",
    description: "A comedic hall of fame for every time a game character did something that made you yell at your screen.",
    author: "plot_twist",
    gameCount: 8,
    likes: 3150,
    updated: "2 weeks ago",
    tags: ["Comedy", "Controversial"],
    covers: [
      "https://images.igdb.com/igdb/image/upload/t_cover_big/coaih8.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co6bo0.webp",
    ],
    games: [
      { title: "Cyberpunk 2077", year: "2020", note: "V, just LEAVE Night City man." },
      { title: "Resident Evil 4", year: "2023", note: "Leon walks past so many locked doors it's criminal." },
    ],
  },
  {
    id: 5,
    title: "Every Soulslike Ranked, No Mercy",
    description: "From Demon's Souls to the cheapest indie imitators. A definitive and extremely opinionated ranking.",
    author: "GrudgeBoss",
    gameCount: 22,
    likes: 11800,
    updated: "3 days ago",
    tags: ["Ranking", "Soulslike"],
    covers: [
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/cobfzp.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co9b3o.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co904o.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/coaarl.webp",
    ],
    games: [
      { title: "Elden Ring", year: "2022", note: "S Tier. The peak. Nothing comes close. Accept it." },
      { title: "Hollow Knight", year: "2017", note: "Technically not Soulslike but it earns its place here." },
      { title: "Doom: The Dark Ages", year: "2025", note: "Does enough to earn a place in this conversation." },
      { title: "Monster Hunter Wilds", year: "2025", note: "The boss design language is pure souls DNA." },
      { title: "The Witcher 3", year: "2015", note: "Doesn't count but it's so good I'm adding it anyway." },
    ],
  },
  {
    id: 6,
    title: "Co-op Games Worth Losing Friends Over",
    description: "The best multiplayer experiences that simultaneously strengthen and destroy friendships.",
    author: "rccar344",
    gameCount: 7,
    likes: 2900,
    updated: "5 days ago",
    tags: ["Multiplayer", "Co-op"],
    covers: [
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co7qvq.webp",
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co9mk6.webp",
    ],
    games: [
      { title: "Helldivers 2", year: "2024", note: "For democracy. And also for accidentally team-killing everyone." },
      { title: "F1 25", year: "2025", note: "Race your friends. Hate your friends." },
    ],
  },
];

const SORT_OPTIONS = ["Popular", "New", "Trending"] as const;
type SortOption = typeof SORT_OPTIONS[number];

const SORT_ICONS: Record<SortOption, React.ReactNode> = {
  Popular: <Flame className="w-3.5 h-3.5" />,
  New: <Sparkles className="w-3.5 h-3.5" />,
  Trending: <TrendingUp className="w-3.5 h-3.5" />,
};

function formatLikes(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function NewListModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onClose();
    navigate("/lists/99");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-abyss-900 border border-abyss-700 rounded-2xl shadow-2xl shadow-black/60 w-full max-w-md ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-abyss-800">
          <div>
            <h2 className="text-lg font-bold text-azure-50 tracking-tight">Create a New List</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Curate your perfect game collection.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest font-bold text-azure-500">List Title</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Games That Destroyed My Sleep Schedule"
              className="bg-abyss-950 border border-abyss-700 rounded-lg px-3 py-2.5 text-sm text-azure-50 placeholder:text-muted-foreground/60 focus:outline-none focus:border-azure-500 focus:ring-1 focus:ring-azure-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest font-bold text-azure-500">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this list about? Who's it for?"
              rows={3}
              className="bg-abyss-950 border border-abyss-700 rounded-lg px-3 py-2.5 text-sm text-azure-50 placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:border-azure-500 focus:ring-1 focus:ring-azure-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPublic(p => !p)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${isPublic ? 'bg-azure-600' : 'bg-abyss-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm text-muted-foreground">
              {isPublic ? "Public — anyone can see this list" : "Private — only you can see this"}
            </span>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-abyss-800 hover:bg-abyss-700 text-muted-foreground hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-[2] py-2.5 rounded-lg bg-azure-600 hover:bg-azure-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shadow-[0_0_12px_rgba(26,133,255,0.3)] text-sm font-bold uppercase tracking-wider"
            >
              Create List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ListCard({ list }: { list: typeof MOCK_LISTS[0] }) {
  const [liked, setLiked] = useState(false);
  const displayCovers = list.covers.slice(0, 5);
  const overflow = list.gameCount - displayCovers.length;

  return (
    <Link
      to={`/lists/${list.id}`}
      className="group relative bg-abyss-900 border border-abyss-800 rounded-xl overflow-hidden hover:border-azure-500/50 hover:shadow-[0_0_25px_rgba(26,133,255,0.08)] transition-all duration-300 flex flex-col"
    >
      <div className="relative h-28 bg-abyss-950 flex items-end overflow-hidden shrink-0">
        <div className="absolute inset-0 flex">
          {displayCovers.map((src, i) => (
            <div
              key={i}
              className="relative shrink-0 transition-transform duration-500 group-hover:scale-105"
              style={{ width: `${100 / displayCovers.length}%`, zIndex: displayCovers.length - i }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-28 object-cover object-top"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-abyss-950/60" />
            </div>
          ))}
          {overflow > 0 && (
            <div className="absolute right-0 top-0 h-full w-12 bg-abyss-900 border-l border-abyss-800 flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-bold">+{overflow}</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-abyss-900 via-abyss-900/30 to-transparent" />
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {list.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] py-0 px-2 border-abyss-700 text-muted-foreground bg-abyss-950/60 font-medium">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-azure-50 leading-snug text-base group-hover:text-azure-300 transition-colors duration-200 line-clamp-2">
            {list.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
            {list.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-abyss-800/60">
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="text-[9px] bg-abyss-800 text-azure-400 font-bold">
                {list.author.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium hover:text-azure-400 transition-colors">
              @{list.author}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <LayoutGrid className="w-3 h-3 text-azure-500/70" />
              {list.gameCount}
            </span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(l => !l); }}
              className={`flex items-center gap-1 transition-colors ${liked ? 'text-azure-400' : 'hover:text-azure-400'}`}
              title="Like this list"
            >
              <Heart className={`w-3 h-3 transition-all ${liked ? 'fill-azure-400 text-azure-400 scale-110 drop-shadow-[0_0_4px_rgba(56,189,248,0.6)]' : ''}`} />
              {formatLikes(list.likes + (liked ? 1 : 0))}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ListsPage() {
  const [sort, setSort] = useState<SortOption>("Popular");
  const [showNewList, setShowNewList] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {showNewList && <NewListModal onClose={() => setShowNewList(false)} />}

      <main className="container mx-auto py-10 px-4 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-8">
          <div className="space-y-1">
            <p className="text-[11px] text-azure-500 uppercase tracking-[0.2em] font-bold">Community</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-azure-50">Lists</h1>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              Handpicked collections from the Respawn67 community. From personal favourites to definitive rankings.
            </p>
          </div>
          <button
            onClick={() => setShowNewList(true)}
            className="flex items-center gap-2 bg-azure-600 hover:bg-azure-500 text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-[0_0_15px_rgba(26,133,255,0.25)] text-sm self-start md:self-auto shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New List
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mr-1">Sort</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setSort(opt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                sort === opt
                  ? "bg-azure-600/20 text-azure-400 border border-azure-500/40 shadow-[0_0_8px_rgba(56,189,248,0.15)]"
                  : "text-muted-foreground hover:text-azure-400 border border-transparent hover:border-abyss-700"
              }`}
            >
              {SORT_ICONS[opt]}
              {opt}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {MOCK_LISTS.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      </main>

      <footer className="border-t py-12 text-center text-muted-foreground text-sm mt-auto">
        <p>&copy; 2026 Respawn67. Built with shadcn/ui.</p>
      </footer>
    </div>
  );
}
