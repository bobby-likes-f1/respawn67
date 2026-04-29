import { useState } from "react";
import { Link, type LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router";
import { ArrowLeft, ArrowUpRight, BookOpen, Gamepad2, PenLine, Plus, Trash2, UserRound } from "lucide-react";
import {
  deleteGuide,
  getAllUsers,
  getGameById,
  getGameGuides,
  type ApiGame,
} from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { changeImageSize, toUiGameData } from "@/routes/game.$id";

function formatDate(item: {
  updated_at?: string;
  UpdatedAt?: string;
  created_at?: string;
  CreatedAt?: string;
}) {
  const date = item.updated_at ?? item.UpdatedAt ?? item.created_at ?? item.CreatedAt;
  if (!date) return "Recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function renderFormattedContent(content: string) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return <p className="text-abyss-300">This guide is empty.</p>;
  }

  return blocks.map((block, index) => {
    if (block.startsWith("### ")) {
      return (
        <h3
          key={`${block}-${index}`}
          className="pt-1 text-lg font-black tracking-tight text-azure-50"
        >
          {block.replace(/^###\s+/, "")}
        </h3>
      );
    }

    if (block.startsWith("## ")) {
      return (
        <h2
          key={`${block}-${index}`}
          className="pt-2 text-2xl font-black tracking-tight text-azure-50"
        >
          {block.replace(/^##\s+/, "")}
        </h2>
      );
    }

    if (block.startsWith("- ")) {
      return (
        <ul key={`${block}-${index}`} className="space-y-2 text-abyss-100">
          {block.split("\n").map((line, lineIndex) => (
            <li key={`${line}-${lineIndex}`} className="flex gap-3">
              <span className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-azure-400" />
              <span>{line.replace(/^-\s+/, "")}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`${block}-${index}`} className="whitespace-pre-line leading-8 text-abyss-100">
        {block}
      </p>
    );
  });
}

export function meta({ data }: any) {
  const guide = data?.guide;
  return [{ title: guide?.title ? `${guide.title} | Respawn67` : "Guide | Respawn67" }];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id ?? "1";
  const guideId = Number(params.guideId ?? "0");
  const [gameData, guides, users] = await Promise.all([
    getGameById(id).catch(() => null),
    getGameGuides(id).catch(() => []),
    getAllUsers().catch(() => []),
  ]);
  const guide = guides.find((entry) => entry.id === guideId) ?? null;
  return {
    id,
    guideId,
    gameData,
    guide,
    usernameById: Object.fromEntries(users.map((user) => [user.id, user.username])),
  };
}

export default function GuideDetailPage() {
  const { id, guide, gameData, usernameById } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const uiData = toUiGameData(gameData as ApiGame | null, id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!guide) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center px-4 py-12 sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-azure-400/85">
          Guide Missing
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-azure-50">
          That guide could not be found.
        </h1>
        <Link
          to={`/games/${id}/community`}
          className="mt-6 rounded-lg bg-azure-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-azure-500"
        >
          Return to Community
        </Link>
      </div>
    );
  }

  const isOwner = storedUser?.id === guide.user_id;
  const authorName = usernameById[guide.user_id] ?? `User ${guide.user_id}`;

  const handleDelete = async () => {
    if (!isOwner || isDeleting) return;
    if (!window.confirm("Delete this guide?")) return;

    try {
      setIsDeleting(true);
      setError(null);
      await deleteGuide(id, guide.id);
      navigate(`/games/${id}/community`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete guide");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-abyss-800 bg-abyss-950">
        <img
          src={changeImageSize(gameData?.cover_image_url, "720p")}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,rgba(3,5,9,0.9)_52%,rgba(3,5,9,0.72)_100%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:py-16">
          <Link
            to={`/games/${id}/community`}
            className="inline-flex items-center gap-2 text-sm font-bold text-azure-200 transition hover:text-azure-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Community
          </Link>
          <div className="grid gap-6 lg:grid-cols-[128px_minmax(0,1fr)_280px] lg:items-end">
            <img
              src={uiData.posterImage}
              alt={`${uiData.title} cover`}
              className="hidden aspect-[3/4] w-32 rounded-lg border border-abyss-700 object-cover shadow-2xl ring-1 ring-white/10 lg:block"
            />
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-azure-500/35 bg-azure-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-azure-300">
                <BookOpen className="h-3.5 w-3.5" />
                Community Guide
              </div>
              <h1 className="text-4xl font-black tracking-tight text-azure-50 sm:text-5xl">
                {guide.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <Link
                  to={`/users/${guide.user_id}`}
                  className="inline-flex items-center gap-2 font-bold text-azure-200 transition hover:text-azure-100"
                >
                  <UserRound className="h-4 w-4" />
                  {authorName}
                </Link>
                <span>{formatDate(guide)}</span>
                <Link
                  to={`/games/${id}`}
                  className="inline-flex items-center gap-2 font-bold text-azure-200 transition hover:text-azure-100"
                >
                  <Gamepad2 className="h-4 w-4" />
                  {uiData.title}
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-4 ring-1 ring-white/5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Game Hub
              </p>
              <Link
                to={`/games/${id}/community`}
                className="mt-2 flex items-center justify-between gap-3 rounded-md border border-abyss-700 bg-abyss-950/70 px-3 py-3 text-sm font-bold text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
              >
                {uiData.title}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-6 ring-1 ring-white/5 sm:p-8">
          {error ? (
            <div className="mb-5 rounded-lg border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-azure-300">
            <BookOpen className="h-4 w-4" />
            Full Guide
          </div>
          <div className="max-w-3xl space-y-5 text-base">
            {renderFormattedContent(guide.content)}
          </div>
        </article>

        <aside className="space-y-4">
          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-4 ring-1 ring-white/5">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-azure-400">
                Keep Going
              </p>
              <h2 className="mt-1 text-lg font-black tracking-tight text-azure-50">
                More Guide Options
              </h2>
            </div>
            <div className="space-y-2">
              <Link
                to={`/games/${id}/community`}
                className="flex items-center justify-between rounded-lg border border-abyss-700 bg-abyss-950/80 px-4 py-3 text-sm font-bold text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
              >
                Game Community
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to={`/games/${id}/community/guides/new`}
                className="flex items-center justify-between rounded-lg border border-abyss-700 bg-abyss-950/80 px-4 py-3 text-sm font-bold text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
              >
                Write Your Own Guide
                <Plus className="h-4 w-4" />
              </Link>
              {isOwner ? (
                <>
                  <Link
                    to={`/games/${id}/community/guides/${guide.id}/edit`}
                    className="flex items-center justify-between rounded-lg bg-azure-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-azure-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <PenLine className="h-4 w-4" />
                      Edit This Guide
                    </span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex w-full items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      {isDeleting ? "Deleting..." : "Delete Guide"}
                    </span>
                  </button>
                </>
              ) : null}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
