# DuoDash - Duolingo 学习数据可视化面板

一个美观的 Duolingo 学习数据可视化仪表板，帮助你更直观地了解学习进度、连胜记录、XP 历史等统计信息。

## ✨ 功能特性

- 📊 **数据可视化** - 7 天经验/学习时间趋势图、年度学习热力图
- 🔥 **连胜追踪** - 实时显示连胜天数和今日学习状态
- 🌍 **多语言课程** - 展示所有学习中的语言课程及分布
- 🤖 **AI 智能点评** - 基于学习数据生成个性化学习建议
- 📱 **响应式设计** - 完美适配桌面、平板和移动设备
- 🎨 **Duolingo 风格** - 采用官方配色和设计语言

## 📁 项目结构

```
duodash/
├── public/                      # 静态资源
├── src/
│   ├── components/              # React 组件
│   │   ├── AiCoach.tsx          # AI 点评组件
│   │   ├── Charts.tsx           # 图表组件集合
│   │   ├── DuoDashApp.tsx       # 主应用组件
│   │   └── LoginScreen.tsx      # 登录界面
│   ├── layouts/                 # 页面布局
│   ├── pages/                   # 页面路由
│   │   ├── index.astro          # 首页
│   │   └── api/                 # API 路由
│   │       ├── config.ts        # 配置检查接口
│   │       ├── data.ts          # 数据聚合接口
│   │       └── ai.ts            # AI 点评接口
│   ├── services/                # 服务层
│   │   ├── duolingoService.ts   # Duolingo 数据转换服务
│   │   └── geminiService.ts     # AI 服务封装
│   └── types.ts                 # TypeScript 类型定义
├── .env.example                 # 环境变量示例
├── astro.config.mjs             # Astro 配置
├── tailwind.config.mjs          # Tailwind 配置
└── tsconfig.json                # TypeScript 配置
```

## ⚙️ 环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `DUOLINGO_USERNAME` | 是 | Duolingo 用户名，用于自动加载数据 |
| `DUOLINGO_JWT` | 是 | Duolingo JWT Token，用于 API 认证 |
| `AI_PROVIDER` | 是 | AI 服务提供商：`gemini` / `openrouter` / `deepseek` / `siliconflow` / `moonshot` / `custom` |
| `AI_API_KEY` | 是 | AI 服务的 API Key |
| `AI_MODEL` | 是 | AI 模型名称，如 `gemini-pro` |
| `AI_BASE_URL` | 否 | 自定义 AI 服务地址（provider 为 custom 时使用） |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/Eyozy/duodash.git
cd duodash

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
```

### 配置说明

编辑 `.env.local` 文件，填入你的配置：

```env
# Duolingo 凭据
DUOLINGO_USERNAME=your_duolingo_username
DUOLINGO_JWT=your_jwt_token_here

# AI 服务配置（用于 AI 点评功能）
AI_PROVIDER=gemini
AI_API_KEY=your_api_key
AI_MODEL=gemini-pro
```

### 获取 JWT Token

1. 登录 [Duolingo 官网](https://www.duolingo.com/)
2. 打开浏览器开发者工具（按 `F12`）
3. 切换到「应用程序/Application」标签
4. 在左侧「Cookie」中找到 `jwt_token`
5. 复制该值到 `.env.local` 文件

### 运行项目

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

访问 http://localhost:4321 查看应用。

## 📦 数据加载方式

DuoDash 支持三种灵活的数据加载方式：

### 1. 自动加载（推荐）

配置 `.env.local` 中的 `DUOLINGO_USERNAME` 和 `DUOLINGO_JWT`，应用启动时自动获取数据。

### 2. 手动输入

在登录界面手动输入用户名和 JWT Token。

### 3. JSON 导入

1. 访问 `https://www.duolingo.com/users/你的用户名`
2. 复制页面显示的全部 JSON 内容
3. 在登录界面选择「粘贴 JSON」模式并粘贴

## 🌐 部署指南

### Vercel 部署（推荐）

