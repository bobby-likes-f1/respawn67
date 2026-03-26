import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Heart,
  Star,
  AlignLeft,
  Calendar,
  LayoutGrid,
} from "lucide-react";
import { getToken } from "@/lib/auth";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Respawn67 | Discover Video Games" },
    {
      name: "description",
      content: "Rate, check and review your favorite video games.",
    },
  ];
}

export function changeImageSize(url: string | null | undefined, size: string): string {
  if (!url) return "https://via.placeholder.com/264x374?text=No+Image";
  return url.replace(/t_[a-z0-9_]+/, `t_${size}`);
}

const MOCK_GAME_IMAGE_BY_TITLE: Record<string, string> = {
  "Hades II": "https://images.igdb.com/igdb/image/upload/t_1080p/coaknx.webp",
  "Ghost of Yotei": "https://images.igdb.com/igdb/image/upload/t_1080p/co9coo.webp",
  "Resident Evil Requiem": "https://images.igdb.com/igdb/image/upload/t_1080p/cob3bo.webp",
  "GTA VI": "https://images.igdb.com/igdb/image/upload/t_1080p/co9rwo.webp",
  "Doom: The Dark Ages": "https://images.igdb.com/igdb/image/upload/t_1080p/co9b3o.webp",
  "Monster Hunter Wilds": "https://images.igdb.com/igdb/image/upload/t_1080p/co904o.webp",
  "Elden Ring": "https://images.igdb.com/igdb/image/upload/t_1080p/co4jni.webp",
  "Hollow Knight": "https://images.igdb.com/igdb/image/upload/t_1080p/cobfzp.webp",
  "Hollow Knight: Silksong": "https://images.igdb.com/igdb/image/upload/t_1080p/cobebu.webp",
  "No Man's Sky": "https://images.igdb.com/igdb/image/upload/t_1080p/coacrk.webp",
  "F1 25": "https://images.igdb.com/igdb/image/upload/t_1080p/co9mk6.webp",
  "Resident Evil 4": "https://images.igdb.com/igdb/image/upload/t_1080p/co6bo0.webp",
  "Cyberpunk 2077": "https://images.igdb.com/igdb/image/upload/t_1080p/coaih8.webp",
  "The Witcher 3": "https://images.igdb.com/igdb/image/upload/t_1080p/coaarl.webp",
  "Red Dead Redemption 2": "https://images.igdb.com/igdb/image/upload/t_1080p/co1q1f.webp",
  "Baldur's Gate 3": "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.webp",
};

