import { useState } from "react";
import { useNavigate } from "react-router";
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
import { ArrowLeft } from "lucide-react";
import { useRequireAuth } from "@/lib/use-require-auth";
import { getStoredUser } from "@/lib/auth";
import type { Route } from "./+types/articles.write";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Write Article | Respawn67" },
    {
      name: "description",
      content: "Share your gaming thoughts and expertise with the community.",
    },
  ];
}

export default function WriteArticlePage() {
  useRequireAuth();
  const navigate = useNavigate();
  const user = getStoredUser();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      setLoading(false);
      return;
    }

    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters");
      setLoading(false);
      return;
    }

    if (content.trim().length < 50) {
      setError("Content must be at least 50 characters");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/articles/", {
        method: "POST",
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
        throw new Error(errorData.message || "Failed to create article");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/articles");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/articles")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Button>

        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Write an Article</CardTitle>
            <CardDescription>
              Share your gaming knowledge and experiences with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-lg border border-green-500 bg-green-500/10 p-6 text-center">
                <p className="text-lg font-semibold text-green-400">
                  Article published successfully! ✨
                </p>
                <p className="mt-2 text-slate-300">Redirecting to articles...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-400">
                    {error}
                  </div>
                )}

                {/* Author Info */}
                <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">
                    Publishing as <span className="font-semibold text-white">{user?.username}</span>
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="Enter article title (at least 5 characters)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-slate-600 bg-slate-900 text-white placeholder:text-slate-500"
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-400">
                    {title.length}/100 characters
                  </p>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Content <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    placeholder="Write your article here... (at least 50 characters)&#10;&#10;Tips:&#10;- Use ## for section headers&#10;- Use - for bullet points&#10;- Press Enter twice for new paragraphs"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-96 w-full rounded-md border border-slate-600 bg-slate-900 p-3 text-white placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
                    disabled={loading}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      {content.length}/5000 characters
                    </p>
                    {content.length < 50 && (
                      <p className="text-xs text-amber-400">
                        Need at least {50 - content.length} more characters
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {content && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Preview
                    </label>
                    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                      <h3 className="mb-2 text-lg font-semibold text-white">
                        {title || "Article Title"}
                      </h3>
                      <p className="line-clamp-3 text-slate-400">
                        {content}
                      </p>
                    </div>
                  </div>
                )}

                {/* Formatting Guide */}
                <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                  <p className="mb-3 text-sm font-semibold text-white">
                    Formatting Tips
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-xs text-slate-400 md:grid-cols-2">
                    <div>
                      <Badge variant="outline" className="mb-1">## Section</Badge>
                      <p>Use ## to create section headers</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-1">- Bullet</Badge>
                      <p>Use - for bullet points</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-1">Paragraphs</Badge>
                      <p>Press Enter twice to create new paragraphs</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-1">### Subheader</Badge>
                      <p>Use ### for smaller section headers</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading || !title.trim() || !content.trim()}
                    className="flex-1 bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400"
                  >
                    {loading ? "Publishing..." : "Publish Article"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/articles")}
                    disabled={loading}
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