1. Fork 本项目到你的 GitHub
2. 登录 [Vercel](https://vercel.com/)
3. 点击「New Project」导入你的仓库
4. 配置环境变量：
   - `DUOLINGO_USERNAME`
   - `DUOLINGO_JWT`
   - `AI_PROVIDER`
   - `AI_API_KEY`
   - `AI_MODEL`
5. 点击「Deploy」完成部署

### Netlify 部署

项目已配置自动适配器检测，可直接部署到 Netlify：

1. 登录 [Netlify](https://netlify.com/)
2. 点击「Add new site」→「Import an existing project」
3. 连接 GitHub 并选择仓库
4. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 在「Site settings」→「Environment variables」添加环境变量：
   - `DUOLINGO_USERNAME`
   - `DUOLINGO_JWT`
   - `AI_PROVIDER`
   - `AI_API_KEY`
   - `AI_MODEL`
6. 触发部署

**说明**：项目会自动检测 Netlify 环境并使用 Node 适配器，无需手动配置。

## 📊 数据获取说明

### 数据来源

DuoDash 通过 Duolingo 非官方 API 获取数据，主要使用以下接口：

1. **用户基础数据** - `https://www.duolingo.com/2017-06-30/users?username={username}`
   - 用户信息、连胜天数、总 XP、宝石数量
   - 课程列表、当前学习语言
   - 会员状态、段位信息

2. **XP 历史数据** - `https://www.duolingo.com/2017-06-30/users/{userId}/xp_summaries`
   - 每日获得的 XP 数量
   - 每日学习时长（秒）
   - 用于生成 7 天趋势图和年度热力图

3. **排行榜历史** - `https://www.duolingo.com/2017-06-30/users/{userId}/leaderboard_history`
   - 段位赛历史记录
   - 排名变化数据

### 数据处理流程

```
用户登录 → 获取 JWT Token → 调用 /api/data 接口
    ↓
并行请求 Duolingo API (V1 + V2)
    ↓
数据合并与转换 (duolingoService.ts)
    ↓
前端展示 (DuoDashApp.tsx)
```

### 关键数据字段

| 展示项 | 数据来源 | 计算逻辑 |
|--------|----------|----------|
| 连胜天数 | `streak` | 直接从 API 获取 |
| 总经验 | `courses[].xp` | 所有课程 XP 求和 |
| 宝石数量 | `gems` 或 `trackingProperties.gems` | 优先使用 trackingProperties |
| 当前段位 | `trackingProperties.leaderboard_league` | 映射到中文段位名称 |
| 注册天数 | `creationDate` | 当前日期 - 注册日期 |
| 学习课程数 | `courses.length` | 过滤 XP > 0 的课程 |
| 预估投入时间 | `totalXp / 6` | 假设每分钟获得 6 XP |
| 完成课程数 | `trackingProperties.num_sessions_completed` | 直接从 API 获取 |
| 连胜冻结卡 | `trackingProperties.num_item_streak_freeze` | 直接从 API 获取 |

### 数据更新频率

- **实时数据**：连胜、XP、宝石等数据在每次刷新页面时更新
- **手动刷新**：点击导航栏的"刷新"按钮可立即更新数据
- **缓存策略**：服务端缓存 5 分钟，减少 API 请求频率
- **API 限制**：建议不要频繁刷新，避免触发 Duolingo API 限流

### 数据准确性说明

1. **总 XP 差异**：网站显示的是当前可见课程的 XP 总和，不包含已删除/重置课程的历史 XP
2. **时间估算**：学习时长基于 XP 估算（每分钟 6 XP），实际时长可能有偏差
3. **API 版本**：使用非官方 V1/V2 API，部分字段可能与 App 显示不一致

## ❓ 常见问题

### Q: JWT Token 过期怎么办？

如遇到数据加载失败或 "Invalid JWT" 错误，请重新从浏览器获取 Token。JWT Token 会定期过期，需要手动更新。

### Q: AI 点评不显示？

请检查：
- AI 相关环境变量是否正确配置
- API Key 是否有效且有足够额度
- 网络连接是否正常

### Q: 经验值与 App 显示不一致？

这是正常现象，主要原因：

1. **已删除/重置的课程**：App 保留历史经验值，但 API 不再返回已删除课程数据
2. **API 版本差异**：本项目使用非官方 API，与 App 内部接口计算逻辑可能不同

**提示**：网站显示的「总经验」是当前可见课程的经验总和，不包含已删除课程的历史经验。

### Q: 为什么加载速度较慢？

首次加载需要并行请求多个 Duolingo API 接口，可能需要 5-8 秒。后续访问会使用服务端缓存，速度会明显提升。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Duolingo](https://www.duolingo.com/) - 数据来源
- [Astro](https://astro.build/) - 现代化 Web 框架
- [Recharts](https://recharts.org/) - React 图表库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [GitHubPoster](https://github.com/yihong0618/GitHubPoster) - 年度学习热力图设计灵感

---

**声明**: 本项目为非官方第三方工具，与 Duolingo Inc. 无关。使用本工具需遵守 Duolingo 服务条款。