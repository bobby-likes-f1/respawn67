import { Link, type LoaderFunctionArgs, useLoaderData } from "react-router";
import {
  BookOpen,
  ChevronRight,
  Compass,
  FileText,
  Layers3,
  MessageSquareText,
  Star,
  TrendingUp,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  getAllArticles,
  getAllGames,
  getAllLists,
  getAllUsers,
  getPublicReviews,
  type ApiArticle,
  type ApiGame,
  type ApiGameList,
  type ApiReview,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { changeImageSize } from "@/routes/game.$id";

const fallbackCover =
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co39at.webp";

export function meta() {
  return [
    { title: "Community | Respawn67" },
    {
      name: "description",
      content: "Browse articles, active game hubs, reviews, and lists from the Respawn67 community.",
    },
  ];
}

export async function loader(_args: LoaderFunctionArgs) {
  const [articlesResult, gamesResult, listsResult, reviewsResult, usersResult] =
    await Promise.allSettled([
      getAllArticles(),
      getAllGames(),
      getAllLists(),
      getPublicReviews({}),
      getAllUsers(),
    ]);
  const users = usersResult.status === "fulfilled" ? usersResult.value : [];

  return {
    articles: articlesResult.status === "fulfilled" ? articlesResult.value : [],
    games: gamesResult.status === "fulfilled" ? gamesResult.value : [],
    lists: listsResult.status === "fulfilled" ? listsResult.value : [],
    reviews: reviewsResult.status === "fulfilled" ? reviewsResult.value : [],
    usernameById: Object.fromEntries(users.map((user) => [user.id, user.username])),
    hasDataError:
      articlesResult.status !== "fulfilled" ||
      gamesResult.status !== "fulfilled" ||
      listsResult.status !== "fulfilled" ||
      reviewsResult.status !== "fulfilled" ||
      usersResult.status !== "fulfilled",
  };
}

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

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-abyss-800 bg-abyss-900/75 p-4 ring-1 ring-white/5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border border-abyss-700 bg-abyss-950/80">
        <Icon className="h-4 w-4 text-azure-300" />
      </div>
      <p className="text-2xl font-black tracking-tight text-azure-50">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-azure-400/85">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-azure-50">
          {title}
        </h2>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-abyss-700 bg-abyss-950/80">
        <Icon className="h-5 w-5 text-azure-300" />
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { articles, games, lists, reviews, usernameById, hasDataError } =
    useLoaderData<typeof loader>();
  const featuredArticle = articles[0];
  const activeGames = [...games]
    .sort((a, b) => {
      const reviewDelta = (b.review_count ?? 0) - (a.review_count ?? 0);
      if (reviewDelta !== 0) return reviewDelta;
      return (b.average_rating ?? 0) - (a.average_rating ?? 0);
    })
    .slice(0, 6);
  const reviewGameById = new Map(games.map((game) => [game.id, game.title]));
  const usernameFor = (userId: number) => usernameById[userId] ?? `User ${userId}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-abyss-800 bg-abyss-950">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-14">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-azure-500/40 bg-azure-500/10 text-azure-100">
                Community
              </Badge>
              {hasDataError ? (
                <Badge variant="outline" className="border-abyss-700 bg-abyss-900/80 text-muted-foreground">
                  Partial API Data
                </Badge>
              ) : null}
            </div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-azure-50 sm:text-5xl">
              Follow the players building better paths through games.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Articles, active game hubs, reviews, and public lists come together here.
              Each game hub links into its guide-focused community page.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/games"
                className="rounded-lg bg-azure-600 px-4 py-2 text-sm font-bold text-white shadow-[0_0_18px_rgba(26,133,255,0.26)] transition hover:bg-azure-500"
              >
                Browse Games
              </Link>
              <Link
                to="/lists"
                className="rounded-lg border border-abyss-700 bg-abyss-900/80 px-4 py-2 text-sm font-bold text-azure-50 transition hover:border-azure-500/60 hover:bg-azure-500/10"
              >
                Browse Lists
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric icon={FileText} label="Articles" value={String(articles.length)} />
            <Metric icon={Compass} label="Game Hubs" value={String(activeGames.length)} />
            <Metric icon={MessageSquareText} label="Reviews" value={String(reviews.length)} />
            <Metric icon={Layers3} label="Lists" value={String(lists.length)} />
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-5 ring-1 ring-white/5">
            <SectionTitle eyebrow="Editorial" title="Community Articles" icon={FileText} />
            {featuredArticle ? (
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <article className="group rounded-lg border border-azure-500/40 bg-abyss-950/60 p-5 ring-1 ring-white/5 transition hover:border-azure-500/70 hover:bg-abyss-950">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link
                        to={`/users/${featuredArticle.user_id}`}
                        className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground transition hover:text-azure-300"
                      >
                        {usernameFor(featuredArticle.user_id)}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatDate(featuredArticle)}</p>
                    </div>
                    <Badge className="bg-azure-500 text-abyss-950 hover:bg-azure-500">
                      Featured
                    </Badge>
                  </div>
                  <Link to={`/articles/${featuredArticle.id}`} className="block">
                    <h3 className="text-2xl font-black tracking-tight text-azure-50 transition group-hover:text-azure-300">
                      {featuredArticle.title}
                    </h3>
                    <p className="mt-3 line-clamp-6 text-sm leading-6 text-abyss-200">
                      {featuredArticle.content}
                    </p>
                  </Link>
                  <Link
                    to={`/articles/${featuredArticle.id}`}
                    className="mt-5 inline-flex items-center gap-2 border-t border-abyss-800 pt-4 text-xs font-bold uppercase tracking-[0.14em] text-azure-300 transition hover:text-azure-100"
                  >
                    Read Article
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </article>

                <div className="space-y-3">
                  {articles.slice(1, 4).map((article) => (
                    <article
                      key={article.id}
                      className="group rounded-lg border border-abyss-800 bg-abyss-950/55 p-4 transition hover:border-azure-500/50 hover:bg-abyss-950"
                    >
                      <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        <Link
                          to={`/users/${article.user_id}`}
                          className="transition hover:text-azure-300"
                        >
                          {usernameFor(article.user_id)}
                        </Link>{" "}
                        · {formatDate(article)}
                      </div>
                      <Link to={`/articles/${article.id}`} className="mt-2 block">
                        <h3 className="text-base font-black tracking-tight text-azure-50 transition group-hover:text-azure-300">
                          {article.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-abyss-200">
                          {article.content}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-azure-300">
                          Read Article
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-abyss-800 bg-abyss-950/55 p-4 text-sm text-muted-foreground">
                No community articles have been published yet.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-5 ring-1 ring-white/5">
            <SectionTitle eyebrow="Game Hubs" title="Active Communities" icon={Compass} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activeGames.map((game) => (
                <Link
                  key={game.id}
                  to={`/games/${game.id}/community`}
                  className="group overflow-hidden rounded-lg border border-abyss-800 bg-abyss-950/60 transition hover:border-azure-500/60 hover:bg-azure-500/10"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-abyss-950">
                    <img
                      src={changeImageSize(game.cover_image_url ?? fallbackCover, "720p")}
                      alt={`${game.title} cover`}
                      className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                    />
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="line-clamp-1 text-lg font-black tracking-tight text-azure-50">
                        {game.title}
                      </h3>
                      {game.average_rating ? (
                        <span className="flex items-center gap-1 text-xs font-black text-azure-200">
                          <Star className="h-3.5 w-3.5 fill-azure-400 text-azure-400" />
                          {game.average_rating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                    <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {game.description || "Open guides, reviews, lists, and player activity."}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-azure-300">
                      <BookOpen className="h-4 w-4" />
                      Open Hub
                    </div>
                  </div>
                </Link>
              ))}
              {activeGames.length === 0 ? (
                <p className="rounded-lg border border-abyss-800 bg-abyss-950/55 p-4 text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
                  No games were returned by the backend yet.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-5 ring-1 ring-white/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-azure-50">
                Recent Reviews
              </h2>
              <MessageSquareText className="h-5 w-5 text-azure-300" />
            </div>
            <div className="space-y-3">
              {reviews.slice(0, 4).map((review) => {
                return (
                  <article
                    key={`${review.user_id}-${review.game_id}-${review.score}`}
                    className="rounded-lg border border-abyss-800 bg-abyss-950/55 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Link
                        to={`/games/${review.game_id}/community`}
                        className="text-sm font-bold text-azure-50 transition hover:text-azure-300"
                      >
                        {reviewGameById.get(review.game_id) || `Game ${review.game_id}`}
                      </Link>
                      <Badge className="bg-azure-500 text-abyss-950 hover:bg-azure-500">
                        {review.score}/10
                      </Badge>
                    </div>
                    <Link
                      to={`/games/${review.game_id}/reviews/${review.user_id}`}
                      className="block"
                    >
                      <p className="line-clamp-3 text-xs leading-5 text-muted-foreground transition hover:text-azure-100">
                        {review.text || "No written review yet."}
                      </p>
                    </Link>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Link
                        to={`/users/${review.user_id}`}
                        className="text-[10px] font-bold uppercase tracking-[0.14em] text-azure-300 transition hover:text-azure-200"
                      >
                        {usernameFor(review.user_id)}
                      </Link>
                      <Link
                        to={`/games/${review.game_id}/reviews/${review.user_id}`}
                        className="text-[10px] font-bold uppercase tracking-[0.14em] text-azure-300 transition hover:text-azure-200"
                      >
                        Open Review
                      </Link>
                    </div>
                  </article>
                );
              })}
              {reviews.length === 0 ? (
                <p className="rounded-lg border border-abyss-800 bg-abyss-950/55 p-4 text-sm text-muted-foreground">
                  No reviews were returned by the backend yet.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-5 ring-1 ring-white/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-azure-50">
                Community Lists
              </h2>
              <TrendingUp className="h-5 w-5 text-azure-300" />
            </div>
            <div className="space-y-3">
              {lists.slice(0, 5).map((list) => (
                <Link
                  key={list.id}
                  to={`/lists/${list.id}`}
                  className="block rounded-lg border border-abyss-800 bg-abyss-950/55 p-4 transition hover:border-azure-500/50 hover:bg-azure-500/10"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <UsersRound className="h-4 w-4 text-azure-300" />
                    <p className="text-sm font-bold text-azure-50">{list.name}</p>
                  </div>
                  <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {list.description || "A public list from the community."}
                  </p>
                </Link>
              ))}
              {lists.length === 0 ? (
                <p className="rounded-lg border border-abyss-800 bg-abyss-950/55 p-4 text-sm text-muted-foreground">
                  No lists were returned by the backend yet.
                </p>
              ) : null}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
