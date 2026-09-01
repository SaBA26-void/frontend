"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { isAiServiceConfigured, sendShopChat } from "@/lib/aiApi";
import { formatPrice } from "@/lib/utils";
import type { AiChatMessage, AiProductPreview } from "@/types/ai";

interface UiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: AiProductPreview[];
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I can help you find products, check sizes and colors, and answer shipping or checkout questions.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const configured = isAiServiceConfigured();

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages, loading]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    if (!configured) {
      setError("Chat is not available right now.");
      return;
    }

    const userMessage: UiMessage = { id: createId(), role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    const apiMessages: AiChatMessage[] = nextMessages
      .filter((message) => message.id !== "welcome")
      .map((message) => ({ role: message.role, content: message.content }));

    try {
      const response = await sendShopChat(apiMessages);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: response.message,
          products: response.products ?? undefined,
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <section
          className="flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-sm border border-line bg-paper shadow-2xl animate-rise"
          aria-label="Shop assistant chat"
        >
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <h2 className="font-display text-lg">Shop assistant</h2>
              <p className="text-xs text-ink-soft">Ask about products or delivery</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
            >
              Close
            </button>
          </header>

          <div ref={scrollRef} className="max-h-[min(60vh,28rem)] space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-sm px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-moss text-paper"
                      : "border border-line bg-mist text-ink"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.products && message.products.length > 0 && (
                    <ul className="mt-2 space-y-2 border-t border-line/60 pt-2">
                      {message.products.slice(0, 4).map((product) => (
                        <li key={product.Id}>
                          <Link
                            href={`/product/${product.Id}`}
                            className="block text-xs hover:underline"
                            onClick={() => setOpen(false)}
                          >
                            <span className="font-medium">{product.Name}</span>
                            {product.Price != null && (
                              <span className="text-ink-soft"> — {formatPrice(product.Price)}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <p className="text-sm text-ink-soft" aria-live="polite">
                Thinking…
              </p>
            )}
          </div>

          {error && (
            <p className="border-t border-line px-4 py-2 text-xs text-danger" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="border-t border-line p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={configured ? "Ask a question…" : "Chat unavailable"}
                disabled={!configured || loading}
                className="min-w-0 flex-1 border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!configured || loading || !input.trim()}
                className="bg-ink px-3 py-2 text-xs uppercase tracking-[0.12em] text-paper hover:bg-moss disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full bg-ink px-5 py-3 text-sm uppercase tracking-[0.14em] text-paper shadow-lg transition hover:bg-moss"
        aria-expanded={open}
        aria-label={open ? "Close shop assistant" : "Open shop assistant"}
      >
        {open ? "Close chat" : "Chat"}
      </button>
    </div>
  );
}
