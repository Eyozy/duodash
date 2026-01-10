import type { UserData } from "../types";

export interface AiResponse {
  analysis: string;
  provider: string;
  model: string;
}

async function callAiApi(userData: Partial<UserData>): Promise<AiResponse | null> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userData })
  });
  if (!response.ok) return null;
  return response.json();
}

export async function analyzeUserStats(userData: UserData): Promise<string> {
  try {
    const data = await callAiApi(userData);
    return data?.analysis ?? "咕咕！连接 AI 服务失败，请稍后重试。";
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return `咕咕！连接出错：${message}`;
  }
}

const MINIMAL_USER_DATA: Partial<UserData> = {
  accountAgeDays: 0,
  isPlus: false,
  streak: 0,
  totalXp: 0,
  courses: [],
  learningLanguage: 'Unknown'
};

export async function getAiInfo(): Promise<{ provider: string; model: string }> {
  try {
    const data = await callAiApi(MINIMAL_USER_DATA);
    return { provider: data?.provider ?? 'unknown', model: data?.model ?? 'unknown' };
  } catch {
    return { provider: 'unknown', model: 'unknown' };
  }
}
