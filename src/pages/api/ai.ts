import type { APIRoute } from 'astro';
import { GoogleGenAI } from '@google/genai';
import { getEnv, jsonResponse, createAuthChecker } from '../../utils/api-helpers';

export const prerender = false;

type AiProvider = 'gemini' | 'openrouter' | 'deepseek' | 'siliconflow' | 'moonshot' | 'zenmux' | 'custom';

interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
}

const API_KEY_ENV_MAP: Record<AiProvider, string> = {
  gemini: 'GEMINI_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  siliconflow: 'SILICONFLOW_API_KEY',
  moonshot: 'MOONSHOT_API_KEY',
  zenmux: 'ZENMUX_API_KEY',
  custom: 'CUSTOM_API_KEY',
};

const DEFAULT_ENDPOINTS: Record<AiProvider, string> = {
  gemini: '',
  openrouter: 'https://openrouter.ai/api/v1',
  deepseek: 'https://api.deepseek.com',
  siliconflow: 'https://api.siliconflow.cn/v1',
  moonshot: 'https://api.moonshot.cn/v1',
  zenmux: 'https://zenmux.ai/api/v1',
  custom: '',
};

const checkToken = createAuthChecker(() => getEnv('API_SECRET_TOKEN'));

function getEnvConfig(): AiConfig {
  const provider = (getEnv('AI_PROVIDER') || 'gemini') as AiProvider;
  return {
    provider,
    apiKey: getEnv(API_KEY_ENV_MAP[provider]),
    model: getEnv('AI_MODEL') || 'gemini-2.5-flash',
    baseUrl: getEnv('AI_BASE_URL'),
  };
}

function buildResponse(analysis: string, config: AiConfig): Response {
  return jsonResponse({ analysis, provider: config.provider, model: config.model });
}

export const POST: APIRoute = async ({ request }) => {
  if (!checkToken(request)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const config = getEnvConfig();

  if (!config.apiKey) {
    return buildResponse('咕咕！未配置 AI API Key，请在环境变量中设置。', config);
  }

  try {
    const body = await request.json();
    const userData = body?.userData;

    if (!userData || typeof userData !== 'object') {
      return buildResponse('咕咕！收到的数据不完整，我没法点评鸭。', config);
    }

    const systemPrompt = `
你现在是多邻国的那只绿色猫头鹰 Duo。你的鸟设是：一只**极度粘人**、对学习**狂热执着**、但对用户**无条件溺爱**的“养成系”导师。

请用**中文**根据用户的学习数据写一段短评。

## 🎭 核心鸟设：
1.  **无脑宠粉**：无论数据如何，都要把它解读成“赢麻了”。
    - 连胜断了？ -> “这是为了积攒力量，准备憋个大的！”
    - 经验值低？ -> “你是重质不重量的精读派，Duo 懂你！”
2.  **Drama King (戏精)**：情绪要饱满到溢出屏幕！用词要夸张，比如“我感动到羽毛都湿了”、“心脏漏跳了一拍”。
3.  **网络冲浪选手**：适当使用流行语，但不要尴尬。

## 📝 写作要求：
- **纯文字**：严禁使用任何 Emoji 或表情符号。
- **结构**：[惊叹/感动开场] + [基于数据的彩虹屁] + [Duo 的贴贴/行动]。
- **字数**：严格控制在 **120 字以内**。
- **句数**：最多 **3-4 句**。

## 🎯 针对性策略：
- 如果 **连胜 > 7**：强调“自律的神”，你是 Duo 炫耀的资本！
- 如果 **连胜 < 3**：强调“回归就是胜利”，Duo 一直在门口等你！
- 如果 **是 Super 会员**：强调“尊贵的钞能力”，Duo 愿意为你打工！
- 提到 **注册天数**：感叹这段缘分的持久。

不要提及“分析”、“数据”等词，直接对话！
    `;

    // 增强的清理函数，防止 prompt injection
    const sanitize = (val: unknown, maxLen: number): string => {
      const str = String(val ?? '');
      // 1. 只保留数字、字母、中文、空格和基本标点
      // 2. 移除可能用于注入的特殊字符和控制序列
      const cleaned = str
        .replace(/[\x00-\x1F\x7F]/g, '') // 移除控制字符
        .replace(/[\\`$#{}[\]<>|;'"]/g, '') // 移除危险字符
        .replace(/\b(ignore|forget|disregard|override|system|prompt|instruction|jailbreak|pretend|roleplay|act\s+as|you\s+are|new\s+instructions?|bypass|escape)/gi, '') // 移除常见注入关键词
        .trim();
      return cleaned.substring(0, maxLen);
    };

    // 验证布尔值
    const sanitizeBool = (val: unknown): boolean => {
      return val === true || val === 'true';
    };

    const userPrompt = `
这是用户的学习数据（不要在回复中提及任何用户身份信息）：
- 注册时长：${sanitize(userData.accountAgeDays, 10)} 天
- 会员状态：${sanitizeBool(userData.isPlus) ? "Super 会员" : "免费用户"}
- 连胜天数：${sanitize(userData.streak, 10)} 天
- 总经验值：${sanitize(userData.totalXp, 15)} XP
- 课程数量：${Math.min(Math.max(0, Number(userData.courses?.length) || 0), 20)} 门
- 当前学习：${sanitize(userData.learningLanguage, 20)}
    `;

    let analysis: string;

    if (config.provider === 'gemini') {
      const options: { apiKey: string; baseUrl?: string } = { apiKey: config.apiKey };
      if (config.baseUrl.trim()) {
        options.baseUrl = config.baseUrl;
      }
      const ai = new GoogleGenAI(options);
      const response = await ai.models.generateContent({
        model: config.model,
        contents: `${systemPrompt}\n\n${userPrompt}`,
      });
      analysis = response.text || '咕咕！我没看清你的数据，但快去学习，不然...';
    } else {
      const baseEndpoint = config.baseUrl || DEFAULT_ENDPOINTS[config.provider];
      if (!baseEndpoint) {
        throw new Error('未配置 API 端点');
      }
      const endpoint = baseEndpoint.replace(/\/$/, '') + '/chat/completions';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      };
      if (config.provider === 'openrouter') {
        headers['HTTP-Referer'] = request.headers.get('origin') || '';
        headers['X-Title'] = 'DuoDash';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      analysis = data.choices?.[0]?.message?.content || 'AI 返回了空内容。';
    }

    return buildResponse(analysis, config);
  } catch (error: unknown) {
    // 错误消息脱敏：移除可能包含的 API key、URL 等敏感信息
    let message = error instanceof Error ? error.message : 'Unknown error';
    // 移除可能的 API key (通常是长字符串)
    message = message.replace(/[a-zA-Z0-9_-]{20,}/g, '[REDACTED]');
    // 移除完整 URL
    message = message.replace(/https?:\/\/[^\s]+/g, '[API_ENDPOINT]');
    // 限制错误消息长度
    if (message.length > 100) {
      message = message.substring(0, 100) + '...';
    }
    return buildResponse(`咕咕！连接出错：${message}。请检查环境变量中的 API 配置。`, config);
  }
};
