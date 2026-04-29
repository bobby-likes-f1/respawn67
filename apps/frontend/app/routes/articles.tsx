import { useEffect, useState } from "react";
import { Link } from "react-router";
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
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/v1/articles/");
        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }
        const data = await response.json();
        setArticles(data || []);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">Gaming Articles</h1>
            <p className="text-slate-400">
              Explore insights, guides, and stories from the gaming community
            </p>
          </div>
          <Link to="/articles/write">
            <Button className="gap-2 bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400">
              <PenTool className="h-4 w-4" />
              Write Article
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>Search</Button>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-400">Loading articles...</div>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {filteredArticles.map((article) => (
              <Link key={article.id} to={`/articles/${article.id}`} className="no-underline">
                <Card
                  className="overflow-hidden border-slate-700 bg-slate-800 hover:border-slate-600 transition-all cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-white">
                          {article.title}
                        </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {article.user?.username}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      Article
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{truncateContent(article.content)}</p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(article.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            ))}
          </div>
        ) : (
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">No articles found matching your search.</p>
            </CardContent>
          </Card>
        )}

        {/* No Articles */}
        {!loading && articles.length === 0 && (
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">No articles available yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
