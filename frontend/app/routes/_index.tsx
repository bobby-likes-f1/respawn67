import { Link } from "react-router"; // or "react-router-dom" / "@remix-run/react"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Eye, Heart, Star, AlignLeft, Calendar, LayoutGrid, MessageSquare } from "lucide-react";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Respawn67 | Discover Video Games" },
    { name: "description", content: "Rate, check and review your favorite video games." },
  ];
}

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
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      
      <section className="container mx-auto px-4 py-24 text-center space-y-8">

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
          Play it. Rate it. <span className="text-primary">Respawn.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The ultimate social platform for video game lovers. Track your backlog, share your reviews, and discover your next obsession.
        </p>
        
        <div className="flex justify-center gap-4">
          <Button asChild size="xl" className="px-8 py-6 text-lg rounded-full">
            <Link to="/home">Get Started</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            { title: "Track Everything", color: "bg-emerald-100 dark:bg-emerald-900/20" },
            { title: "Rate & Review", color: "bg-rose-100 dark:bg-rose-900/20" },
            { title: "Curate Lists", color: "bg-orange-100 dark:bg-orange-900/20" }
          ].map((item, i) => (
            <div key={i} className={`h-80 rounded-3xl ${item.color} flex flex-col justify-end p-6 text-left transition-transform hover:-translate-y-1`}>
              <h3 className="text-2xl font-bold tracking-tight">{item.title}</h3>
              <p className="text-muted-foreground">Call out a feature, benefit, or value that stands on its own.</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-muted/40 py-20">
        <div className="container mx-auto px-4 space-y-8">
          <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Respawn67 lets you...</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon={<Eye />} text="Keep track of every game you've ever played (or start from today)." />
            <FeatureCard icon={<Heart />} text="Show some love for your favorite games, lists, and reviews with a 'like'." />
            <FeatureCard icon={<AlignLeft />} text="Write and share reviews, and follow friends to read theirs." />
            <FeatureCard icon={<Star />} text="Rate each game on a five-star scale to record your reaction." />
            <FeatureCard icon={<Calendar />} text="Keep a diary of your gaming history and see your stats over time." />
            <FeatureCard icon={<LayoutGrid />} text="Compile and share lists of games on any topic." />
          </div>
        </div>
      </section>

      <section id="reviews" className="container mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-7 space-y-8">
          <div className="flex justify-between items-baseline border-b pb-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Popular Reviews This Week</h3>
            <span className="text-xs text-muted-foreground cursor-pointer hover:text-primary">More</span>
          </div>

          <div className="space-y-8">
            <ReviewItem 
              game="Elden Ring" 
              year="2022" 
              user="MaleniaBlade" 
              avatar="M"
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
              rating={4}
              text="Wake up samurai, we have a city to burn. Or at least render properly now that the patches are out."
              likes="5.2k"
            />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="flex justify-between items-baseline border-b pb-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Popular Lists</h3>
            <span className="text-xs text-muted-foreground cursor-pointer hover:text-primary">More</span>
          </div>

          <div className="space-y-6">
            <ListItem title="Games that made me cry" user="sad_gamer" count={12} likes="4k" />
            <ListItem title="The absolute worst endings ever" user="plot_twist" count={8} likes="2.1k" />
            <ListItem title="Relaxing Sims for Sunday mornings" user="cozy_vibes" count={24} likes="10k" />
          </div>
        </div>

      </section>
      
      <footer className="border-t py-12 text-center text-muted-foreground text-sm">
        <p>&copy; 2026 Respawn67. Built with shadcn/ui.</p>
      </footer>
    </div>
  );
}


function FeatureCard({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <Card className="bg-card/50 hover:bg-card transition-colors border-0 shadow-sm ring-1 ring-border/50">
      <CardContent className="p-6 flex gap-4 items-start">
        <div className="text-primary mt-1">{icon}</div>
        <p className="text-sm leading-relaxed font-medium text-muted-foreground group-hover:text-foreground">
          {text}
        </p>
      </CardContent>
    </Card>
  );
}

function ReviewItem({ game, year, user, avatar, rating, text, likes }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-16 h-24 bg-muted rounded-sm shrink-0 shadow-sm" />
      
      <div className="space-y-2 w-full">
        <div className="flex items-baseline gap-2">
          <h4 className="font-bold text-lg">{game}</h4>
          <span className="text-muted-foreground text-sm">{year}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Avatar className="w-5 h-5">
            <AvatarImage src="" />
            <AvatarFallback className="text-[10px]">{avatar}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-muted-foreground">{user}</span>
          <div className="flex text-orange-500">
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

function ListItem({ title, user, count, likes }: any) {
  return (
    <div className="group cursor-pointer">
      <div className="flex h-32 w-full gap-1 mb-2 overflow-hidden rounded-md border border-border/50">

         <div className="flex-1 bg-muted group-hover:bg-muted/80 transition-colors" />
         <div className="flex-1 bg-muted/80 group-hover:bg-muted/60 transition-colors" />
         <div className="flex-1 bg-muted/60 group-hover:bg-muted/40 transition-colors" />
         <div className="flex-1 bg-muted/40 group-hover:bg-muted/20 transition-colors" />
      </div>
      <h4 className="font-bold leading-tight group-hover:text-primary transition-colors">{title}</h4>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
        <Avatar className="w-4 h-4">
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