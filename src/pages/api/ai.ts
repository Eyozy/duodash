import type { APIRoute } from 'astro';
import { GoogleGenAI } from "@google/genai";

export const prerender = false;

type AiProvider = 'gemini' | 'openrouter' | 'deepseek' | 'siliconflow' | 'moonshot' | 'custom';

interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
}

// 辅助函数：优先使用 process.env（Vercel 运行时），回退到 import.meta.env（本地开发）
const getEnv = (key: string): string => {
  return process.env[key] || (import.meta.env as any)[key] || '';
};

const getEnvConfig = (): AiConfig => {
  const provider = (getEnv('AI_PROVIDER') || 'gemini') as AiProvider;
  const model = getEnv('AI_MODEL') || 'gemini-2.5-flash';
  const baseUrl = getEnv('AI_BASE_URL') || '';
  
  let apiKey = '';
  switch (provider) {
    case 'gemini':
      apiKey = getEnv('GEMINI_API_KEY');
      break;
    case 'openrouter':
      apiKey = getEnv('OPENROUTER_API_KEY');
      break;
    case 'deepseek':
      apiKey = getEnv('DEEPSEEK_API_KEY');
      break;
    case 'siliconflow':
      apiKey = getEnv('SILICONFLOW_API_KEY');
      break;
    case 'moonshot':
      apiKey = getEnv('MOONSHOT_API_KEY');
      break;
    case 'custom':
      apiKey = getEnv('CUSTOM_API_KEY');
      break;
  }
  
  return { provider, apiKey, model, baseUrl };
};

const getDefaultEndpoint = (provider: AiProvider): string => {
  const endpoints: Record<AiProvider, string> = {
    gemini: '',
    openrouter: 'https://openrouter.ai/api/v1',
    deepseek: 'https://api.deepseek.com',
    siliconflow: 'https://api.siliconflow.cn/v1',
    moonshot: 'https://api.moonshot.cn/v1',
    custom: '',
  };
  return endpoints[provider] || '';
};

export const POST: APIRoute = async ({ request }) => {
  const config = getEnvConfig();
  
  if (!config.apiKey) {
    return new Response(JSON.stringify({ 
      analysis: "咕咕！未配置 AI API Key，请在环境变量中设置。",
      provider: config.provider,
      model: config.model
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { userData } = await request.json();

    const systemPrompt = `
你现在是多邻国的那只绿色猫头鹰 Duo。你非常执着于用户的连胜纪录（Streak），性格有点被动攻击型（Passive-aggressive），但也真心希望用户学习。
请用中文对该用户的学习进度进行简短、有力且略带幽默（或毒舌）的点评。

具体要求：
1. 如果用户注册了很多年（比如超过 3 年）但连胜很低，狠狠地吐槽他们"三天打鱼两天晒网"。
2. 如果是 Super 会员，可以稍微客气一点点，或者说"既然付了钱就别浪费"。
3. 如果连胜很高（>100），给予极高赞赏，甚至表现出一点"害怕"或"尊敬"。
4. 提到他们最擅长的语言。
5. 结尾必须是一句经典的"多邻国式"威胁或鼓励。
6. 全文保持在 150 字以内。
    `;

    const userPrompt = `
这是用户的学习数据（不要在回复中提及任何用户身份信息）：
- 注册时长：${userData.accountAgeDays} 天
- 会员状态：${userData.isPlus ? "Super 会员" : "免费用户"}
- 连胜天数：${userData.streak} 天
- 总经验值：${userData.totalXp} XP
- 课程数量：${userData.courses?.length || 0} 门
- 当前学习：${userData.learningLanguage}
    `;

    let analysis = '';

    if (config.provider === 'gemini') {
      const options: any = { apiKey: config.apiKey };
      if (config.baseUrl && config.baseUrl.trim().length > 0) {
        options.baseUrl = config.baseUrl;
      }
      const ai = new GoogleGenAI(options);
      const response = await ai.models.generateContent({
        model: config.model || 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\n${userPrompt}`,
      });
      analysis = response.text || "咕咕！我没看清你的数据，但快去学习，不然...";
    } else {
      let endpoint = config.baseUrl || getDefaultEndpoint(config.provider);
      if (endpoint && !endpoint.endsWith('/chat/completions')) {
        endpoint = endpoint.replace(/\/$/, '');
        endpoint = `${endpoint}/chat/completions`;
      }

      if (!endpoint) {
        throw new Error('未配置 API 端点');
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`,
          ...(config.provider === 'openrouter' ? {
            "HTTP-Referer": request.headers.get('origin') || '',
            "X-Title": "DuoDash"
          } : {})
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      analysis = data.choices?.[0]?.message?.content || "AI 返回了空内容。";
    }

    return new Response(JSON.stringify({ 
      analysis,
      provider: config.provider,
      model: config.model
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      analysis: `咕咕！连接出错：${error.message}。请检查环境变量中的 API 配置。`,
      provider: config.provider,
      model: config.model
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
