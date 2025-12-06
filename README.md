# DuoDash - Duolingo 学习数据可视化面板

一个美观的 Duolingo 学习数据可视化仪表板，展示你的学习进度、连胜记录、XP 历史等统计信息。

## 功能特性

- 📊 **数据可视化** - 7 天经验/学习时间趋势图、年度热力图
- 🔥 **连胜追踪** - 显示连胜天数和今日学习状态
- 🌍 **多语言支持** - 展示所有学习中的语言课程分布
- 🤖 **AI 点评** - 基于学习数据生成个性化点评（支持多种 AI 服务）
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🎨 **Duolingo 风格** - 采用 Duolingo 官方配色和设计语言

## 技术栈

- **框架**: [Astro](https://astro.build/) + React
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **图表**: [Recharts](https://recharts.org/)
- **类型**: TypeScript
- **AI**: 支持 Gemini / OpenRouter / DeepSeek / 硅基流动 / Moonshot

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/duodash.git
cd duodash

# 安装依赖
npm install
```

### 配置

1. 复制环境变量示例文件：

```bash
cp .env.example .env.local
```

2. 编辑 `.env.local` 文件：

```env
# Duolingo 凭据（可选，用于自动加载数据）
DUOLINGO_USERNAME=your_duolingo_username
DUOLINGO_JWT=your_jwt_token_here

# AI 服务配置（可选，用于 AI 点评功能）
AI_PROVIDER=gemini
AI_API_KEY=your_api_key
AI_MODEL=gemini-pro
```

### 获取 Duolingo JWT Token

1. 登录 [Duolingo 官网](https://www.duolingo.com/)
2. 打开浏览器开发者工具（F12）
3. 切换到「应用程序/Application」标签
4. 在「Cookie」中找到 `jwt_token`
5. 复制该值到 `.env.local` 文件

### 运行

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

访问 http://localhost:4321 查看应用。

## 数据来源

DuoDash 支持三种数据加载方式：

### 1. 自动加载（推荐）

配置 `.env.local` 中的 `DUOLINGO_USERNAME` 和 `DUOLINGO_JWT`，应用启动时自动获取数据。

### 2. 手动输入 JWT

在登录界面输入用户名和 JWT Token。

### 3. 粘贴 JSON

1. 访问 `https://www.duolingo.com/users/你的用户名`
2. 复制页面全部 JSON 内容
3. 在登录界面选择「粘贴 JSON」模式粘贴

## 部署指南

### Vercel 部署（推荐）

1. Fork 本项目到你的 GitHub
2. 登录 [Vercel](https://vercel.com/)
3. 点击「New Project」导入你的仓库
4. 配置环境变量：
   - `DUOLINGO_USERNAME`
   - `DUOLINGO_JWT`
   - `AI_PROVIDER`（可选）
   - `AI_API_KEY`（可选）
5. 点击「Deploy」

### Netlify 部署

1. 登录 [Netlify](https://netlify.com/)
2. 点击「Add new site」→「Import an existing project」
3. 连接 GitHub 并选择仓库
4. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 在「Site settings」→「Environment variables」添加环境变量
6. 触发重新部署

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# 构建镜像
docker build -t duodash .

# 运行容器
docker run -d -p 8080:80 duodash
```

### 自托管（Node.js）

项目已配置 `@astrojs/node` 适配器，可直接构建和运行：

```bash
# 构建
npm run build

# 运行服务器
node dist/server/entry.mjs
```

服务器默认监听 `http://localhost:4321`。

可通过环境变量自定义：

```bash
HOST=0.0.0.0 PORT=3000 node dist/server/entry.mjs
```

## 项目结构

```
duodash/
├── public/              # 静态资源
├── src/
│   ├── components/      # React 组件
│   │   ├── AiCoach.tsx      # AI 点评组件
│   │   ├── Charts.tsx       # 图表组件集合
│   │   ├── DuoDashApp.tsx   # 主应用组件
│   │   └── LoginScreen.tsx  # 登录界面
│   ├── layouts/         # 页面布局
│   ├── pages/           # 页面路由
│   │   ├── index.astro      # 首页
│   │   └── api/             # API 路由
│   ├── services/        # 服务层
│   │   ├── duolingoService.ts   # Duolingo 数据服务
│   │   └── geminiService.ts     # AI 服务
│   └── types.ts         # TypeScript 类型定义
├── astro.config.mjs     # Astro 配置
├── tailwind.config.mjs  # Tailwind 配置
└── tsconfig.json        # TypeScript 配置
```

## 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `DUOLINGO_USERNAME` | 否 | Duolingo 用户名 |
| `DUOLINGO_JWT` | 否 | Duolingo JWT Token |
| `AI_PROVIDER` | 否 | AI 服务提供商：`gemini`/`openrouter`/`deepseek`/`siliconflow`/`moonshot`/`custom` |
| `AI_API_KEY` | 否 | AI 服务 API Key |
| `AI_MODEL` | 否 | AI 模型名称 |
| `AI_BASE_URL` | 否 | 自定义 AI 服务地址（provider 为 custom 时使用） |

## API 代理

为解决 CORS 限制，项目内置 API 代理端点：

- `/api/duo?target=users&username=xxx` - 获取用户数据
- `/api/duo?target=xp_summaries&userId=xxx` - 获取 XP 历史
- `/api/duo?target=leaderboard_history&userId=xxx` - 获取排行榜历史

## 常见问题

### Q: JWT Token 过期怎么办？

JWT Token 有效期约 30 天，过期后需重新获取。建议定期更新 `.env.local` 或环境变量中的 Token。

### Q: 热力图日期显示错误？

已在 v1.1 修复时区问题，确保使用最新版本。

### Q: AI 点评不显示？

检查 AI 相关环境变量是否正确配置，且 API Key 有效。

### Q: 数据不准确？

数据来源于 Duolingo 非官方 API，部分字段可能不完整。建议使用「粘贴 JSON」模式获取最完整数据。

## 更新日志

### v1.1.0
- 修复热力图时区问题
- 修复每日目标显示
- 优化今日概览布局
- 热力图显示真实学习时间（非估算）
- 添加连胜保持时间显示

### v1.0.0
- 初始版本发布
- 支持基本数据可视化
- 支持 AI 点评功能

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 致谢

- [Duolingo](https://www.duolingo.com/) - 数据来源
- [Astro](https://astro.build/) - 网站框架
- [Recharts](https://recharts.org/) - 图表库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

---

**声明**: 本项目为非官方第三方工具，与 Duolingo Inc. 无关。使用本工具需遵守 Duolingo 服务条款。
