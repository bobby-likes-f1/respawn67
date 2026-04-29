import { useState } from "react";
import { Link, type LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getInitials, getStoredUser } from "@/lib/auth";
import { deleteArticle, getAllUsers, getArticleById, type ApiArticle, type ApiUser } from "@/lib/api";
import type { Route } from "./+types/articles.$id";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Article | Respawn67" },
    {
      name: "description",
      content: "Read the full article",
    },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id ?? "1";
  const [articleResult, usersResult] = await Promise.allSettled([
    getArticleById(id),
    getAllUsers(),
  ]);

  return {
    id,
    article: articleResult.status === "fulfilled" ? (articleResult.value as Article) : null,
    users: usersResult.status === "fulfilled" ? usersResult.value : [],
  };
}

type Article = ApiArticle & {
  author?: {
    id: number;
    username: string;
  };
};
type ArticleUser = ApiUser & { ID?: number };

export default function ArticleDetailPage() {
  const { id, article, users } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const user = getStoredUser();
  
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteArticle(id);
      navigate("/articles");
    } catch (error) {
      console.error("Error deleting article:", error);
      alert(error instanceof Error ? error.message : "Failed to delete article");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const authorName =
    article?.user?.username ??
    article?.author?.username ??
    (users as ArticleUser[]).find((entry) => (entry.id ?? entry.ID) === article?.user_id)?.username ??
    `User ${article?.user_id ?? ""}`;

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(26,133,255,0.18),transparent_32%),linear-gradient(180deg,var(--background),#050915_62%,var(--background))]" />
      <div className="mx-auto max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/articles")}
          className="mb-6 gap-2 text-azure-100 hover:bg-azure-500/10 hover:text-azure-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Button>

        {article ? (
          <Card className="rounded-lg border-abyss-800 bg-abyss-900/75 ring-1 ring-white/5">
            <CardHeader>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <CardTitle className="text-3xl font-black tracking-tight text-azure-50">
                  {article.title}
                </CardTitle>
                {user && article.user_id === user.id && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/articles/${id}/edit`)}
                      className="gap-2 border-abyss-700 bg-abyss-950/70 text-azure-100 hover:border-azure-500/60 hover:bg-azure-500/10"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-abyss-700 bg-abyss-950 text-xs font-black text-azure-100">
                    {getInitials(authorName)}
                  </div>
                  <Link
                    to={`/users/${article.user_id}`}
                    className="flex items-center gap-2 font-bold text-azure-100 transition hover:text-azure-300"
                  >
                    <User className="h-4 w-4 text-azure-300" />
                    {authorName}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-azure-300" />
                  {formatDate(article.created_at)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none space-y-4 text-abyss-100">
                {article.content.split("\n\n").map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2 key={index} className="mt-6 text-xl font-black tracking-tight text-azure-50">
                        {paragraph.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("- ")) {
                    return (
                      <ul key={index} className="list-inside list-disc space-y-2">
                        {paragraph.split("\n").map((item, i) => (
                          <li key={i} className="text-abyss-100">
                            {item.replace("- ", "")}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h3 key={index} className="mt-4 text-lg font-black tracking-tight text-azure-50">
                        {paragraph.replace("### ", "")}
                      </h3>
                    );
                  }
                  return (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-abyss-800 bg-abyss-900/75">
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">Article not found.</p>
              <Button onClick={() => navigate("/articles")}>
                Back to Articles
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="border-abyss-800 bg-abyss-950">
          <DialogHeader>
            <DialogTitle className="text-azure-50">Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
