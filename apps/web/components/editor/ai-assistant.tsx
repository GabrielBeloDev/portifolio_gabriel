"use client";

import { useState, type RefObject } from "react";
import {
  generateOutline,
  generatePromotion,
  improveText,
  suggestTopics,
  type AiTextResult,
} from "@/lib/actions/ai";
import { splitPromotionResult, type PromotionBlock } from "@/lib/ai-prompts";

type AssistantTask = "pautas" | "outline" | "melhorar" | "divulgar";

const assistantButtonClasses =
  "rounded-sm border border-line bg-surface px-3 py-1.5 font-mono text-xs text-link transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50";

export function AiAssistant({
  title,
  summary,
  body,
  bodyRef,
  onInsert,
}: {
  title: string;
  summary: string;
  body: string;
  bodyRef: RefObject<HTMLTextAreaElement | null>;
  onInsert: (text: string) => void;
}) {
  const [pendingTask, setPendingTask] = useState<AssistantTask | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [promotionBlocks, setPromotionBlocks] = useState<
    PromotionBlock[] | null
  >(null);
  const [copiedBlockLabel, setCopiedBlockLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTask(
    task: AssistantTask,
    request: () => Promise<AiTextResult>,
  ) {
    setPendingTask(task);
    setError(null);
    setResult(null);
    setPromotionBlocks(null);
    setCopiedBlockLabel(null);
    const response = await request();
    setPendingTask(null);
    if (!response.ok) {
      setError(response.error);
      return;
    }
    if (task === "divulgar") {
      setPromotionBlocks(splitPromotionResult(response.text));
    } else {
      setResult(response.text);
    }
  }

  function handleImproveSelection() {
    const textarea = bodyRef.current;
    const selection =
      textarea === null
        ? ""
        : textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
    if (selection.trim() === "") {
      setError("selecione um trecho do corpo para melhorar");
      return;
    }
    void runTask("melhorar", () => improveText({ text: selection }));
  }

  async function handleCopyBlock(block: PromotionBlock) {
    await navigator.clipboard.writeText(block.content);
    setCopiedBlockLabel(block.label);
  }

  const isPending = pendingTask !== null;

  return (
    <details className="rounded-sm border border-line bg-background-2 p-3">
      <summary className="cursor-pointer font-mono text-xs tracking-widest text-faint uppercase">
        assistente
      </summary>
      <div className="mt-2 flex flex-col items-start gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => void runTask("pautas", () => suggestTopics())}
            className={assistantButtonClasses}
          >
            sugerir pautas
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => void runTask("outline", () => generateOutline({ body }))}
            className={assistantButtonClasses}
          >
            gerar outline
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleImproveSelection}
            className={assistantButtonClasses}
          >
            melhorar seleção
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              void runTask("divulgar", () =>
                generatePromotion({ title, summary, body }),
              )
            }
            className={assistantButtonClasses}
          >
            divulgar
          </button>
        </div>
        {isPending && <p className="font-mono text-xs text-accent">gerando…</p>}
        {error !== null && (
          <p role="alert" className="font-mono text-xs text-danger">
            {error}
          </p>
        )}
        {result !== null && (
          <>
            <p className="w-full rounded-sm border border-line bg-surface p-3 font-mono text-xs whitespace-pre-wrap">
              {result}
            </p>
            <button
              type="button"
              onClick={() => onInsert(result)}
              className={assistantButtonClasses}
            >
              inserir no corpo
            </button>
          </>
        )}
        {promotionBlocks !== null &&
          promotionBlocks.map((block) => (
            <div key={block.label} className="flex w-full flex-col gap-2">
              <p className="font-mono text-xs tracking-widest text-faint uppercase">
                {block.label}
              </p>
              <p className="w-full rounded-sm border border-line bg-surface p-3 font-mono text-xs whitespace-pre-wrap">
                {block.content}
              </p>
              <button
                type="button"
                onClick={() => void handleCopyBlock(block)}
                className={`${assistantButtonClasses} self-start`}
              >
                {copiedBlockLabel === block.label
                  ? "copiado ✓"
                  : `copiar ${block.label}`}
              </button>
            </div>
          ))}
      </div>
    </details>
  );
}
