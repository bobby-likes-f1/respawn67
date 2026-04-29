import { useState } from "react";
import { Link, type LoaderFunctionArgs, useLoaderData } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, PenTool } from "lucide-react";
import { getInitials } from "@/lib/auth";
import { getAllArticles, getAllUsers, type ApiUser } from "@/lib/api";
import type { Route } from "./+types/articles";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Articles | Respawn67" },
    {
      name: "description",
      content: "Read and discover gaming articles from the community.",
    },
  ];
}

type Article = {
  id: number;
  user_id: number;
  user?: {
    id: number;
    username: string;
  };
  author?: {
    id: number;
    username: string;
  };
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
};
type ArticleUser = ApiUser & { ID?: number };

export async function loader(_args: LoaderFunctionArgs) {
  const [articlesResult, usersResult] = await Promise.allSettled([
    getAllArticles(),
    getAllUsers(),
  ]);

  return {
    articles: articlesResult.status === "fulfilled" ? articlesResult.value : [],
    users: usersResult.status === "fulfilled" ? usersResult.value : [],
  };
}

export default function ArticlesPage() {
  const { articles, users } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");

  const usernameById = Object.fromEntries(
    (users as ArticleUser[]).map((user) => [user.id ?? user.ID, user.username]),
  );
  const getAuthorName = (article: Article) =>
    article.user?.username ??
    article.author?.username ??
    usernameById[article.user_id] ??
    `User ${article.user_id}`;
  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getAuthorName(article).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateContent = (content: string, length: number = 150) => {
    return content.length > length ? content.substring(0, length) + "..." : content;
  };

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(26,133,255,0.16),transparent_32%),linear-gradient(180deg,var(--background),#050915_68%,var(--background))]" />
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-azure-50">Gaming Articles</h1>
            <p className="text-muted-foreground">
              Explore insights, guides, and stories from the gaming community
            </p>
          </div>
          <Link to="/articles/write">
            <Button className="gap-2 bg-gradient-to-r from-azure-600 to-azure-500 text-white hover:from-azure-500 hover:to-azure-400">
              <PenTool className="h-4 w-4" />
              Write Article
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-abyss-700 bg-abyss-950/80 pl-11 text-azure-50 placeholder:text-muted-foreground"
            />
          </div>
          <Button className="bg-azure-600 text-white hover:bg-azure-500">Search</Button>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {filteredArticles.map((article) => {
              const authorName = getAuthorName(article);

              return (
                <Link key={article.id} to={`/articles/${article.id}`} className="no-underline">
                  <Card className="cursor-pointer overflow-hidden border-abyss-800 bg-abyss-900/75 transition-all hover:border-azure-500/60 hover:bg-abyss-900">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex flex-1 gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-azure-500/35 bg-abyss-950 text-xs font-black text-azure-100">
                            {getInitials(authorName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-xl text-azure-50">
                              {article.title}
                            </CardTitle>
                            <CardDescription className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4 text-azure-300" />
                              {authorName}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2 border-azure-500/40 bg-azure-500/10 text-azure-100">
                          Article
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-abyss-100">{truncateContent(article.content)}</p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-azure-300" />
                          {formatDate(article.created_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="border-abyss-800 bg-abyss-900/75">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No articles found matching your search.</p>
            </CardContent>
          </Card>
        )}

        {/* No Articles */}
        {articles.length === 0 && (
          <Card className="border-abyss-800 bg-abyss-900/75">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No articles available yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
