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
import { createArticle } from "@/lib/api";
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
      await createArticle({
        title: title.trim(),
        content: content.trim(),
      });

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

        <Card className="rounded-lg border-abyss-800 bg-abyss-900/75 ring-1 ring-white/5">
          <CardHeader>
            <CardTitle className="text-3xl font-black tracking-tight text-azure-50">Write an Article</CardTitle>
            <CardDescription className="text-muted-foreground">
              Share your gaming knowledge and experiences with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-lg border border-green-500 bg-green-500/10 p-6 text-center">
                <p className="text-lg font-semibold text-green-400">
                  Article published successfully.
                </p>
                <p className="mt-2 text-abyss-200">Redirecting to articles...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-100">
                    {error}
                  </div>
                )}

                {/* Author Info */}
                <div className="rounded-lg border border-abyss-800 bg-abyss-950/70 p-4">
                  <p className="text-sm text-muted-foreground">
                    Publishing as <span className="font-semibold text-azure-50">{user?.username}</span>
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-azure-50">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="Enter article title (at least 5 characters)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-abyss-700 bg-abyss-950/80 text-azure-50 placeholder:text-muted-foreground"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    {title.length}/100 characters
                  </p>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-azure-50">
                    Content <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    placeholder="Write your article here... (at least 50 characters)&#10;&#10;Tips:&#10;- Use ## for section headers&#10;- Use - for bullet points&#10;- Press Enter twice for new paragraphs"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-96 w-full rounded-md border border-abyss-700 bg-abyss-950/80 p-3 text-azure-50 placeholder:text-muted-foreground focus:border-azure-500/60 focus:outline-none"
                    disabled={loading}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
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
                    <label className="block text-sm font-medium text-azure-50">
                      Preview
                    </label>
                    <div className="rounded-lg border border-abyss-800 bg-abyss-950/70 p-4">
                      <h3 className="mb-2 text-lg font-semibold text-azure-50">
                        {title || "Article Title"}
                      </h3>
                      <p className="line-clamp-3 text-muted-foreground">
                        {content}
                      </p>
                    </div>
                  </div>
                )}

                {/* Formatting Guide */}
                <div className="rounded-lg border border-abyss-800 bg-abyss-950/70 p-4">
                  <p className="mb-3 text-sm font-semibold text-azure-50">
                    Formatting Tips
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-2">
                    <div>
                      <Badge variant="outline" className="mb-1 border-azure-500/40 bg-azure-500/10 text-azure-100">## Section</Badge>
                      <p>Use ## to create section headers</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-1 border-azure-500/40 bg-azure-500/10 text-azure-100">- Bullet</Badge>
                      <p>Use - for bullet points</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-1 border-azure-500/40 bg-azure-500/10 text-azure-100">Paragraphs</Badge>
                      <p>Press Enter twice to create new paragraphs</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-1 border-azure-500/40 bg-azure-500/10 text-azure-100">### Subheader</Badge>
                      <p>Use ### for smaller section headers</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading || !title.trim() || !content.trim()}
                    className="flex-1 border border-azure-400/50 bg-gradient-to-r from-azure-600 to-azure-500 text-white hover:from-azure-500 hover:to-azure-400"
                  >
                    {loading ? "Publishing..." : "Publish Article"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/articles")}
                    disabled={loading}
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
