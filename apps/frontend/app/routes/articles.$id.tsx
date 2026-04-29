import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
import { getStoredUser } from "@/lib/auth";
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

// Mock articles data
const mockArticles: Article[] = [
  {
    id: 1,
    user_id: 1,
    title: "Mastering Elden Ring: Complete Boss Guide",
    content:
      "In this comprehensive guide, we'll walk you through all the major bosses in Elden Ring and provide strategies to defeat them. From Malenia to Maliketh, discover the best approaches for each encounter.\n\n## Getting Started\n\nElden Ring is a challenging game that requires patience and practice. Before you attempt any boss, make sure you're properly equipped with the right weapons and spells.\n\n## Boss Strategies\n\n### Malenia, Blade of Miquella\nMalenia is one of the most difficult bosses in Elden Ring. She has fast attack combos and can heal herself with each hit. Here are some tips:\n- Use a shield to block her attacks\n- Stay close to avoid her grab attack\n- Watch for her grab and dodge roll away\n\n### Maliketh, the Black Blade\nMaliketh is the final boss before Radagon. He uses dark magic and powerful melee attacks:\n- Dodge roll to the side to avoid his combos\n- Use ranged attacks when he's at a distance\n- Be careful of his grab attack\n\n## Conclusion\n\nWith practice and patience, you'll be able to defeat all the bosses in Elden Ring. Good luck, and may the grace guide you!",
    created_at: "2026-04-25T10:30:00Z",
    updated_at: "2026-04-25T10:30:00Z",
    author: { id: 1, username: "GamingMaster92" },
  },
  {
    id: 2,
    user_id: 2,
    title: "Baldur's Gate 3: Best Character Builds",
    content:
      "Explore the most effective character builds in Baldur's Gate 3. Whether you prefer magic, melee, or stealth, we've covered all the best combinations to help you succeed in your adventure.\n\n## Melee Warrior Build\n\nThe classic warrior is perfect for those who love close combat. Here's what you need:\n- Focus on Strength or Dexterity\n- Use heavy armor for protection\n- Choose weapons like greatswords or battle axes\n\n## Spellcaster Build\n\nIf you prefer magic, this build is for you:\n- Invest in Intelligence for wizards or Wisdom for clerics\n- Learn powerful spells early\n- Use Light armor to maximize spell effectiveness\n\n## Rogue/Stealth Build\n\nFor those who like sneaking around:\n- High Dexterity for stealth and attack speed\n- Light armor for mobility\n- Sneak attack abilities for massive damage\n\n## Hybrid Builds\n\nCombine multiple playstyles for unique experiences:\n- Paladin (Strength + Divine Magic)\n- Ranger (Dexterity + Archery)\n- Bard (Charisma + Magic)",
    created_at: "2026-04-23T14:15:00Z",
    updated_at: "2026-04-23T14:15:00Z",
    author: { id: 2, username: "RPGEnthusiast" },
  },
  {
    id: 3,
    user_id: 3,
    title: "The Evolution of Gaming Graphics",
    content:
      "A deep dive into how gaming graphics have evolved over the past two decades. From pixel art to ray tracing, we explore the technology that has shaped modern gaming.\n\n## The Early Days: 8-bit and 16-bit Era\n\nIn the 1980s and 90s, pixel art dominated the gaming landscape. Games like Super Mario Bros and The Legend of Zelda defined what gaming could be with limited resources.\n\n## 3D Revolution\n\nThe late 1990s brought 3D graphics to the mainstream. Games like Final Fantasy VII and Metal Gear Solid showed the potential of three-dimensional worlds.\n\n## Modern Era: HD and Beyond\n\nToday's games feature photorealistic graphics with advanced lighting and shading techniques. Technologies like ray tracing create stunning visual effects.\n\n## The Future\n\nWith each generation of hardware, we see improvements in graphics quality. Virtual reality and AI-driven graphics are the next frontiers.",
    created_at: "2026-04-20T09:45:00Z",
    updated_at: "2026-04-20T09:45:00Z",
    author: { id: 3, username: "TechWriter" },
  },
  {
    id: 4,
    user_id: 1,
    title: "Speedrunning Tips and Tricks",
    content:
      "Want to break world records? Learn the essential techniques used by top speedrunners. This guide covers routing, movement optimization, and glitch execution.\n\n## Understanding Routing\n\nRouting is the foundation of speedrunning. It involves:\n- Finding the fastest path through the game\n- Skipping unnecessary content\n- Optimizing resource collection\n\n## Movement Techniques\n\nMastering movement is crucial for any speedrunner:\n- Bunny hopping for faster movement\n- Wallclipping to bypass obstacles\n- Sequence breaking to access areas early\n\n## Advanced Glitches\n\nSome of the fastest times use glitches:\n- Clipping through walls\n- Out-of-bounds exploits\n- Sequence breaking\n\n## Practice Makes Perfect\n\nSpeedrunning requires dedication and practice. Start with learning the basic route, then gradually optimize your times.",
    created_at: "2026-04-18T16:20:00Z",
    updated_at: "2026-04-18T16:20:00Z",
    author: { id: 1, username: "GamingMaster92" },
  },
  {
    id: 5,
    user_id: 4,
    title: "Indie Games Worth Your Time",
    content:
      "Discover hidden gems in the indie gaming world. From narrative-driven adventures to challenging roguelikes, these independent titles deserve your attention.\n\n## Narrative Adventures\n\n- Firewatch: A mystery unfolds in the Wyoming wilderness\n- What Remains of Edith Finch: A touching story about family\n- Disco Elysium: A revolution awaits in this noir RPG\n\n## Challenging Roguelikes\n\n- Hades: Escape the underworld in this fast-paced action game\n- Dead Cells: Platform your way through an ever-changing dungeon\n- Risk of Rain 2: Survive the planet and escape\n\n## Puzzle Games\n\n- The Witness: Solve environmental puzzles\n- Baba Is You: Manipulate the rules themselves\n- Opus Magnum: Solve alchemy puzzles creatively\n\n## Why Play Indie Games?\n\nIndie developers push creative boundaries and deliver unique gaming experiences. Support independent creators and discover your next favorite game!",
    created_at: "2026-04-15T11:00:00Z",
    updated_at: "2026-04-15T11:00:00Z",
    author: { id: 4, username: "IndieHunter" },
  },
];

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getStoredUser();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/v1/articles/${id}`);
        if (!response.ok) {
          throw new Error("Article not found");
        }
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/v1/articles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete article");
      }

      navigate("/articles");
    } catch (error) {
      console.error("Error deleting article:", error);
      alert(error instanceof Error ? error.message : "Failed to delete article");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-400">Loading article...</div>
          </div>
        ) : article ? (
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <div className="mb-4 flex items-start justify-between">
                <CardTitle className="text-3xl text-white">
                  {article.title}
                </CardTitle>
                {user && article.user_id === user.id && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/articles/${id}/edit`)}
                      className="gap-2"
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
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {article.user?.username}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(article.created_at)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none space-y-4 text-slate-300">
                {article.content.split("\n\n").map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2 key={index} className="mt-6 text-xl font-semibold text-white">
                        {paragraph.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("- ")) {
                    return (
                      <ul key={index} className="list-inside list-disc space-y-2">
                        {paragraph.split("\n").map((item, i) => (
                          <li key={i} className="text-slate-300">
                            {item.replace("- ", "")}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h3 key={index} className="mt-4 text-lg font-semibold text-white">
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
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-slate-400">Article not found.</p>
              <Button onClick={() => navigate("/articles")}>
                Back to Articles
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="border-slate-700 bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Article</DialogTitle>
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
