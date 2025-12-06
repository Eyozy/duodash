import type { UserData } from "../types";

export interface AiResponse {
  analysis: string;
  provider: string;
  model: string;
}

export const analyzeUserStats = async (userData: UserData): Promise<string> => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userData })
    });

    if (!response.ok) {
      return "咕咕！连接 AI 服务失败，请稍后重试。";
    }

    const data: AiResponse = await response.json();
    return data.analysis;
  } catch (error: any) {
    return `咕咕！连接出错：${error.message}`;
  }
};

export const getAiInfo = async (): Promise<{ provider: string; model: string }> => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userData: { accountAgeDays: 0, isPlus: false, streak: 0, totalXp: 0, courses: [], learningLanguage: 'Unknown' } })
    });
    const data: AiResponse = await response.json();
    return { provider: data.provider, model: data.model };
  } catch {
    return { provider: 'unknown', model: 'unknown' };
  }
};
