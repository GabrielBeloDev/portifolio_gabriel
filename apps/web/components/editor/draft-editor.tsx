"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MDXContent } from "@/components/mdx";
import {
  generateShareToken,
  previewDraft,
  revokeShareToken,
  saveDraft,
} from "@/lib/actions/drafts";
import { publishReadinessIssues } from "@/lib/validation/draft";

type DraftFields = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags: string;
  body: string;
};

type SaveState = "saved" | "saving" | "dirty" | "error";

const AUTOSAVE_DELAY_MS = 1_500;

const fieldClasses =
  "w-full rounded-sm border border-line bg-background-2 px-3 py-2 text-sm transition-colors focus:border-accent";

const panelClasses =
  "min-w-0 overflow-hidden rounded-md border border-line bg-surface";

const panelTitleClasses =
  "flex items-center gap-2 border-b border-line bg-background-2 px-4 py-2.5 font-mono text-xs text-faint";

const saveLabel: Record<SaveState, string> = {
  saved: "salvo",
  saving: "salvando…",
  dirty: "alterações pendentes",
  error: "erro ao salvar — edite para tentar de novo",
};

const saveTextTone: Record<SaveState, string> = {
  saved: "text-ok",
  saving: "text-accent",
  dirty: "text-accent",
  error: "text-danger",
};

const saveDotTone: Record<SaveState, string> = {
  saved: "bg-ok",
  saving: "bg-accent-fill",
  dirty: "bg-accent-fill",
  error: "bg-danger",
};

// window.location.origin never changes during a session, so subscribing is a no-op;
// the empty server snapshot keeps SSR and the first client render identical
const subscribeToNothing = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => "";

