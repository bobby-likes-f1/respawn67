import { Button } from "@/components/ui/button";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My New App" },
    { name: "description", content: "Built with React Router & shadcn" },
  ];
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Respawn67
        </h1>
        <p className="text-muted-foreground text-lg">
          Project Respawn67 is a web app where users can rate, check and review their favorite video games. 
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg">Get Started</Button>
        </div>
      </div>
    </main>
  );
}