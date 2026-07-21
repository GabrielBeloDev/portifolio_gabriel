"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ClipboardEvent,
  type DragEvent,
} from "react";
import { z } from "zod";
import { AiAssistant } from "@/components/editor/ai-assistant";
import { DeleteDraftButton } from "@/components/editor/delete-draft-button";
import { RecordButton } from "@/components/editor/record-button";
import { MDXContent } from "@/components/mdx";
import {
  generateShareToken,
  previewDraft,
  revokeShareToken,
  saveDraft,
} from "@/lib/actions/drafts";
import { publishedPosts } from "@/lib/content";
import { draftToMdx } from "@/lib/draft-mdx";
import {
  imageUploadPlaceholder,
  insertText,
  removeImagePlaceholder,
  resolveImagePlaceholder,
  type TextEdit,
} from "@/lib/editor-text";
import {
  publishDiagnostics,
  type DiagnosticSeverity,
} from "@/lib/validation/draft";

type DraftFields = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags: string;
  body: string;
};

type SaveState = "saved" | "saving" | "dirty" | "error";

type PreviewViewport = "desktop" | "mobile";

const publishedSlugs = publishedPosts.map((post) => post.slug);

const AUTOSAVE_DELAY_MS = 1_500;
const COPY_FEEDBACK_MS = 2_000;
const READING_WORDS_PER_MINUTE = 200;

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

const diagnosticIcon: Record<DiagnosticSeverity, string> = {
  error: "✕",
  warning: "▲",
};

const diagnosticIconTone: Record<DiagnosticSeverity, string> = {
  error: "text-danger",
  warning: "text-accent",
};

const viewportButtonClasses =
  "rounded-sm border px-2 py-0.5 font-mono text-xs transition-colors";

const activeViewportClasses = "border-accent text-accent";

const inactiveViewportClasses =
  "border-transparent text-faint hover:text-muted";

const mobileFrameClasses =
  "mx-auto w-full max-w-[390px] rounded-xl border border-line px-4 py-6";

// window.location.origin never changes during a session, so subscribing is a no-op;
// the empty server snapshot keeps SSR and the first client render identical
const subscribeToNothing = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => "";

const uploadResponseSchema = z.object({ url: z.string() });
const uploadErrorSchema = z.object({ error: z.string() });