export function DraftEditor({
  draft: initial,
  shareToken: initialShareToken,
}: {
  draft: DraftFields;
  shareToken: string | null;
}) {
  const [fields, setFields] = useState(initial);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const origin = useSyncExternalStore(
    subscribeToNothing,
    getOrigin,
    getServerOrigin,
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function update(patch: Partial<DraftFields>) {
    const next = { ...fields, ...patch };
    setFields(next);
    setSaveState("dirty");

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveState("saving");
      void saveDraft(next).then((result) => {
        setSaveState(result.ok ? "saved" : "error");
      });
    }, AUTOSAVE_DELAY_MS);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // Preview follows the body with its own debounce, hitting the real MDX
  // pipeline server-side so drafts render exactly like published posts
  useEffect(() => {
    const handle = setTimeout(() => {
      void previewDraft({ body: fields.body }).then((result) => {
        if (result.ok) {
          setPreviewCode(result.data.code);
          setPreviewError(null);
        } else {
          setPreviewError(result.error);
        }
      });
    }, 800);
    return () => clearTimeout(handle);
  }, [fields.body]);

  async function handleGenerateShareLink() {
    const result = await generateShareToken({ id: fields.id });
    if (!result.ok) {
      setShareError(result.error);
      return;
    }
    setShareToken(result.data.shareToken);
    setShareUrlCopied(false);
    setShareError(null);
  }

  async function handleRevokeShareLink() {
    const result = await revokeShareToken({ id: fields.id });
    if (!result.ok) {
      setShareError(result.error);
      return;
    }
    setShareToken(null);
    setShareUrlCopied(false);
    setShareError(null);
  }

  async function handleCopyShareLink(shareUrl: string) {
    await navigator.clipboard.writeText(shareUrl);
    setShareUrlCopied(true);
  }

  const issues = publishReadinessIssues(fields);
  const isModified = saveState !== "saved";
  const draftFileName = `${fields.slug || "novo-post"}.mdx`;
  const shareUrl =
    shareToken === null ? null : `${origin}/rascunho/${shareToken}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-surface px-3 py-2 font-mono text-xs">
        <Link href="/admin/editor" className="text-link hover:underline">
          ← drafts
        </Link>
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className={`size-1.5 rounded-full ${saveDotTone[saveState]}`}
          />
          <span role="status" className={saveTextTone[saveState]}>
            {saveLabel[saveState]}
          </span>
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section aria-label="draft" className={panelClasses}>
          <p className={panelTitleClasses}>
            <span aria-hidden className="size-2 rounded-full bg-accent-fill" />
            {draftFileName}
            {isModified && (
              <span aria-hidden className="text-accent">
                ●
              </span>
            )}
          </p>
          <div className="flex flex-col gap-4 p-4">
            <input
              aria-label="título"
              value={fields.title}
              onChange={(event) => update({ title: event.target.value })}
              placeholder="título"
              className={`${fieldClasses} text-lg font-semibold`}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                aria-label="slug"
                value={fields.slug}
                onChange={(event) => update({ slug: event.target.value })}
                placeholder="slug-do-post"
                className={`${fieldClasses} font-mono text-xs`}
              />
              <input
                aria-label="tags"
                value={fields.tags}
                onChange={(event) => update({ tags: event.target.value })}
                placeholder="tags, separadas, por vírgula"
                className={`${fieldClasses} font-mono text-xs`}
              />
            </div>
            <textarea
              aria-label="resumo"
              value={fields.summary}
              onChange={(event) => update({ summary: event.target.value })}
              placeholder="resumo (aparece na lista e no card)"
              rows={2}
              className={fieldClasses}
            />
            <textarea
              aria-label="corpo em MDX"
              value={fields.body}
              onChange={(event) => update({ body: event.target.value })}
              placeholder={"## Escreva em MDX\n\n```ts\nconst codigo = true;\n```\n\n```mermaid\ngraph LR; A-->B\n```"}
              rows={24}
              className={`${fieldClasses} min-h-[50vh] resize-y font-mono text-sm leading-relaxed`}
            />
            <div className="rounded-sm border border-line bg-background-2 p-3">
              <p className="font-mono text-xs tracking-widest text-faint uppercase">
                pronto para publicar?
              </p>
              {issues.length === 0 ? (
                <p className="mt-2 font-mono text-xs text-ok">
                  ✓ frontmatter válido — publicar chega na próxima fase
                </p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1 font-mono text-xs text-muted">
                  {issues.map((issue) => (
                    <li key={issue}>• {issue}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-sm border border-line bg-background-2 p-3">
              <p className="font-mono text-xs tracking-widest text-faint uppercase">
                link de revisão
              </p>
              {shareUrl === null ? (
                <button
                  type="button"
                  onClick={handleGenerateShareLink}
                  className="mt-2 rounded-sm border border-line bg-surface px-3 py-1.5 font-mono text-xs text-link transition-colors hover:border-accent"
                >
                  gerar link de revisão
                </button>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    aria-label="URL do link de revisão"
                    readOnly
                    value={shareUrl}
                    className="min-w-0 flex-1 rounded-sm border border-line bg-surface px-3 py-1.5 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyShareLink(shareUrl)}
                    className="rounded-sm border border-line bg-surface px-3 py-1.5 font-mono text-xs text-link transition-colors hover:border-accent"
                  >
                    {shareUrlCopied ? "copiado ✓" : "copiar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRevokeShareLink}
                    className="rounded-sm border border-line bg-surface px-3 py-1.5 font-mono text-xs text-danger transition-colors hover:border-danger"
                  >
                    revogar
                  </button>
                </div>
              )}
              {shareError !== null && (
                <p className="mt-2 font-mono text-xs text-danger">
                  {shareError}
                </p>
              )}
            </div>
          </div>
        </section>

        <section aria-label="preview" className={panelClasses}>
          <p className={panelTitleClasses}>
            <span aria-hidden className="size-2 rounded-full bg-ok" />
            preview
          </p>
          <div className="p-4">
            {previewError ? (
              <pre className="overflow-x-auto rounded-sm border border-danger p-3 font-mono text-xs text-danger">
                {previewError}
              </pre>
            ) : (
              <article>
                {fields.title && (
                  <h1 className="text-2xl leading-tight font-semibold">
                    {fields.title}
                  </h1>
                )}
                <div className="prose mt-6">
                  {previewCode !== null && <MDXContent code={previewCode} />}
                </div>
              </article>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