// const SHOWCASE_GAMES = [
//   {
//     title: "Elden Ring",
//     description: "Conquer the Lands Between.",
//     image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp",
//   },
//   {
//     title: "Cyberpunk 2077",
//     description: "Become a legend in Night City.",
//     image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co898w.webp",
//   },
//   {
//     title: "Hades",
//     description: "Defy the god of the dead.",
//     image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co39at.webp",
//   },
// ];

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  function handleGetStarted() {
    navigate(isLoggedIn ? "/games" : "/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <section className="container mx-auto px-4 py-24 text-center space-y-8">
        <h1 className="text-6xl md:text-8xl font-pixel tracking-tighter">
          Play it. Rate it. <span className="text-primary">Respawn.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The ultimate social platform for video game lovers. Track your
          backlog, share your reviews, and discover your next obsession.
        </p>

        <div className="flex justify-center gap-4">
          <Button
            onClick={handleGetStarted}
            size="xl"
            className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400 border border-azure-400/50 shadow-[0_0_20px_rgba(26,133,255,0.5)] text-white"
          >
            Get Started
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            {
              title: "Track Your Journey",
              subtitle: "Organize what you're playing now, what is next, and what you've already finished.",
              art: "track",
              color:
                "bg-gradient-to-br from-azure-700 via-azure-600 to-abyss-900 border border-azure-300/45 shadow-xl shadow-abyss-900/45",
            },
            {
              title: "Rate & Review",
              subtitle: "Rate in seconds, then share thoughtful reviews when you want to go deeper.",
              art: "review",
              color:
                "bg-gradient-to-br from-azure-800 via-abyss-800 to-abyss-950 border border-azure-300/30 shadow-xl shadow-abyss-950/50",
            },
            {
              title: "Curate Lists",
              subtitle: "Build themed collections and share them with friends.",
              art: "lists",
              color:
                "bg-gradient-to-br from-azure-600 via-azure-700 to-abyss-900 border border-azure-300/45 shadow-xl shadow-abyss-900/45",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`group relative h-80 overflow-hidden rounded-3xl ${item.color} flex flex-col justify-end p-6 text-left transition-all hover:-translate-y-2 hover:shadow-xl hover:ring-2 hover:ring-primary`}
            >
              <HeroDrawing kind={item.art as "track" | "review" | "lists"} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <h3 className="relative text-2xl font-bold tracking-tight text-white mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                {item.title}
              </h3>
              <p className="relative text-white/95 leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-muted/40 py-20">
        <div className="container mx-auto px-4 space-y-8">
          <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
            Respawn67 lets you...
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Eye />}
              text="Keep track of every game you've ever played (or start from today)."
            />
            <FeatureCard
              icon={<Heart />}
              text="Show some love for your favorite games, lists, and reviews with a 'like'."
            />
            <FeatureCard
              icon={<AlignLeft />}
              text="Write and share reviews, and follow friends to read theirs."
            />
            <FeatureCard
              icon={<Star />}
              text="Rate each game on a five-star scale to record your reaction."
            />
            <FeatureCard
              icon={<Calendar />}
              text="Keep a diary of your gaming history and see your stats over time."
            />
            <FeatureCard
              icon={<LayoutGrid />}
              text="Compile and share lists of games on any topic."
            />
          </div>
        </div>
      </section>

      <section
        id="reviews"
        className="container mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12"
      >
        <div className="lg:col-span-7 space-y-8">
          <div className="flex justify-between items-baseline border-b pb-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Popular Reviews This Week
            </h3>
            <span className="text-xs text-muted-foreground cursor-pointer hover:text-primary">
              More
            </span>
          </div>

          <div className="space-y-8">
            <ReviewItem
              game="Elden Ring"
              year="2022"
              user="MaleniaBlade"
              avatar="M"
              userAvatar="https://api.dicebear.com/9.x/initials/svg?seed=MaleniaBlade"
              coverImage={changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Elden Ring"], "cover_big")}
              rating={5}
              text="I have never known defeat. Until I tried to beat the camera in this boss fight. 10/10 would die again."
              likes="12k"
            />
            <Separator />
            <ReviewItem
              game="Hollow Knight"
              year="2017"
              user="ThePaleKing"
              avatar="P"
              userAvatar="https://api.dicebear.com/9.x/initials/svg?seed=ThePaleKing"
              coverImage={changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Hollow Knight"], "cover_big")}
              rating={5}
              text="No cost too great. No mind to think. No voice to cry suffering. Just pure platforming perfection."
              likes="8.4k"
            />
            <Separator />
            <ReviewItem
              game="Cyberpunk 2077"
              year="2020"
              user="JohnnyS"
              avatar="J"
              userAvatar="https://api.dicebear.com/9.x/initials/svg?seed=JohnnyS"
              coverImage={changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Cyberpunk 2077"], "cover_big")}
              rating={4}
              text="Wake up samurai, we have a city to burn. Or at least render properly now that the patches are out."
              likes="5.2k"
            />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="flex justify-between items-baseline border-b pb-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Popular Lists
            </h3>
            <span className="text-xs text-muted-foreground cursor-pointer hover:text-primary">
              More
            </span>
          </div>

          <div className="space-y-6">
            <ListItem
              title="Games that made me cry"
              user="sad_gamer"
              avatar="https://api.dicebear.com/9.x/initials/svg?seed=sad_gamer"
              count={12}
              likes="4k"
              thumbs={[
                changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Elden Ring"], "cover_small"),
                changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Hollow Knight"], "cover_small"),
                changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Cyberpunk 2077"], "cover_small"),
                changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Red Dead Redemption 2"], "cover_small"),
              ]}
            />
            <ListItem
              title="The absolute worst endings ever"
              user="plot_twist"
              avatar="https://api.dicebear.com/9.x/initials/svg?seed=plot_twist"
              count={8}
              likes="2.1k"
              thumbs={[
                changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Resident Evil 4"], "cover_small"),
                changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Red Dead Redemption 2"], "cover_small"),
                changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Baldur's Gate 3"], "cover_small"),
                changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Elden Ring"], "cover_small"),
              ]}
            />
            <ListItem
              title="Relaxing Sims for Sunday mornings"
              user="cozy_vibes"
              avatar="https://api.dicebear.com/9.x/initials/svg?seed=cozy_vibes"
              count={24}
              likes="10k"
              thumbs={[
                changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["No Man's Sky"], "cover_small"),
                changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Hades II"], "cover_small"),
                changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["Baldur's Gate 3"], "cover_small"),
                changeImageSize(MOCK_GAME_IMAGE_BY_TITLE["The Witcher 3"], "cover_small"),
              ]}
            />
          </div>
        </div>
      </section>

      <footer className="border-t py-12 text-center text-muted-foreground text-sm">
        <p>&copy; 2026 Respawn67. Built with shadcn/ui.</p>
      </footer>
    </div>
  );
}

