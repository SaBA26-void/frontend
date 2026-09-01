import { NextRequest, NextResponse } from "next/server";

function getAiBaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_AI_API_BASE_URL?.replace(/\/$/, "") ?? null;
}

async function proxyAssist(request: NextRequest, path: string) {
  const baseUrl = getAiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { detail: "AI service is not configured (NEXT_PUBLIC_AI_API_BASE_URL)." },
      { status: 503 },
    );
  }

  const adminPassword = request.headers.get("X-Admin-Password");
  if (!adminPassword) {
    return NextResponse.json({ detail: "Invalid admin password." }, { status: 401 });
  }

  const body = await request.text();

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Password": adminPassword,
      },
      body,
      signal: AbortSignal.timeout(180_000),
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      { detail: "Could not reach the AI service." },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  return proxyAssist(request, "/api/assist/product-draft");
}
