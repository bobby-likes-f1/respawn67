import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, Heart, ListPlus, LayoutGrid, Clock } from "lucide-react";
import { type LoaderFunctionArgs, useLoaderData } from "react-router";

const USE_BACKEND_API = false;

const MOCK_GAMES_DB: Record<string, any> = {
  "1": {
    id: "1",
    title: "Outer Wilds",
    developer: "Mobius Digital",
    year: "2019",
    tagline: "WELCOME TO THE SPACE PROGRAM.",
    description: "Welcome to the Space Program! You are the newest recruit of Outer Wilds Ventures, a fledgling space program searching for answers in a strange, constantly evolving solar system. The planets of Outer Wilds are packed with hidden locations that change with the passage of time. Visit an underground city before it's swallowed by sand, or explore the surface of a crumbling planet as it drops into a black hole.",
    bannerImage: "https://images.igdb.com/igdb/image/upload/t_1080p_2x/co65ac.webp",
    posterImage: "https://images.igdb.com/igdb/image/upload/t_1080p/co65ac.webp",
    genres: ["SCI-FI", "ADVENTURE", "MYSTERY"],
    platforms: ["PC", "PS5", "SWITCH"],
    rating: 9.8,
    timeToBeat: 22,
    stats: { views: "842K", lists: "215K", likes: "401K" }
  },
};

