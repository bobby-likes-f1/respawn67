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

type Article = {
  id: number;
  user_id: number;
  user?: {
    id: number;
    username: string;
  };
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

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
        const response = await fetch(`/api/v1/articles/${id}`);
        if (!response.ok) {
          throw new Error("Article not found");
        }
        const data = await response.json();
        
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
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/v1/articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update article");
      }

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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex justify-center py-12">
            <div className="text-slate-400">Loading article...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
        <div className="mx-auto max-w-3xl">
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-red-400">{error}</p>
              <Button onClick={() => navigate("/articles")}>Back to Articles</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/articles/${id}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Button>

        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Edit Article</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-lg border border-green-500 bg-green-500/10 p-6 text-center">
                <p className="text-lg font-semibold text-green-400">
                  Article updated successfully! ✨
                </p>
                <p className="mt-2 text-slate-300">Redirecting...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-400">
                    {error}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="Enter article title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-slate-600 bg-slate-900 text-white placeholder:text-slate-500"
                    disabled={saving}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Content <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    placeholder="Write your article here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-96 w-full rounded-md border border-slate-600 bg-slate-900 p-3 text-white placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
                    disabled={saving}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/articles/${id}`)}
                    disabled={saving}
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
