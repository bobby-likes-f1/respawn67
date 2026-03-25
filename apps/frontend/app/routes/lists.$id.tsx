import { useState } from "react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, LayoutGrid, ArrowLeft, Plus, Pencil } from "lucide-react";
import { MOCK_LISTS } from "./lists";

export function meta({ data }: any) {
  const title = data?.list?.title || "List";
  return [
    { title: `${title} | Respawn67` },
    { name: "description", content: data?.list?.description || "A curated game list on Respawn67." },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = Number(params.id);
  const list = MOCK_LISTS.find((l) => l.id === id) ?? null;
  return { list, id };
}

const MOCK_NEW_LIST = {
  id: 99,
  title: "My New List",
  description: "You just created this list! Start adding games to it.",
  author: "rccar344",
  gameCount: 0,
  likes: 0,
  updated: "just now",
  tags: ["Personal"],
  covers: [],
  games: [],
};

function formatLikes(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export default function ListDetailPage() {
  const { list: rawList, id } = useLoaderData<typeof loader>();
  const list = rawList ?? (id === 99 ? MOCK_NEW_LIST : null);

  const [liked, setLiked] = useState(false);

  if (!list) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-muted-foreground">List not found.</p>
        <Link to="/lists" className="text-azure-400 hover:text-azure-300 text-sm flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Lists
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-24">
      <div className="w-full h-[30vh] relative overflow-hidden bg-abyss-950">
        {list.covers.length > 0 && (
          <div className="absolute inset-0 flex">
            {list.covers.slice(0, 5).map((src, i) => (
              <div key={i} className="relative flex-1">
                <img src={src} alt="" className="w-full h-full object-cover opacity-40 blur-sm scale-105"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </div>

      <main className="container mx-auto px-4 sm:px-6 relative z-10 -mt-20 flex flex-col gap-8 max-w-4xl">
        <Link to="/lists" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-azure-400 transition-colors font-medium self-start">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Lists
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {list.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] py-0 px-2 border-abyss-700 text-muted-foreground bg-abyss-950/80 font-medium">{tag}</Badge>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-azure-50 leading-tight">{list.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{list.description}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-[9px] bg-abyss-800 text-azure-400 font-bold">{list.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium hover:text-azure-400 transition-colors cursor-pointer">@{list.author}</span>
              </div>
              <span className="text-abyss-600">·</span>
              <span className="flex items-center gap-1"><LayoutGrid className="w-3 h-3 text-azure-500/70" />{list.gameCount} games</span>
              <span className="text-abyss-600">·</span>
              <span>Updated {list.updated}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setLiked(l => !l)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-bold ${liked ? 'bg-azure-600/20 border-azure-500/50 text-azure-400 shadow-[0_0_10px_rgba(56,189,248,0.15)]' : 'bg-abyss-900 border-abyss-700 text-muted-foreground hover:text-azure-400 hover:border-abyss-600'}`}
            >
              <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-azure-400 text-azure-400' : ''}`} />
              {formatLikes(list.likes + (liked ? 1 : 0))}
            </button>
            {list.author === "rccar344" && (
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-abyss-900 border border-abyss-700 text-muted-foreground hover:text-white hover:border-abyss-600 transition-all text-sm font-bold">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-abyss-800/60 pt-6 space-y-3">
          {list.games.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-abyss-900 border border-abyss-800 flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-abyss-600" />
              </div>
              <p className="text-muted-foreground text-sm max-w-xs">This list is empty. Start adding games to build your collection.</p>
              <button className="flex items-center gap-2 mt-1 bg-azure-600 hover:bg-azure-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                <Plus className="w-4 h-4" /> Add Games
              </button>
            </div>
          ) : (
            list.games.map((game, i) => (
              <div key={i} className="flex items-start gap-5 p-4 bg-abyss-900/60 border border-abyss-800 rounded-xl hover:bg-abyss-900 hover:border-azure-500/30 transition-all group cursor-pointer">
                <span className="text-2xl font-black text-abyss-700 group-hover:text-abyss-500 transition-colors w-7 shrink-0 text-right leading-tight mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="w-10 h-14 bg-abyss-800 rounded-md shrink-0 border border-abyss-700 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-abyss-800 to-abyss-950" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-bold text-azure-50 group-hover:text-azure-300 transition-colors">{game.title}</h3>
                    <span className="text-xs text-muted-foreground/70 shrink-0">{game.year}</span>
                  </div>
                  {game.note && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed italic">"{game.note}"</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
