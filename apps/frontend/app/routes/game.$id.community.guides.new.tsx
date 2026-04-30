import { type FormEvent, useState } from "react";
import { Link, type LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router";
import { ArrowLeft, BookOpen, Eye, PenLine } from "lucide-react";
import { createGuide, getGameById, type ApiGame } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { changeImageSize, toUiGameData } from "@/routes/game.$id";

export function meta({ data }: any) {
  const title = data?.gameData?.title;
  return [{ title: title ? `Write Guide for ${title} | Respawn67` : "Write Guide | Respawn67" }];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id ?? "1";
  const gameData = await getGameById(id).catch(() => null);
  return { id, gameData };
}

function renderFormattedPreview(content: string) {
  return content.split("\n\n").map((block, index) => {
    if (block.startsWith("### ")) {
      return (
        <h3 key={index} className="mt-5 text-lg font-black tracking-tight text-azure-50">
          {block.replace(/^###\s+/, "")}
        </h3>
      );
    }

    if (block.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-6 text-xl font-black tracking-tight text-azure-50">
          {block.replace(/^##\s+/, "")}
        </h2>
      );
    }

    if (block.startsWith("- ")) {
      return (
        <ul key={index} className="list-inside list-disc space-y-2 text-abyss-100">
          {block.split("\n").map((item, itemIndex) => (
            <li key={itemIndex}>{item.replace(/^-\s+/, "")}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={index} className="leading-7 text-abyss-100">
        {block}
      </p>
    );
  });
}

export default function NewGuidePage() {
  const { id, gameData } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const uiData = toUiGameData(gameData as ApiGame | null, id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!storedUser) {
      setError("You need to log in before publishing a guide.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Give your guide a title and some actual guidance.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const created = await createGuide(id, {
        title: title.trim(),
        content: content.trim(),
      });
      navigate(`/games/${id}/community/guides/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish guide");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-abyss-800 bg-abyss-950">
        <img
          src={changeImageSize(gameData?.cover_image_url, "720p")}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,rgba(3,5,9,0.92)_48%,rgba(3,5,9,0.68)_100%)]" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-10 sm:px-6 lg:py-14">
          <Link
            to={`/games/${id}/community`}
            className="inline-flex items-center gap-2 text-sm font-bold text-azure-200 transition hover:text-azure-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Community
          </Link>
          <div className="flex items-start gap-5">
            <img
              src={uiData.posterImage}
              alt={`${uiData.title} cover`}
              className="hidden aspect-[3/4] w-28 rounded-lg border border-abyss-700 object-cover shadow-xl sm:block"
            />
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-azure-400/85">
                New Guide
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-azure-50">
                Write for {uiData.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Put the useful stuff up front: routes, builds, boss prep, or anything
                that makes this game easier to navigate for the next player.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-8 sm:px-6">
        <section className="relative overflow-hidden rounded-lg border border-abyss-800 bg-abyss-900/70 p-4 ring-1 ring-white/5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(26,133,255,0.16),transparent_30%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-azure-300">
                <BookOpen className="h-4 w-4" />
                Formatting Tips
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Use a few simple markers to make longer guides easier to scan.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[760px] lg:grid-cols-4">
              <div className="rounded-md border border-abyss-800 bg-abyss-950/70 p-3">
                <p className="font-mono text-[11px] font-bold text-azure-300">## Section</p>
                <h3 className="mt-2 text-lg font-black tracking-tight text-azure-50">
                  Major Route Step
                </h3>
              </div>
              <div className="rounded-md border border-abyss-800 bg-abyss-950/70 p-3">
                <p className="font-mono text-[11px] font-bold text-azure-300">### Subhead</p>
                <h4 className="mt-2 text-sm font-black tracking-tight text-azure-50">
                  Build Warning
                </h4>
              </div>
              <div className="rounded-md border border-abyss-800 bg-abyss-950/70 p-3">
                <p className="font-mono text-[11px] font-bold text-azure-300">- Bullet</p>
                <ul className="mt-2 space-y-1 text-xs text-abyss-100">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-azure-400" />
                    <span>Upgrade weapon first</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-md border border-abyss-800 bg-abyss-950/70 p-3">
                <p className="font-mono text-[11px] font-bold text-azure-300">Blank line</p>
                <div className="mt-2 space-y-2 text-xs leading-5 text-abyss-100">
                  <p>First paragraph.</p>
                  <p>Next paragraph.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(420px,0.82fr)]">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-5 ring-1 ring-white/5 sm:p-6"
          >
            {!storedUser ? (
              <div className="mb-5 rounded-lg border border-abyss-700 bg-abyss-950/60 p-4 text-sm text-muted-foreground">
                You need an account before you can publish a guide.{" "}
                <Link to="/login" className="font-bold text-azure-300 hover:text-azure-200">
                  Log in
                </Link>
                .
              </div>
            ) : null}

            {error ? (
              <div className="mb-5 rounded-lg border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="guide-title"
                  className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-azure-300"
                >
                  Guide Title
                </label>
                <input
                  id="guide-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="First ten hours route, spoiler-light build path, etc."
                  className="w-full rounded-lg border border-abyss-700 bg-abyss-950/70 px-4 py-3 text-sm text-azure-50 outline-none transition placeholder:text-muted-foreground focus:border-azure-500/60"
                />
              </div>

              <div>
                <label
                  htmlFor="guide-content"
                  className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-azure-300"
                >
                  Guide Content
                </label>
                <textarea
                  id="guide-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={"Share your route, priorities, warnings, or setup advice.\n\nUse ## for sections, ### for smaller headings, and - for bullet points."}
                  rows={24}
                  className="min-h-[560px] w-full resize-y rounded-lg border border-abyss-700 bg-abyss-950/70 px-4 py-3 text-sm leading-7 text-azure-50 outline-none transition placeholder:text-muted-foreground focus:border-azure-500/60"
                />
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{content.length}/5000</span>
                  {content.length < 50 ? (
                    <span>{50 - content.length} more characters makes a stronger guide</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving || !storedUser}
                className="inline-flex items-center gap-2 rounded-lg bg-azure-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-azure-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PenLine className="h-4 w-4" />
                {isSaving ? "Publishing..." : "Publish Guide"}
              </button>
              <Link
                to={`/games/${id}/community`}
                className="rounded-lg border border-abyss-700 bg-abyss-950/80 px-4 py-2 text-sm font-bold text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
              >
                Cancel
              </Link>
            </div>
          </form>

          <section className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-5 ring-1 ring-white/5 sm:p-6 xl:sticky xl:top-24 xl:self-start">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-azure-300">
              <Eye className="h-4 w-4" />
              Preview
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-azure-50">
              {title || "Guide Title"}
            </h2>
            <div className="mt-4 min-h-[610px] max-h-[calc(100vh-190px)] space-y-4 overflow-auto rounded-lg border border-abyss-800 bg-abyss-950/60 p-5 text-sm">
              {content.trim() ? (
                renderFormattedPreview(content)
              ) : (
                <p className="text-muted-foreground">
                  Your formatted guide preview will appear here.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
