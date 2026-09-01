"use client";

import { FormEvent, useState } from "react";

export interface AdminCopilotFeedback {
  message?: string;
  warnings?: string[];
  missing?: string[];
}

interface AdminCopilotBoxProps {
  title: string;
  description?: string;
  placeholder: string;
  buttonLabel?: string;
  disabled?: boolean;
  onGenerate: (prompt: string) => Promise<AdminCopilotFeedback>;
}

export function AdminCopilotBox({
  title,
  description,
  placeholder,
  buttonLabel = "Generate draft",
  disabled = false,
  onGenerate,
}: AdminCopilotBoxProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<AdminCopilotFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = prompt.trim();
    if (!text || loading || disabled) return;

    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const result = await onGenerate(text);
      setFeedback(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate draft.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-moss/30 bg-mist/30 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-moss">{title}</h3>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={placeholder}
          disabled={disabled || loading}
          rows={3}
          className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || loading || !prompt.trim()}
          className="border border-moss bg-paper px-4 py-2 text-xs uppercase tracking-[0.12em] text-moss hover:bg-moss hover:text-paper disabled:opacity-40"
        >
          {loading ? "Generating…" : buttonLabel}
        </button>
      </form>

      {feedback?.message && (
        <p className="mt-3 text-sm text-ink">{feedback.message}</p>
      )}
      {feedback?.missing && feedback.missing.length > 0 && (
        <p className="mt-2 text-xs text-ink-soft">
          Still needed: {feedback.missing.join(", ")}
        </p>
      )}
      {feedback?.warnings && feedback.warnings.length > 0 && (
        <ul className="mt-2 list-inside list-disc text-xs text-ink-soft">
          {feedback.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
      {error && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
