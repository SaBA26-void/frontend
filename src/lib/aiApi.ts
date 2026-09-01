import { getAdminPassword } from "@/lib/adminAuth";
import type {
  AiAssistRequest,
  AiCategoryAssistResponse,
  AiChatMessage,
  AiChatResponse,
  AiOrderAssistResponse,
  AiProductAssistResponse,
} from "@/types/ai";

function getAiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_AI_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("AI service is not configured (NEXT_PUBLIC_AI_API_BASE_URL).");
  }
  return baseUrl;
}

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
  const response = await fetch(`${getAiBaseUrl()}/api/chat/shop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<AiChatResponse>;
}

async function postAdminAssist<T>(path: string, body: AiAssistRequest): Promise<T> {
  const password = getAdminPassword();
  if (!password) {
    throw new Error("Admin password is required.");
  }

  const response = await fetch(`${getAiBaseUrl()}${path}`, {
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
  return postAdminAssist<AiProductAssistResponse>("/api/assist/product-draft", { prompt });
}

export function requestCategoryDraft(prompt: string): Promise<AiCategoryAssistResponse> {
  return postAdminAssist<AiCategoryAssistResponse>("/api/assist/category-draft", { prompt });
}

export function requestOrderQuery(prompt: string): Promise<AiOrderAssistResponse> {
  return postAdminAssist<AiOrderAssistResponse>("/api/assist/order-query", { prompt });
}

export function isAiServiceConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_AI_API_BASE_URL?.trim());
}
