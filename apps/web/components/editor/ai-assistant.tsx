"use client";

import { useState, type RefObject } from "react";
import {
  generateOutline,
  improveText,
  suggestTopics,
  type AiTextResult,
} from "@/lib/actions/ai";

type AssistantTask = "pautas" | "outline" | "melhorar";

const assistantButtonClasses =
  "rounded-sm border border-line bg-surface px-3 py-1.5 font-mono text-xs text-link transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50";

export function AiAssistant({
  body,
  bodyRef,
  onInsert,
}: {
  body: string;
  bodyRef: RefObject<HTMLTextAreaElement | null>;
  onInsert: (text: string) => void;
}) {
  const [pendingTask, setPendingTask] = useState<AssistantTask | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTask(
    task: AssistantTask,
    request: () => Promise<AiTextResult>,
  ) {
    setPendingTask(task);
    setError(null);
    setResult(null);
    const response = await request();
    setPendingTask(null);
    if (response.ok) {
      setResult(response.text);
    } else {
      setError(response.error);
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
      </div>
    </details>
  );
}
