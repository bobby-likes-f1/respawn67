import { Link, type LoaderFunctionArgs, useLoaderData } from "react-router";
import { ArrowLeft, ArrowUpRight, FileText, Newspaper, UserRound } from "lucide-react";
import { getAllUsers, getArticleById } from "@/lib/api";

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
  const article = data?.article;
  return [
    {
      title: article?.title ? `${article.title} | Respawn67` : "Article | Respawn67",
    },
    {
      name: "description",
      content: "Read a Respawn67 community article.",
    },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id ?? "1";
  const [article, users] = await Promise.all([
    getArticleById(id).catch(() => null),
    getAllUsers().catch(() => []),
  ]);

  return {
    id,
    article,
    usernameById: Object.fromEntries(users.map((user) => [user.id, user.username])),
  };
}

export default function ArticleDetailPage() {
  const { article, usernameById } = useLoaderData<typeof loader>();

  if (!article) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center px-4 py-12 sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-azure-400/85">
          Article Missing
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-azure-50">
          That community article could not be found.
        </h1>
        <Link
          to="/community"
          className="mt-6 rounded-lg bg-azure-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-azure-500"
        >
          Return to Community
        </Link>
      </div>
    );
  }

  const authorName = usernameById[article.user_id] ?? `User ${article.user_id}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-abyss-800 bg-abyss-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(26,133,255,0.18),transparent_34%),linear-gradient(90deg,var(--background),rgba(3,5,9,0.82))]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-10 sm:px-6 lg:py-16">
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-sm font-bold text-azure-200 transition hover:text-azure-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Community
          </Link>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-azure-500/35 bg-azure-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-azure-300">
                <Newspaper className="h-3.5 w-3.5" />
                Community Article
              </div>
              <h1 className="text-4xl font-black tracking-tight text-azure-50 sm:text-6xl">
                {article.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <Link
                  to={`/users/${article.user_id}`}
                  className="inline-flex items-center gap-2 font-bold text-azure-200 transition hover:text-azure-100"
                >
                  <UserRound className="h-4 w-4" />
                  {authorName}
                </Link>
                <span>{formatDate(article)}</span>
              </div>
            </div>
            <div className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-4 ring-1 ring-white/5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Published by
              </p>
              <Link
                to={`/users/${article.user_id}`}
                className="mt-2 flex items-center justify-between gap-3 rounded-md border border-abyss-700 bg-abyss-950/70 px-3 py-3 text-sm font-bold text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
              >
                {authorName}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-6 ring-1 ring-white/5 sm:p-8">
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-azure-300">
            <FileText className="h-4 w-4" />
            Article
          </div>
          <div className="max-w-3xl whitespace-pre-wrap text-base leading-8 text-abyss-100">
            {article.content}
          </div>
        </article>

        <aside className="space-y-4">
          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-4 ring-1 ring-white/5">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-azure-400">
                Next
              </p>
              <h2 className="mt-1 text-lg font-black tracking-tight text-azure-50">
                Keep Browsing
              </h2>
            </div>
            <div className="space-y-2">
              <Link
                to="/community"
                className="flex items-center justify-between rounded-lg border border-abyss-700 bg-abyss-950/80 px-4 py-3 text-sm font-bold text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
              >
                Community Home
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to={`/users/${article.user_id}`}
                className="flex items-center justify-between rounded-lg border border-abyss-700 bg-abyss-950/80 px-4 py-3 text-sm font-bold text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
              >
                Visit Author Profile
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
