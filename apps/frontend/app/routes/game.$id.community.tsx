import { Link, type LoaderFunctionArgs, useLoaderData } from "react-router";
import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  FileText,
  Layers3,
  MessageSquareText,
  PenLine,
  Star,
  Trophy,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  getAllUsers,
  getGameById,
  getGameCommunityHub,
  getGameGuides,
  type ApiGame,
  type ApiGameCommunityHub,
  type ApiGuide,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { getStoredUser } from "@/lib/auth";
import { changeImageSize, toUiGameData } from "@/routes/game.$id";

const emptyDistribution = {
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0,
  "6": 0,
  "7": 0,
  "8": 0,
  "9": 0,
  "10": 0,
};

export function meta({ data }: any) {
  const title = data?.gameData?.title;
  return [
    { title: title ? `${title} Community | Respawn67` : "Community | Respawn67" },
    {
      name: "description",
      content: "Read guides, reviews, lists, and community activity around this game.",
    },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id ?? "1";
  const [gameResult, communityResult, guidesResult, usersResult] =
    await Promise.allSettled([
      getGameById(id),
      getGameCommunityHub(id),
      getGameGuides(id),
      getAllUsers(),
    ]);

  const users = usersResult.status === "fulfilled" ? usersResult.value : [];

  return {
    id,
    gameData: gameResult.status === "fulfilled" ? gameResult.value : null,
    community:
      communityResult.status === "fulfilled"
        ? communityResult.value
        : {
            average_rating: null,
            review_count: 0,
            rating_distribution: emptyDistribution,
            reviews: [],
            lists: [],
            playlist_users: [],
          },
    guides: guidesResult.status === "fulfilled" ? guidesResult.value : [],
    usernameById: Object.fromEntries(users.map((user) => [user.id, user.username])),
    hasDataError:
      gameResult.status !== "fulfilled" ||
      communityResult.status !== "fulfilled" ||
      guidesResult.status !== "fulfilled" ||
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

function getDistributionEntries(distribution: Record<string, number>) {
  return Object.entries({ ...emptyDistribution, ...distribution })
    .map(([score, count]) => ({ score: Number(score), count }))
    .filter(({ score }) => score >= 1 && score <= 10)
    .sort((a, b) => b.score - a.score);
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-3 ring-1 ring-white/5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-abyss-700 bg-abyss-950/80">
          <Icon className="h-4 w-4 text-azure-300" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-black tracking-tight text-azure-50">{value}</p>
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
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

function GuideCard({
  gameId,
  guide,
  isOwner = false,
  username,
  userId,
  featured = false,
}: {
  gameId: string;
  guide: ApiGuide;
  isOwner?: boolean;
  username: string;
  userId: number;
  featured?: boolean;
}) {
  return (
    <article
      className={`group rounded-lg border bg-abyss-950/60 ring-1 ring-white/5 transition hover:border-azure-500/55 hover:bg-abyss-950 ${
        featured
          ? "border-azure-500/40 p-5 shadow-[0_22px_50px_rgba(0,0,0,0.34)]"
          : "border-abyss-800 p-4"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-abyss-700 bg-abyss-900">
            <FileText className="h-5 w-5 text-azure-300" />
          </div>
          <div>
            <Link
              to={`/users/${userId}`}
              className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground transition hover:text-azure-300"
            >
              {username}
            </Link>
            <p className="text-xs text-muted-foreground">{formatDate(guide)}</p>
          </div>
        </div>
        {featured ? (
          <Badge className="bg-azure-500 text-abyss-950 hover:bg-azure-500">
            Featured Guide
          </Badge>
        ) : null}
      </div>
      <Link to={`/games/${gameId}/community/guides/${guide.id}`} className="block">
        <h3
          className={
            featured
              ? "text-2xl font-black tracking-tight text-azure-50 transition group-hover:text-azure-300"
              : "text-lg font-black tracking-tight text-azure-50 transition group-hover:text-azure-300"
          }
        >
          {guide.title}
        </h3>
        <p className="mt-3 line-clamp-5 text-sm leading-6 text-abyss-200">{guide.content}</p>
      </Link>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-abyss-800 pt-4">
        <Link
          to={`/games/${gameId}/community/guides/${guide.id}`}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-azure-300 transition hover:text-azure-100"
        >
          <BookOpen className="h-4 w-4" />
          Read Guide
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
        {isOwner ? (
          <Link
            to={`/games/${gameId}/community/guides/${guide.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md border border-abyss-700 bg-abyss-900/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
          >
            <PenLine className="h-3.5 w-3.5" />
            Edit Guide
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default function GameCommunityPage() {
  const { id, gameData, community, guides, usernameById, hasDataError } =
    useLoaderData<typeof loader>();
  const storedUser = getStoredUser();
  const uiData = toUiGameData(gameData as ApiGame | null, id);
  const distribution = getDistributionEntries(community.rating_distribution);
  const maxRatingCount = Math.max(...distribution.map((entry) => entry.count), 1);
  const averageRating = community.average_rating ?? gameData?.average_rating ?? null;
  const featuredGuide = guides[0];
  const secondaryGuides = guides.slice(1);
  const totalPlaylistHours = community.playlist_users.reduce(
    (sum, user) => sum + (user.hours_played || 0),
    0,
  );
  const usernameFor = (userId: number) => usernameById[userId] ?? `User ${userId}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-abyss-800 bg-abyss-950">
        <img
          src={changeImageSize(gameData?.cover_image_url, "720p")}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-18"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,rgba(3,5,9,0.9)_48%,rgba(3,5,9,0.64)_100%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:py-14">
          <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-end">
            <img
              src={uiData.posterImage}
              alt={`${uiData.title} cover`}
              className="aspect-[3/4] w-32 shrink-0 rounded-lg border border-abyss-700 object-cover shadow-2xl ring-1 ring-white/10 sm:w-40"
            />
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-azure-500/40 bg-azure-500/10 text-azure-100">
                  Community Hub
                </Badge>
                {hasDataError ? (
                  <Badge variant="outline" className="border-abyss-700 bg-abyss-900/80 text-muted-foreground">
                    Partial API Data
                  </Badge>
                ) : null}
              </div>
              <h1 className="text-4xl font-black tracking-tight text-azure-50 sm:text-5xl">
                {uiData.title} Community
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Community-written guides sit up front, with reviews, lists, and
                player activity pulled from the dedicated game community API.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to={`/games/${id}`}
                  className="rounded-lg border border-abyss-700 bg-abyss-900/80 px-4 py-2 text-sm font-bold text-azure-50 transition hover:border-azure-500/60 hover:bg-azure-500/10"
                >
                  Game Details
                </Link>
                <Link
                  to="/community"
                  className="rounded-lg bg-azure-600 px-4 py-2 text-sm font-bold text-white shadow-[0_0_18px_rgba(26,133,255,0.26)] transition hover:bg-azure-500"
                >
                  All Community
                </Link>
                <Link
                  to={`/games/${id}/community/guides/new`}
                  className="rounded-lg border border-azure-500/50 bg-azure-500/10 px-4 py-2 text-sm font-bold text-azure-100 transition hover:border-azure-400 hover:bg-azure-500/20"
                >
                  Write a Guide
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatPill icon={BookOpen} label="Guides" value={String(guides.length)} />
            <StatPill
              icon={MessageSquareText}
              label="Reviews"
              value={String(community.review_count || community.reviews.length)}
            />
            <StatPill
              icon={Star}
              label="Avg Rating"
              value={averageRating ? averageRating.toFixed(1) : "-"}
            />
            <StatPill icon={Layers3} label="Lists" value={String(community.lists.length)} />
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-5 ring-1 ring-white/5">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-azure-400/85">
                  Start Here
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-azure-50">
                  Community Guides
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Routes, builds, and player-written notes for getting unstuck faster.
                </p>
              </div>
              <Link
                to={`/games/${id}/community/guides/new`}
                className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-azure-500/45 bg-azure-500/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-azure-100 transition hover:border-azure-400 hover:bg-azure-500/20"
              >
                <PenLine className="h-4 w-4" />
                New Guide
              </Link>
            </div>
            {featuredGuide ? (
              <div className="space-y-4">
                <GuideCard
                  gameId={id}
                  guide={featuredGuide}
                  isOwner={storedUser?.id === featuredGuide.user_id}
                  username={usernameFor(featuredGuide.user_id)}
                  userId={featuredGuide.user_id}
                  featured
                />
                {secondaryGuides.length > 0 ? (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {secondaryGuides.map((guide) => (
                      <GuideCard
                        key={guide.id}
                        gameId={id}
                        guide={guide}
                        isOwner={storedUser?.id === guide.user_id}
                        username={usernameFor(guide.user_id)}
                        userId={guide.user_id}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-abyss-800 bg-abyss-950/55 p-4">
                <p className="text-sm text-muted-foreground">
                  No guides have been published for this game yet.
                </p>
                <Link
                  to={`/games/${id}/community/guides/new`}
                  className="mt-4 inline-flex rounded-lg bg-azure-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-azure-500"
                >
                  Publish the first guide
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-5 ring-1 ring-white/5">
            <SectionHeading eyebrow="Player Notes" title="Recent Reviews" icon={MessageSquareText} />
            <div className="grid gap-3 xl:grid-cols-2">
              {community.reviews.length > 0 ? (
                community.reviews.slice(0, 6).map((review) => {
                  return (
                    <article
                      key={`${review.user_id}-${review.game_id}-${review.score}`}
                      className="rounded-lg border border-abyss-800 bg-abyss-950/55 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-abyss-700 bg-abyss-900 text-xs font-black text-azure-100">
                            {usernameFor(review.user_id).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              to={`/users/${review.user_id}`}
                              className="text-sm font-bold text-azure-50 transition hover:text-azure-300"
                            >
                              {usernameFor(review.user_id)}
                            </Link>
                            <p className="text-xs text-muted-foreground">{formatDate(review)}</p>
                          </div>
                        </div>
                        <Badge className="bg-azure-500 text-abyss-950 hover:bg-azure-500">
                          {review.score}/10
                        </Badge>
                      </div>
                      <Link
                        to={`/games/${review.game_id}/reviews/${review.user_id}`}
                        className="block"
                      >
                        <p className="text-sm leading-6 text-abyss-200 transition hover:text-azure-100">
                          {review.text || "No written review yet."}
                        </p>
                        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-azure-300">
                          Open Review
                        </p>
                      </Link>
                    </article>
                  );
                })
              ) : (
                <p className="rounded-lg border border-abyss-800 bg-abyss-950/55 p-4 text-sm text-muted-foreground xl:col-span-2">
                  No reviews have landed for this game yet.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-5 ring-1 ring-white/5">
            <SectionHeading eyebrow="Collections" title="Lists Featuring This" icon={BookOpen} />
            <div className="grid gap-3 xl:grid-cols-2">
              {community.lists.length > 0 ? (
                community.lists.slice(0, 6).map((list) => (
                  <Link
                    key={list.id}
                    to={`/lists/${list.id}`}
                    className="block rounded-lg border border-abyss-800 bg-abyss-950/55 p-4 transition hover:border-azure-500/50 hover:bg-azure-500/10"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-azure-300" />
                      <p className="text-sm font-bold text-azure-50">{list.name}</p>
                    </div>
                    <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {list.description || "A community list featuring this game."}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="rounded-lg border border-abyss-800 bg-abyss-950/55 p-4 text-sm text-muted-foreground xl:col-span-2">
                  This game has not appeared in public lists yet.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-5 ring-1 ring-white/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-azure-50">
                Rating Pulse
              </h2>
              <ChartNoAxesColumnIncreasing className="h-5 w-5 text-azure-300" />
            </div>
            <div className="space-y-3">
              {distribution.map(({ score, count }) => (
                <div key={score} className="grid grid-cols-[28px_1fr_32px] items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground">{score}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-abyss-950">
                    <div
                      className="h-full rounded-full bg-azure-500 shadow-[0_0_14px_rgba(26,133,255,0.4)]"
                      style={{
                        width: `${Math.max((count / maxRatingCount) * 100, count ? 6 : 0)}%`,
                      }}
                    />
                  </div>
                  <span className="text-right text-xs font-bold text-azure-100">{count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-5 ring-1 ring-white/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-azure-50">
                Player Activity
              </h2>
              <UsersRound className="h-5 w-5 text-azure-300" />
            </div>
            <div className="mb-4 rounded-lg border border-abyss-800 bg-abyss-950/55 p-3">
              <p className="text-2xl font-black tracking-tight text-azure-50">
                {Math.round(totalPlaylistHours)}h
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Tracked by players
              </p>
            </div>
            <div className="space-y-3">
              {community.playlist_users.slice(0, 6).map((user) => (
                <Link
                  key={`${user.user_id}-${user.status}`}
                  to={`/users/${user.user_id}`}
                  className="flex items-center justify-between rounded-lg border border-abyss-800 bg-abyss-950/55 p-3 transition hover:border-azure-500/50 hover:bg-azure-500/10"
                >
                  <div>
                      <p className="text-sm font-bold text-azure-50">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.status.split("_").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ")}
                    </p>
                  </div>
                  <p className="text-sm font-black text-azure-200">
                    {Math.round(user.hours_played)}h
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
