import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Star } from "lucide-react";

interface GameCardProps {
  title: string;
  image: string;
  rating: number;
  platform: string[];
}

export function GameCard({ title, image, rating, platform }: GameCardProps) {
  return (
    <div className="overflow-hidden rounded-lg group cursor-pointer transition-all hover:ring-2 hover:ring-primary relative">
      <AspectRatio ratio={3 / 4}>
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        <div className="absolute top-2 right-2">
          <Badge className="bg-black/60 backdrop-blur-md flex gap-1 items-center">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {rating}
          </Badge>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col items-start gap-1">
          <h4 className="font-bold leading-none truncate w-full text-white">{title}</h4>
          <p className="text-xs text-slate-300 uppercase tracking-wider">
            {platform.join(", ")}
          </p>
        </div>
      </AspectRatio>
    </div>
  );
}