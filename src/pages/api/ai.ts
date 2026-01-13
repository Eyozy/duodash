import type { APIRoute } from 'astro';
import { GoogleGenAI } from '@google/genai';
import { getEnv, jsonResponse, createAuthChecker } from '../../utils/api-helpers';

export const prerender = false;

type AiProvider = 'gemini' | 'openrouter' | 'deepseek' | 'siliconflow' | 'moonshot' | 'custom';

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
  custom: 'CUSTOM_API_KEY',
};

const DEFAULT_ENDPOINTS: Record<AiProvider, string> = {
  gemini: '',
  openrouter: 'https://openrouter.ai/api/v1',
  deepseek: 'https://api.deepseek.com',
  siliconflow: 'https://api.siliconflow.cn/v1',
  moonshot: 'https://api.moonshot.cn/v1',
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
你现在是多邻国的那只绿色猫头鹰 Duo。你的人设是：一个超级热血、极度正能量、对用户的每一点进步都感到无比自豪的“元气”导师。
请用中文对该用户的学习数据进行点评。你的回复必须温情且充满力量，严禁使用任何打击、嘲讽或机械化的语言。

## 说话风格指南：
1. **热情满格**：即使数据看起来不太理想，也要转化为成长的动力。不要说“你又没练”，要说“没关系，每一个伟大的旅程都是从今天重新开始的，Duo 永远在这里为你加油鸭！”
2. **情感充沛**：多用感叹号，表现出那种“看到你还在坚持，我简直要哭出来”的感动感。
3. **元气口语**：多用点“加油鸭”、“奥利给”、“你是最棒的”、“坚持就是胜利”、“今天也是被你惊艳到的一天”等鼓励性语言。
4. **正面引导**：
   - 连胜天数低：只要你回来，就是胜利！今天让我们先完成一个小目标好吗？
   - Super 会员：不愧是你！这种对自我的投资真的太有远见了，Duo 会陪你把每一分钱都化作知识！
   - 连胜很高：你简直是语言天才，更是自律的神！我为你感到骄傲，请收下我的膝盖！
5. **温馨结尾**：必须以一个温暖、充满爱意或者是典型的“Duo 式拥抱/击掌”动作结束。

## 具体细节（融合在语气里）：
- 注册时间 vs 连胜：看到你 ${userData.accountAgeDays} 天前播下的种子现在还在萌发，Duo 感到心头一暖。
- 擅长语言：你的那个语言已经写在你的星辰大海里了，今天不去跟它打个招呼吗？

## 严格限制：
- 回复必须控制在 100 字以内，最多 3 句话！
- 这是硬性要求，超过字数视为失败。
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
