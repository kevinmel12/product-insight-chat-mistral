import type { UXChatResponse, UXInsightsResponse } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response, defaultMessage: string) {
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || defaultMessage);
  }
  return (await res.json()) as T;
}

export async function fetchInsights(): Promise<UXInsightsResponse> {
  const res = await fetch(`${API_BASE}/api/v1/analyze`, { method: "GET" });
  return handleResponse(res, "Failed to fetch insights");
}

export async function askQuestion(question: string): Promise<UXChatResponse> {
  const res = await fetch(`${API_BASE}/api/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return handleResponse(res, "Failed to send question");
}
