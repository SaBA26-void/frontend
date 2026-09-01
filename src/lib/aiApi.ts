import { getAdminPassword } from "@/lib/adminAuth";
import type {
  AiAssistRequest,
  AiCategoryAssistResponse,
  AiChatMessage,
  AiChatResponse,
  AiOrderAssistResponse,
  AiProductAssistResponse,
} from "@/types/ai";

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string | { msg?: string }[] };
    if (typeof data.detail === "string") {
      return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail[0]?.msg) {
      return data.detail[0].msg;
    }
  } catch {
    // fall through
  }
  return `Request failed (${response.status})`;
}

export async function sendShopChat(messages: AiChatMessage[]): Promise<AiChatResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);

  try {
    const response = await fetch("/api/ai/chat/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    return response.json() as Promise<AiChatResponse>;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "The AI is taking too long to respond (limited server CPU). Try a shorter question or ask again.",
      );
    }
    if (err instanceof TypeError) {
      throw new Error("Could not reach the shop. Check your connection and try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function postAdminAssist<T>(path: string, body: AiAssistRequest): Promise<T> {
  const password = getAdminPassword();
  if (!password) {
    throw new Error("Admin password is required.");
  }

  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Password": password,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<T>;
}

export function requestProductDraft(prompt: string): Promise<AiProductAssistResponse> {
  return postAdminAssist<AiProductAssistResponse>("/api/ai/assist/product-draft", { prompt });
}

export function requestCategoryDraft(prompt: string): Promise<AiCategoryAssistResponse> {
  return postAdminAssist<AiCategoryAssistResponse>("/api/ai/assist/category-draft", { prompt });
}

export function requestOrderQuery(prompt: string): Promise<AiOrderAssistResponse> {
  return postAdminAssist<AiOrderAssistResponse>("/api/ai/assist/order-query", { prompt });
}

export function isAiServiceConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_AI_API_BASE_URL?.trim());
}
