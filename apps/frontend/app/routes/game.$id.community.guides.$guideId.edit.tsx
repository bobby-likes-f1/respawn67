import { type FormEvent, useState } from "react";
import { Link, type LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router";
import { ArrowLeft, PenLine } from "lucide-react";
import { getGameById, getGameGuides, updateGuide, type ApiGame } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { changeImageSize, toUiGameData } from "@/routes/game.$id";

export function meta({ data }: any) {
  const guide = data?.guide;
  return [{ title: guide?.title ? `Edit ${guide.title} | Respawn67` : "Edit Guide | Respawn67" }];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id ?? "1";
  const guideId = Number(params.guideId ?? "0");
  const [gameData, guides] = await Promise.all([
    getGameById(id).catch(() => null),
    getGameGuides(id).catch(() => []),
  ]);
  const guide = guides.find((entry) => entry.id === guideId) ?? null;
  return { id, guideId, gameData, guide };
}

export default function EditGuidePage() {
  const { id, guide, gameData } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const uiData = toUiGameData(gameData as ApiGame | null, id);

  const [title, setTitle] = useState(guide?.title ?? "");
  const [content, setContent] = useState(guide?.content ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!guide) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center px-4 py-12 sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-azure-400/85">
          Guide Missing
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-azure-50">
          There is nothing here to edit.
        </h1>
        <Link
          to={`/games/${id}/community`}
          className="mt-6 rounded-lg bg-azure-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-azure-500"
        >
          Return to Community
        </Link>
      </div>
    );
  }

  if (!storedUser || storedUser.id !== guide.user_id) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center px-4 py-12 sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-azure-400/85">
          Guide Ownership
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-azure-50">
          Only the guide author can edit this.
        </h1>
        <Link
          to={`/games/${id}/community/guides/${guide.id}`}
          className="mt-6 rounded-lg bg-azure-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-azure-500"
        >
          Open Guide
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Give your guide a title and some actual guidance.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await updateGuide(id, guide.id, {
        title: title.trim(),
        content: content.trim(),
      });
      navigate(`/games/${id}/community/guides/${guide.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update guide");
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
            to={`/games/${id}/community/guides/${guide.id}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-azure-200 transition hover:text-azure-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Guide
          </Link>
          <div className="flex items-start gap-5">
            <img
              src={uiData.posterImage}
              alt={`${uiData.title} cover`}
              className="hidden aspect-[3/4] w-28 rounded-lg border border-abyss-700 object-cover shadow-xl sm:block"
            />
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-azure-400/85">
                Edit Guide
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-azure-50">
                {guide.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Tighten the route, add context, or clean up the advice now that more
                players have run through it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-abyss-800 bg-abyss-900/70 p-5 ring-1 ring-white/5 sm:p-6"
        >
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
                className="w-full rounded-lg border border-abyss-700 bg-abyss-950/70 px-4 py-3 text-sm text-azure-50 outline-none transition focus:border-azure-500/60"
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
                rows={14}
                className="w-full rounded-lg border border-abyss-700 bg-abyss-950/70 px-4 py-3 text-sm leading-6 text-azure-50 outline-none transition focus:border-azure-500/60"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-azure-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-azure-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PenLine className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              to={`/games/${id}/community/guides/${guide.id}`}
              className="rounded-lg border border-abyss-700 bg-abyss-950/80 px-4 py-2 text-sm font-bold text-azure-100 transition hover:border-azure-500/60 hover:bg-azure-500/10"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
