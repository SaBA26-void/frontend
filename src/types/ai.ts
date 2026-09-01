/** AI service API types (separate from C# shop DTOs). */

export interface AiChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiChatRequest {
  messages: AiChatMessage[];
}

/** Product previews from AI service use PascalCase (asyncpg row keys). */
export interface AiProductPreview {
  Id: number;
  Name: string;
  Description?: string;
  Price: number;
  StockQuantity?: number;
  CategoryName?: string;
  ImageUrl?: string;
}

export interface AiChatResponse {
  message: string;
  language: string;
  products?: AiProductPreview[] | null;
}

export interface AiAssistRequest {
  prompt: string;
}

export interface AiProductVariantDraft {
  size: string | null;
  color: string | null;
  stockQuantity: number;
}

export interface AiProductDraft {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  imageUrl: string;
  variants: AiProductVariantDraft[];
}

export interface AiCategoryDraft {
  name: string;
  parentCategoryId: number | null;
}

export interface AiOrderFilters {
  search?: string | null;
  city?: string | null;
  minTotal?: number | null;
  maxTotal?: number | null;
}

export interface AiProductAssistResponse {
  intent: string;
  confidence: number;
  message: string;
  draft: AiProductDraft | null;
  missing: string[];
  warnings: string[];
}

export interface AiCategoryAssistResponse {
  intent: string;
  confidence: number;
  message: string;
  draft: AiCategoryDraft | null;
  missing: string[];
  warnings: string[];
}

export interface AiOrderAssistResponse {
  intent: string;
  confidence: number;
  message: string;
  filters: AiOrderFilters;
  orders?: Record<string, unknown>[] | null;
  missing: string[];
  warnings: string[];
}