function firstImageFromTransfer(transfer: DataTransfer): File | null {
  const { items, files } = transfer;
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item && item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file !== null) return file;
    }
  }
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (file && file.type.startsWith("image/")) return file;
  }
  return null;
}

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
  const [mdxCopied, setMdxCopied] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [previewViewport, setPreviewViewport] =
    useState<PreviewViewport>("desktop");
  const origin = useSyncExternalStore(
    subscribeToNothing,
    getOrigin,
    getServerOrigin,
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Latest-value refs so the mount-only Cmd+S listener never reads stale state
  const fieldsRef = useRef(fields);
  const saveStateRef = useRef(saveState);
  useEffect(() => {
    fieldsRef.current = fields;
    saveStateRef.current = saveState;
  }, [fields, saveState]);

  const commitSave = useCallback((next: DraftFields) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    void saveDraft(next).then((result) => {
      setSaveState(result.ok ? "saved" : "error");
    });
  }, []);

  function update(patch: Partial<DraftFields>) {
    const next = { ...fields, ...patch };
    setFields(next);
    setSaveState("dirty");

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => commitSave(next), AUTOSAVE_DELAY_MS);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (copyFeedbackTimer.current) clearTimeout(copyFeedbackTimer.current);
    };
  }, []);

  useEffect(() => {
    function handleSaveShortcut(event: KeyboardEvent) {
      const isSaveShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s";
      if (!isSaveShortcut) return;
      // Always swallow the browser save dialog, even with nothing to flush
      event.preventDefault();
      const hasPendingChanges =
        saveStateRef.current === "dirty" || saveStateRef.current === "error";
      if (hasPendingChanges) commitSave(fieldsRef.current);
    }
    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [commitSave]);

  const isModified = saveState !== "saved";

  useEffect(() => {
    if (!isModified) return;
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isModified]);

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

  function appendToBody(text: string) {
    const hasBody = fields.body.trim() !== "";
    update({ body: hasBody ? `${fields.body}\n\n${text}` : text });
  }

  function applyBodyEdit(edit: TextEdit) {
    update({ body: edit.value });
    // The controlled textarea repaints on the next frame — restore the caret after it
    requestAnimationFrame(() => {
      const textarea = bodyTextareaRef.current;
      if (textarea === null) return;
      textarea.focus();
      textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd);
    });
  }

  function failImageUpload(placeholder: string, payload: unknown) {
    const cleared = removeImagePlaceholder(fieldsRef.current.body, placeholder);
    if (cleared !== null) applyBodyEdit(cleared);
    const parsedError = uploadErrorSchema.safeParse(payload);
    setImageUploadError(
      parsedError.success ? parsedError.data.error : "falha ao enviar imagem",
    );
  }

  async function uploadImage(file: File) {
    const placeholder = imageUploadPlaceholder(crypto.randomUUID());
    const textarea = bodyTextareaRef.current;
    const value = textarea?.value ?? fields.body;
    const selectionStart = textarea?.selectionStart ?? value.length;
    const selectionEnd = textarea?.selectionEnd ?? value.length;

    setImageUploadError(null);
    applyBodyEdit(insertText(value, selectionStart, selectionEnd, placeholder));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload: unknown = await response.json();
      const parsed = uploadResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) {
        failImageUpload(placeholder, payload);
        return;
      }
      const resolved = resolveImagePlaceholder(
        fieldsRef.current.body,
        placeholder,
        parsed.data.url,
      );
      if (resolved !== null) applyBodyEdit(resolved);
    } catch {
      failImageUpload(placeholder, null);
    }
  }

  function handleBodyPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const image = firstImageFromTransfer(event.clipboardData);
    if (image === null) return;
    event.preventDefault();
    void uploadImage(image);
  }

  function handleBodyDrop(event: DragEvent<HTMLTextAreaElement>) {
    const image = firstImageFromTransfer(event.dataTransfer);
    if (image === null) return;
    event.preventDefault();
    void uploadImage(image);
  }

  async function handleCopyMdx() {
    await navigator.clipboard.writeText(draftToMdx(fields));
    setMdxCopied(true);
    if (copyFeedbackTimer.current) clearTimeout(copyFeedbackTimer.current);
    copyFeedbackTimer.current = setTimeout(
      () => setMdxCopied(false),
      COPY_FEEDBACK_MS,
    );
  }

  const diagnostics = publishDiagnostics(fields, publishedSlugs);
  const hasErrors = diagnostics.some(
    (diagnostic) => diagnostic.severity === "error",
  );
  const isMobilePreview = previewViewport === "mobile";
  const draftFileName = `${fields.slug || "novo-post"}.mdx`;
  const wordCount = fields.body.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(
    1,
    Math.round(wordCount / READING_WORDS_PER_MINUTE),
  );
  const showEmptyPreviewHint = fields.body.trim() === "";
  const shareUrl =
    shareToken === null ? null : `${origin}/rascunho/${shareToken}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-surface px-3 py-2 font-mono text-xs">
        <span className="flex items-center gap-4">
          <Link href="/admin/editor" className="text-link hover:underline">
            ← drafts
          </Link>
          <DeleteDraftButton draftId={fields.id} />
        </span>
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
            <span className="ml-auto flex items-center gap-3">
              <RecordButton onTranscribed={appendToBody} />
              <span>
                {wordCount} palavras
                {wordCount > 0 && ` · ~${readingMinutes} min de leitura`}
              </span>
            </span>
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
              ref={bodyTextareaRef}
              aria-label="corpo em MDX"
              value={fields.body}
              onChange={(event) => update({ body: event.target.value })}
              onPaste={handleBodyPaste}
              onDrop={handleBodyDrop}
              placeholder={
                "## Escreva em MDX\n\n```ts\nconst codigo = true;\n```\n\n```mermaid\ngraph LR; A-->B\n```"
              }
              rows={24}
              className={`${fieldClasses} min-h-[50vh] resize-y font-mono text-sm leading-relaxed`}
            />
            {imageUploadError !== null && (
              <p role="alert" className="font-mono text-xs text-danger">
                {imageUploadError}
              </p>
            )}
            <div className="rounded-sm border border-line bg-background-2 p-3">
              <p className="font-mono text-xs tracking-widest text-faint uppercase">
                pronto para publicar?
              </p>
              {!hasErrors && (
                <div className="mt-2 flex flex-col items-start gap-2">
                  <p className="font-mono text-xs text-ok">
                    ✓ frontmatter válido
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyMdx}
                    className="rounded-sm border border-line bg-surface px-3 py-1.5 font-sans text-xs font-medium text-link transition-colors hover:border-accent"
                  >
                    {mdxCopied ? "copiado ✓" : "copiar .mdx"}
                  </button>
                  <p className="font-mono text-xs text-faint">
                    cole em content/posts/{fields.slug}.mdx e commite —
                    publicar direto daqui chega na próxima fase
                  </p>
                </div>
              )}
              {diagnostics.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1 font-mono text-xs text-muted">
                  {diagnostics.map((diagnostic) => (
                    <li
                      key={diagnostic.message}
                      className="flex items-start gap-2"
                    >
                      <span
                        aria-hidden
                        className={diagnosticIconTone[diagnostic.severity]}
                      >
                        {diagnosticIcon[diagnostic.severity]}
                      </span>
                      {diagnostic.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <AiAssistant
              title={fields.title}
              summary={fields.summary}
              body={fields.body}
              bodyRef={bodyTextareaRef}
              onInsert={appendToBody}
            />
            <div className="rounded-sm border border-line bg-background-2 p-3">
              <p className="font-mono text-xs tracking-widest text-faint uppercase">
                link de revisão
              </p>
              {shareUrl === null ? (
                <button
                  type="button"
                  onClick={handleGenerateShareLink}
                  className="mt-2 rounded-sm border border-line bg-surface px-3 py-1.5 font-sans text-xs font-medium text-link transition-colors hover:border-accent"
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
                    className="rounded-sm border border-line bg-surface px-3 py-1.5 font-sans text-xs font-medium text-link transition-colors hover:border-accent"
                  >
                    {shareUrlCopied ? "copiado ✓" : "copiar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRevokeShareLink}
                    className="rounded-sm border border-line bg-surface px-3 py-1.5 font-sans text-xs font-medium text-danger transition-colors hover:border-danger"
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
            <span className="ml-auto flex items-center gap-1">
              <button
                type="button"
                aria-pressed={!isMobilePreview}
                onClick={() => setPreviewViewport("desktop")}
                className={`${viewportButtonClasses} ${
                  isMobilePreview
                    ? inactiveViewportClasses
                    : activeViewportClasses
                }`}
              >
                desktop
              </button>
              <button
                type="button"
                aria-pressed={isMobilePreview}
                onClick={() => setPreviewViewport("mobile")}
                className={`${viewportButtonClasses} ${
                  isMobilePreview
                    ? activeViewportClasses
                    : inactiveViewportClasses
                }`}
              >
                mobile
              </button>
            </span>
          </p>
          <div className="p-4">
            <div
              data-testid="preview-viewport"
              className={isMobilePreview ? mobileFrameClasses : undefined}
            >
              {previewError ? (
                <pre className="overflow-x-auto rounded-sm border border-danger p-3 font-mono text-xs text-danger">
                  {previewError}
                </pre>
              ) : showEmptyPreviewHint ? (
                <p className="font-mono text-sm text-faint">
                  // escreva MDX à esquerda — headings, código com highlight e
                  blocos mermaid viram diagrama aqui
                </p>
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
          </div>
        </section>
      </div>
    </div>
  );
}