function HeroDrawing({ kind }: { kind: "track" | "review" | "lists" }) {
  if (kind === "track") {
    return (
      <div className="absolute inset-0">
        <div className="absolute -left-12 top-4 h-48 w-48 rounded-full bg-azure-200/30 blur-3xl" />
        <div className="absolute left-8 right-8 top-16 rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-[1px]">
          <div className="mb-3 flex h-6 items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-azure-200 shadow-[0_0_8px_rgba(191,219,254,0.8)]" />
            <div className="h-2 flex-1 rounded-full bg-white/60" />
            <span className="inline-flex h-5 w-[68px] items-center justify-center rounded-full bg-azure-200/30 px-2 text-[10px] font-semibold text-azure-50">
              PLAYING
            </span>
          </div>
          <div className="mb-3 flex h-6 items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-azure-100 shadow-[0_0_8px_rgba(219,234,254,0.8)]" />
            <div className="h-2 flex-1 rounded-full bg-white/45" />
            <span className="inline-flex h-5 w-[68px] items-center justify-center rounded-full bg-azure-100/30 px-2 text-[10px] font-semibold text-azure-50">
              UP NEXT
            </span>
          </div>
          <div className="flex h-6 items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200 shadow-[0_0_8px_rgba(226,232,240,0.7)]" />
            <div className="h-2 flex-1 rounded-full bg-white/35" />
            <span className="inline-flex h-5 w-[68px] items-center justify-center rounded-full bg-slate-200/25 px-2 text-[10px] font-semibold text-slate-100">
              DONE
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "review") {
    return (
      <div className="absolute inset-0">
        <div className="absolute left-8 top-10 h-28 w-20 rounded-md border border-white/20 bg-white/10" />
        <div className="absolute left-36 top-10 space-y-4">
          <div className="h-2 w-24 rounded-full bg-azure-200/45" />
          <div className="h-2 w-32 rounded-full bg-azure-100/35" />
          <div className="h-2 w-20 rounded-full bg-azure-100/25" />
        </div>
        <div className="absolute left-36 top-32 flex gap-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star key={idx} className="h-3 w-3 fill-azure-300 text-azure-300" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div className="absolute left-8 right-8 top-10 rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur-[1px]">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm border border-azure-100/80 bg-azure-200/30" />
          <div className="h-2 w-36 rounded-full bg-white/70" />
        </div>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm border border-azure-100/80 bg-azure-200/30" />
          <div className="h-2 w-28 rounded-full bg-white/55" />
        </div>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm border border-azure-100/80 bg-azure-200/30" />
          <div className="h-2 w-40 rounded-full bg-white/60" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm border border-azure-100/80 bg-azure-200/30" />
          <div className="h-2 w-24 rounded-full bg-white/45" />
          <span className="ml-auto inline-flex h-5 items-center rounded-full bg-azure-200/25 px-2 text-[10px] font-semibold text-azure-50">
            CURATED
          </span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Card className="bg-abyss-800/40 hover:bg-abyss-800 transition-colors border border-abyss-700 shadow-md">
      <CardContent className="p-6 flex gap-4 items-start">
        <div className="text-azure-400 mt-1">{icon}</div>
        <p className="text-sm leading-relaxed font-medium text-azure-50 group-hover:text-white">
          {text}
        </p>
      </CardContent>
    </Card>
  );
}

function ReviewItem({ game, year, user, avatar, userAvatar, coverImage, rating, text, likes }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-16 h-24 rounded-sm shrink-0 shadow-sm overflow-hidden border border-abyss-700 bg-abyss-800">
        <img src={coverImage} alt={game} className="w-full h-full object-cover" />
      </div>

      <div className="space-y-2 w-full">
        <div className="flex items-baseline gap-2">
          <h4 className="font-bold text-lg">{game}</h4>
          <span className="text-muted-foreground text-sm">{year}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Avatar className="w-5 h-5">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="text-[10px]">{avatar}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-muted-foreground">{user}</span>
          <div className="flex text-azure-500">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
          </div>
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed font-serif">
          {text}
        </p>

        <div className="flex items-center gap-1 text-muted-foreground text-xs mt-2">
          <Heart className="w-3 h-3" /> {likes} likes
        </div>
      </div>
    </div>
  );
}

function ListItem({ title, user, avatar, count, likes, thumbs }: any) {
  return (
    <div className="group cursor-pointer">
      <div className="flex h-32 w-full gap-1 mb-2 overflow-hidden rounded-md border border-border/50">
        {thumbs.map((thumb: string, index: number) => (
          <img
            key={`${title}-${index}`}
            src={thumb}
            alt={`${title} cover ${index + 1}`}
            className="h-full flex-1 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ))}
      </div>
      <h4 className="font-bold leading-tight group-hover:text-primary transition-colors">
        {title}
      </h4>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
        <Avatar className="w-4 h-4">
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-[9px]">U</AvatarFallback>
        </Avatar>
        <span>{user}</span>
        <span>•</span>
        <span>{count} games</span>
        <span>•</span>
        <Heart className="w-3 h-3 inline mr-0.5" /> {likes}
      </div>
    </div>
  );
}
