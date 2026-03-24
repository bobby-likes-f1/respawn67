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
    <Card className="overflow-hidden group cursor-pointer transition-all hover:ring-2 hover:ring-primary bg-abyss-900 border-abyss-700">
      <CardContent className="p-0">
        <AspectRatio ratio={3 / 4}>
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge className="bg-abyss-900/80 hover:bg-abyss-800 transition-colors border border-abyss-700 flex gap-1 items-center text-abyss-50">
              <Star className="w-3 h-3 fill-azure-400 text-azure-400" />
              {rating}
            </Badge>
          </div>
        </AspectRatio>
      </CardContent>
      <CardFooter className="p-3 flex flex-col items-start gap-1">
        <h4 className="font-bold leading-none truncate w-full">{title}</h4>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {platform.join(", ")}
        </p>
      </CardFooter>
    </Card>
  );
}
