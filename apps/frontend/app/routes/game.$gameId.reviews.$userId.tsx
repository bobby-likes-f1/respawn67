import { Link, type LoaderFunctionArgs, useLoaderData } from "react-router";
import { ArrowLeft, ArrowUpRight, Gamepad2, MessageSquareText, PenLine, Star, UserRound } from "lucide-react";
import {
  getGameById,
  getPublicReviews,
  getUserById,
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

export function meta({ data }: any) {
  const game = data?.gameData;
  const author = data?.author;
  return [
    {
      title:
        game && author
          ? `${author.username}'s ${game.title} Review | Respawn67`
          : "Review | Respawn67",
    },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const gameId = params.gameId ?? "1";
  const userId = params.userId ?? "1";
  const [gameData, author, reviews] = await Promise.all([
    getGameById(gameId).catch(() => null),
    getUserById(userId).catch(() => null),
    getPublicReviews({ gameId: Number(gameId), userId: Number(userId) }).catch(() => []),
  ]);

  return {
    gameId,
    userId,
    gameData,
    author,
    review: reviews[0] ?? null,
  };
}

export default function GameUserReviewPage() {
  const { gameId, userId, gameData, author, review } = useLoaderData<typeof loader>();
  const storedUser = getStoredUser();
  const uiData = toUiGameData(gameData as ApiGame | null, gameId);
  const isOwner = storedUser?.id === Number(userId);

  if (!review) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center px-4 py-12 sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-azure-400/85">
          Review Missing
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-azure-50">
          That player review could not be found.
        </h1>
        <Link
          to={`/games/${gameId}/community`}
          className="mt-6 rounded-lg bg-azure-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-azure-500"
        >
          Return to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-abyss-800 bg-abyss-950">
        <img
          src={changeImageSize(gameData?.cover_image_url, "720p")}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,rgba(3,5,9,0.9)_52%,rgba(3,5,9,0.7)_100%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:py-16">
          <Link
            to={`/games/${gameId}/community`}
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
                <MessageSquareText className="h-3.5 w-3.5" />
                Player Review
              </div>
              <h1 className="text-4xl font-black tracking-tight text-azure-50 sm:text-5xl">
                {uiData.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <Link
                  to={`/users/${userId}`}
                  className="inline-flex items-center gap-2 font-bold text-azure-200 transition hover:text-azure-100"
                >
                  <UserRound className="h-4 w-4" />
                  {author?.username ?? `User ${userId}`}
                </Link>
                <span>{formatDate(review)}</span>
                <span className="inline-flex items-center gap-1 font-bold text-azure-100">
                  <Star className="h-4 w-4 fill-azure-400 text-azure-400" />
                  {review.score}/10
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-4 ring-1 ring-white/5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Score
              </p>
              <div className="mt-2 flex items-center justify-between rounded-md border border-azure-500/35 bg-azure-500/10 px-3 py-3">
                <span className="inline-flex items-center gap-2 text-sm font-black text-azure-100">
                  <Star className="h-4 w-4 fill-azure-400 text-azure-400" />
                  {review.score}/10
                </span>
                <Link
                  to={`/games/${gameId}`}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-azure-300 transition hover:text-azure-100"
                >
                  Game
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-6 ring-1 ring-white/5 sm:p-8">
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-azure-300">
            <MessageSquareText className="h-4 w-4" />
            Review
          </div>
          <p className="max-w-3xl whitespace-pre-wrap text-base leading-8 text-abyss-100">
            {review.text?.trim() || "This review is just a score right now, but the rating still counts toward the community pulse."}
          </p>
        </article>

        <aside className="space-y-4">
          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-4 ring-1 ring-white/5">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-azure-400">
                Next
              </p>
              <h2 className="mt-1 text-lg font-black tracking-tight text-azure-50">
                Review Actions
              </h2>
            </div>
            <div className="space-y-2">
              <Link
                to={`/games/${gameId}/community`}
                className="flex items-center justify-between rounded-lg border border-abyss-700 bg-abyss-950/80 px-4 py-3 text-sm font-bold text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
              >
                <span className="inline-flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Game Community
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to={`/users/${userId}`}
                className="flex items-center justify-between rounded-lg border border-abyss-700 bg-abyss-950/80 px-4 py-3 text-sm font-bold text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
              >
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  Visit Profile
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              {isOwner ? (
                <Link
                  to={`/games/${gameId}`}
                  className="flex items-center justify-between rounded-lg bg-azure-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-azure-500"
                >
                  <span className="inline-flex items-center gap-2">
                    <PenLine className="h-4 w-4" />
                    Edit on Game Page
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