export function meta({ data }: any) {
  const title = data?.gameData?.title || "Game Details";
  return [
    { title: `${title} | Respawn67` },
    { name: "description", content: "View game description, reviews, and ratings." },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  let gameData = null;

  if (USE_BACKEND_API) {
    try {
      const res = await fetch(`http://localhost:8080/api/games/${params.id}`);
      if (res.ok) {
        gameData = await res.json();
      }
    } catch (error) {
      console.error("Backend fetch failed. Returning null to UI:", error);
    }
  } else {
    gameData = MOCK_GAMES_DB[params.id as string] || MOCK_GAMES_DB["1"];
  }

  return { gameData, id: params.id };
}

export default function GameDetailsPage() {
  const loaderData = useLoaderData<typeof loader>();
  const uiData = loaderData.gameData || MOCK_GAMES_DB["1"];

  // mock auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isReviewed, setIsReviewed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [inPlaylist, setInPlaylist] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewText, setReviewText] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative pb-24 select-none">
      <div className="w-full h-[45vh] sm:h-[55vh] relative flex items-center justify-center bg-abyss-950 overflow-hidden pointer-events-none">
        <img
          src={uiData.bannerImage}
          alt={`${uiData.title} Banner`}
          className="absolute inset-0 w-full h-full object-cover opacity-30 sm:opacity-40 animate-in fade-in duration-1000 ease-out"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <div className="absolute inset-0 bg-black/20 z-0 mix-blend-multiply"></div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 relative z-10 flex-1 flex flex-col xl:flex-row items-center xl:items-start xl:justify-center -mt-20 sm:-mt-32 gap-8 lg:gap-12 xl:gap-16">

        <div className="flex flex-col items-center shrink-0 w-48 sm:w-56 md:w-64 max-w-full">
          <div className="w-full aspect-[3/4] rounded-lg overflow-hidden border border-abyss-700/50 shadow-2xl bg-abyss-900 shadow-black/80 ring-1 ring-white/10 group cursor-pointer relative">
            <img
              src={uiData.posterImage}
              alt={`${uiData.title} Poster`}
              className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
              <span className="text-azure-50 text-sm font-bold uppercase tracking-widest drop-shadow-md">Trailer</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full px-2 text-[11px] text-muted-foreground mt-4 font-medium tracking-wide">
            <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors" title="Watched/Logged"><Eye className="w-3.5 h-3.5 text-emerald-500" /> {uiData.stats.views}</span>
            <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors" title="Lists"><LayoutGrid className="w-3 h-3 text-blue-400" /> {uiData.stats.lists}</span>
            <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors" title="Likes"><Heart className="w-3 h-3 text-orange-500 fill-orange-500/20" /> {uiData.stats.likes}</span>
          </div>
        </div>

        <div className="flex-[2] flex flex-col pt-0 xl:pt-36 w-full max-w-2xl text-center xl:text-left">
          <div className="flex flex-col mb-4 lg:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight text-azure-50 leading-tight drop-shadow-xl select-text">{uiData.title}</h1>
            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-x-3 gap-y-1 mt-2 md:mt-1 font-sans">
              <span className="text-2xl md:text-[28px] text-muted-foreground/40 font-black tracking-tight drop-shadow-sm leading-none">{uiData.year || uiData.release_year}</span>
              <span className="text-base md:text-lg text-muted-foreground/70 font-semibold tracking-tight">Developed by <span className="text-azure-50 font-bold hover:text-azure-400 cursor-pointer transition-colors border-b border-abyss-700/80 hover:border-azure-400/50 pb-0.5 ml-1">{uiData.developer}</span></span>
            </div>
          </div>

          <h3 className="text-xs uppercase tracking-widest text-muted-foreground/80 font-bold mb-4 text-balance">{uiData.tagline}</h3>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-pretty mb-8">
            {uiData.description}
          </p>

          <div className="flex flex-col gap-5 border-t border-abyss-800/60 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
              <span className="uppercase text-[10px] sm:text-xs tracking-[0.2em] font-bold text-muted-foreground sm:w-20 shrink-0 text-center xl:text-left text-azure-500/80 hover:text-azure-400 cursor-pointer transition-colors">Rating</span>
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
                {uiData.rating && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs py-0.5 px-3 bg-abyss-900 border-abyss-800 text-muted-foreground hover:border-azure-500 hover:text-azure-400 cursor-pointer font-medium shadow-sm transition-colors flex gap-1 items-center">
                    <Star className="w-3 h-3 fill-azure-400 text-azure-400" />
                    {uiData.rating}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-t border-abyss-800/20 sm:border-0 pt-4 sm:pt-0">
              <span className="uppercase text-[10px] sm:text-xs tracking-[0.2em] font-bold text-muted-foreground sm:w-20 shrink-0 text-center xl:text-left text-azure-500/80 hover:text-azure-400 cursor-pointer transition-colors">Time to Beat</span>
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
                {uiData.timeToBeat && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs py-0.5 px-3 bg-abyss-900 border-abyss-800 text-muted-foreground hover:border-azure-500 hover:text-azure-400 cursor-pointer font-medium shadow-sm transition-colors flex gap-1 items-center">
                    <Clock className="w-3 h-3 text-azure-400" />
                    {uiData.timeToBeat}h
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-t border-abyss-800/20 sm:border-0 pt-4 sm:pt-0">
              <span className="uppercase text-[10px] sm:text-xs tracking-[0.2em] font-bold text-muted-foreground sm:w-20 shrink-0 text-center xl:text-left text-azure-500/80 hover:text-azure-400 cursor-pointer transition-colors">Genres</span>
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
                {uiData.genres?.map((g: string) => (
                  <Badge key={g} variant="outline" className="text-[10px] sm:text-xs py-0.5 px-3 bg-abyss-900 border-abyss-800 text-muted-foreground hover:border-azure-500 hover:text-azure-400 cursor-pointer font-medium shadow-sm transition-colors">{g}</Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 border-t border-abyss-800/20 sm:border-0 pt-4 sm:pt-0">
              <span className="uppercase text-[10px] sm:text-xs tracking-[0.2em] font-bold text-muted-foreground sm:w-20 shrink-0 text-center xl:text-left text-azure-500/80 hover:text-azure-400 cursor-pointer transition-colors">Releases</span>
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
                {uiData.platforms?.map((p: string) => (
                  <Badge key={p} variant="outline" className="text-[10px] sm:text-xs py-0.5 px-3 bg-abyss-900 border-abyss-800 text-muted-foreground hover:border-azure-500 hover:text-azure-400 cursor-pointer font-medium shadow-sm transition-colors">{p}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-sm xl:max-w-[280px] 2xl:max-w-[320px] mx-auto xl:mx-0 xl:pt-40 mt-12 xl:mt-0 relative z-20">

          {!isAuthenticated ? (
            <div className="bg-abyss-900 border border-abyss-800 rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] sticky top-24 ring-1 ring-white/5 p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-abyss-950/80 border border-abyss-800 flex items-center justify-center mb-1 shadow-inner">
                <Eye className="w-5 h-5 text-azure-500/80" />
              </div>
              <h3 className="text-lg font-bold text-azure-50 tracking-tight leading-tight">Sign in to log, rate or review</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">Share your gaming experiences, track your backlog, and join the community.</p>

              <div className="w-full flex justify-between gap-3 text-xs mb-3 font-semibold px-2">
                <div className="flex flex-col items-center gap-1.5"><Heart className="w-4 h-4 text-orange-500/80" /> Like</div>
                <div className="flex flex-col items-center gap-1.5"><ListPlus className="w-4 h-4 text-purple-400/80" /> List</div>
                <div className="flex flex-col items-center gap-1.5"><Star className="w-4 h-4 text-azure-400/80" /> Rate</div>
              </div>

              <button
                onClick={() => setIsAuthenticated(true)}
                className="w-full bg-azure-600 hover:bg-azure-500 text-white font-bold py-2.5 rounded-lg transition-colors shadow-[0_0_15px_rgba(56,189,248,0.2)] text-sm active:scale-95"
              >
                Sign In (Demo)
              </button>
            </div>
          ) : (
            <div className="bg-abyss-900 border border-abyss-800 rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] sticky top-24 ring-1 ring-white/5 transition-all">

              <div className="grid grid-cols-3 bg-abyss-950/60 divide-x divide-abyss-800/60">
                <div
                  onClick={() => setIsReviewed(!isReviewed)}
                  className={`p-3 pb-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 group hover:bg-azure-500/10 ${isReviewed ? 'bg-azure-500/5 hover:bg-azure-500/15' : ''}`}
                >
                  <Eye className={`w-7 h-7 stroke-1 pb-1 transition-all duration-300 ${isReviewed ? 'text-azure-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)] scale-[1.15]' : 'text-muted-foreground group-hover:text-azure-400 group-hover:scale-110'}`} />
                  <span className={`text-[9.5px] uppercase font-bold tracking-wider transition-colors ${isReviewed ? 'text-azure-400' : 'text-muted-foreground group-hover:text-azure-400'}`}>{isReviewed ? 'Reviewed' : 'Review'}</span>
                </div>
                <div
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 pb-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 group hover:bg-azure-500/10 ${isLiked ? 'bg-azure-500/5 hover:bg-azure-500/15' : ''}`}
                >
                  <Heart className={`w-7 h-7 stroke-1 pb-1 transition-all duration-300 ${isLiked ? 'text-azure-400 fill-azure-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)] scale-[1.15]' : 'text-muted-foreground group-hover:text-azure-400 group-hover:scale-110'}`} />
                  <span className={`text-[9.5px] uppercase font-bold tracking-wider transition-colors ${isLiked ? 'text-azure-400' : 'text-muted-foreground group-hover:text-azure-400'}`}>{isLiked ? 'Liked' : 'Like'}</span>
                </div>
                <div
                  onClick={() => setInPlaylist(!inPlaylist)}
                  className={`p-3 pb-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 group hover:bg-azure-500/10 ${inPlaylist ? 'bg-azure-500/5 hover:bg-azure-500/15' : ''}`}
                >
                  <ListPlus className={`w-7 h-7 stroke-1 pb-1 transition-all duration-300 ${inPlaylist ? 'text-azure-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)] scale-[1.15]' : 'text-muted-foreground group-hover:text-azure-400 group-hover:scale-110'}`} />
                  <span className={`text-[9.5px] uppercase font-bold tracking-wider transition-colors ${inPlaylist ? 'text-azure-400' : 'text-muted-foreground group-hover:text-azure-400'}`}>{inPlaylist ? 'In Playlist' : 'Playlist'}</span>
                </div>
              </div>

              <div className="px-4 py-6 border-t border-abyss-800/60 flex flex-col items-center gap-3 bg-abyss-900/60 backdrop-blur-sm shadow-inner group/rater">
                <div className="flex justify-between w-full max-w-[220px]">
                  <span className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] group-hover/rater:text-azure-400 transition-colors">Rate</span>
                </div>

                <div
                  className="flex items-center gap-[2px] justify-center relative"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map(index => {
                    const valLeft = index * 2 - 1;
                    const valRight = index * 2;

                    const currentScore = hoverRating || rating;
                    const isFull = currentScore >= valRight;
                    const isHalf = currentScore === valLeft;

                    return (
                      <div key={index} className="relative w-9 h-9 sm:w-10 sm:h-10 cursor-pointer hover:scale-110 transition-transform duration-200">
                        <Star className="absolute inset-0 w-full h-full fill-abyss-800 text-abyss-800/50 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />

                        <div className={`absolute top-0 left-0 h-full overflow-hidden pointer-events-none transition-all duration-150 ${isHalf ? 'w-1/2' : isFull ? 'w-full' : 'w-0'}`}>
                          <Star className="w-9 h-9 sm:w-10 sm:h-10 fill-azure-400 text-azure-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                        </div>

                        <div
                          className="absolute top-0 left-0 w-1/2 h-full z-10"
                          onMouseEnter={() => setHoverRating(valLeft)}
                          onClick={() => { setRating(rating === valLeft ? 0 : valLeft); setIsReviewed(true); }}
                        />
                        <div
                          className="absolute top-0 right-0 w-1/2 h-full z-10"
                          onMouseEnter={() => setHoverRating(valRight)}
                          onClick={() => { setRating(rating === valRight ? 0 : valRight); setIsReviewed(true); }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col text-[13px] font-semibold bg-abyss-900/60 divide-y divide-abyss-800/60 mt-0.5 relative transition-all duration-300">
                {isReviewing ? (
                  <div className="p-3 bg-abyss-950/40 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] uppercase font-bold text-azure-400 tracking-wider">Log Activity</span>
                      <span className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString()}</span>
                    </div>
                    <textarea
                      autoFocus
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Write your review or thoughts..."
                      className="w-full bg-abyss-900/80 border border-abyss-700/80 rounded-md p-3 text-sm text-azure-50 placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:border-azure-500 focus:ring-1 focus:ring-azure-500 min-h-[96px] shadow-inner"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsReviewing(false)}
                        className="flex-1 py-2 rounded-md bg-abyss-800 hover:bg-abyss-700 text-muted-foreground hover:text-white transition-colors text-xs uppercase tracking-wider font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (reviewText.trim()) {
                            setIsReviewed(true);
                          }
                          setIsReviewing(false);
                          // save toast?
                        }}
                        className="flex-[2] py-2 rounded-md bg-azure-600 hover:bg-azure-500 text-white transition-colors shadow-[0_0_8px_rgba(56,189,248,0.4)] text-xs uppercase tracking-wider font-bold"
                      >
                        Save Log
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={() => setIsReviewing(true)}
                      className={`py-4 px-4 text-center cursor-pointer transition-colors border-t border-abyss-800/60 flex items-center justify-center gap-2 ${reviewText ? "text-azure-400 hover:bg-azure-500/10" : "text-muted-foreground/80 hover:bg-abyss-800/80 hover:text-white"}`}
                    >
                      {reviewText ? "Edit your review..." : (isReviewed ? "Write a review..." : "Review or log...")}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 px-2 max-w-[280px] mx-auto xl:mx-0 hidden md:block">
            <div className="flex justify-between items-baseline border-b border-abyss-800/60 pb-1.5 mb-3">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Ratings</span>
              <span className="text-[10px] text-muted-foreground">21K FANS</span>
            </div>
            <div className="flex items-end h-8 gap-[2px]">
              <div className="flex-1 bg-abyss-800/80 rounded-t-sm hover:bg-abyss-600 cursor-pointer transition-colors" style={{ height: "15%" }}></div>
              <div className="flex-1 bg-abyss-800/80 rounded-t-sm hover:bg-abyss-600 cursor-pointer transition-colors" style={{ height: "20%" }}></div>
              <div className="flex-1 bg-abyss-800/80 rounded-t-sm hover:bg-abyss-600 cursor-pointer transition-colors" style={{ height: "50%" }}></div>
              <div className="flex-1 bg-azure-500/80 rounded-t-sm hover:bg-azure-400 cursor-pointer transition-colors shadow-[0_-2px_8px_rgba(59,130,246,0.3)]" style={{ height: "100%" }}></div>
              <div className="flex-1 bg-abyss-800/80 rounded-t-sm hover:bg-abyss-600 cursor-pointer transition-colors" style={{ height: "75%" }}></div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
