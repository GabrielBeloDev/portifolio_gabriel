"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MDXContent } from "@/components/mdx";
import { previewDraft, saveDraft } from "@/lib/actions/drafts";
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
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm transition-colors focus:border-accent";

export function DraftEditor({ draft: initial }: { draft: DraftFields }) {
  const [fields, setFields] = useState(initial);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
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

  const issues = publishReadinessIssues(fields);

  const saveLabel: Record<SaveState, string> = {
    saved: "salvo",
    saving: "salvando…",
    dirty: "alterações pendentes",
    error: "erro ao salvar — edite para tentar de novo",
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/editor"
          className="font-mono text-xs text-accent hover:underline"
        >
          ← drafts
        </Link>
        <span
          role="status"
          className={`font-mono text-xs ${saveState === "error" ? "text-accent" : "text-muted"}`}
        >
          {saveLabel[saveState]}
        </span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
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
          <div className="rounded-sm border border-line p-3">
            <p className="font-mono text-xs tracking-widest text-muted uppercase">
              pronto para publicar?
            </p>
            {issues.length === 0 ? (
              <p className="mt-2 font-mono text-xs text-accent">
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
        </div>

        <div className="min-w-0">
          <p className="font-mono text-xs tracking-widest text-muted uppercase">
            preview
          </p>
          {previewError ? (
            <pre className="mt-4 overflow-x-auto rounded-sm border border-accent p-3 font-mono text-xs text-accent">
              {previewError}
            </pre>
          ) : (
            <article className="mt-4">
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
      </div>
    </div>
  );
}
