import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useRequireAuth } from "@/lib/use-require-auth";
import { getStoredUser } from "@/lib/auth";
import { getArticleById, updateArticle, type ApiArticle } from "@/lib/api";
import type { Route } from "./+types/articles.edit.$id";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Edit Article | Respawn67" },
    {
      name: "description",
      content: "Edit your article",
    },
  ];
}

type Article = ApiArticle;

export default function EditArticlePage() {
  useRequireAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getStoredUser();

  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await getArticleById(id ?? "");
        
        // Check if user is the author
        if (data.user_id !== user?.id) {
          setError("You can only edit your own articles");
          setTimeout(() => navigate("/articles"), 2000);
          return;
        }

        setArticle(data);
        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id, user?.id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      setSaving(false);
      return;
    }

    try {
      await updateArticle(id ?? "", {
        title: title.trim(),
        content: content.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/articles/${id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 text-foreground">
        <div className="mx-auto max-w-3xl">
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Loading article...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="min-h-screen bg-background p-8 text-foreground">
        <div className="mx-auto max-w-3xl">
          <Card className="border-abyss-800 bg-abyss-900/75">
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-red-100">{error}</p>
              <Button onClick={() => navigate("/articles")}>Back to Articles</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(26,133,255,0.18),transparent_32%),linear-gradient(180deg,var(--background),#050915_62%,var(--background))]" />
      <div className="mx-auto max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/articles/${id}`)}
          className="mb-6 gap-2 text-azure-100 hover:bg-azure-500/10 hover:text-azure-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Button>

        <Card className="rounded-lg border-abyss-800 bg-abyss-900/75 ring-1 ring-white/5">
          <CardHeader>
            <CardTitle className="text-3xl font-black tracking-tight text-azure-50">Edit Article</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-lg border border-green-500 bg-green-500/10 p-6 text-center">
                <p className="text-lg font-semibold text-green-400">
                  Article updated successfully.
                </p>
                <p className="mt-2 text-abyss-200">Redirecting...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-100">
                    {error}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-azure-50">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="Enter article title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-abyss-700 bg-abyss-950/80 text-azure-50 placeholder:text-muted-foreground"
                    disabled={saving}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-azure-50">
                    Content <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    placeholder="Write your article here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-96 w-full rounded-md border border-abyss-700 bg-abyss-950/80 p-3 text-azure-50 placeholder:text-muted-foreground focus:border-azure-500/60 focus:outline-none"
                    disabled={saving}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 border border-azure-400/50 bg-gradient-to-r from-azure-600 to-azure-500 text-white hover:from-azure-500 hover:to-azure-400"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/articles/${id}`)}
                    disabled={saving}
                    className="border-abyss-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
