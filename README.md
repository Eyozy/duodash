# DuoDash

Duolingo 学习数据可视化仪表盘，提供直观的学习进度追踪、数据分析和 AI 智能点评功能。

## 功能特性

- **数据可视化**：7 天 XP/学习时间趋势图，年度学习热力图（支持年/半年/季度视图切换）
- **连胜追踪**：实时显示连胜天数、今日 XP、课程数和学习时长
- **成就系统**：20 个徽章成就，涵盖连胜、单日 XP、累计天数、总 XP 四大类别，每类别均支持青铜至钻石五个等级
- **课程管理**：展示所有学习中的语言课程及进度分布
- **AI 点评**：基于学习数据生成个性化建议，支持多个 AI 服务商
- **响应式设计**：适配桌面、平板和移动设备
- **Duolingo 风格**：采用官方配色和设计语言

## 项目结构

```
duodash/
├── src/
│   ├── components/
│   │   ├── AchievementsSection.tsx  # 成就徽章系统
│   │   ├── AiCoach.tsx              # AI 点评组件
│   │   ├── Charts.tsx               # 热力图组件
│   │   ├── DuoDashApp.tsx           # 主应用组件
│   │   ├── LoginScreen.tsx          # 登录界面
│   │   ├── charts/
│   │   │   ├── XpHistoryChart.tsx   # XP 趋势图
│   │   │   └── TimeHistoryChart.tsx # 学习时间趋势图
│   │   └── dashboard/
│   │       ├── Navbar.tsx           # 导航栏
│   │       ├── StatCard.tsx         # 统计卡片
│   │       ├── TodayOverview.tsx    # 今日概览
│   │       └── CourseList.tsx       # 课程列表
│   ├── hooks/                       # 自定义 Hooks
│   ├── layouts/                     # 页面布局
│   ├── pages/
│   │   ├── index.astro              # 首页
│   │   └── api/                     # API 路由
│   │       ├── config.ts            # 配置检查
│   │       ├── data.ts              # 数据聚合
│   │       └── ai.ts                # AI 点评
│   ├── services/
│   │   ├── duolingoService.ts       # Duolingo 数据转换
│   │   └── geminiService.ts         # AI 服务封装
│   └── types.ts                     # 类型定义
├── astro.config.mjs
├── tailwind.config.mjs
└── tsconfig.json
```

## 环境要求

- Node.js 18+
- npm 或 pnpm

## 快速开始

### 安装

```bash
git clone https://github.com/Eyozy/duodash.git
cd duodash
npm install
```

### 配置

复制环境变量模板并填入配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# Duolingo 凭据
DUOLINGO_USERNAME=your_duolingo_username
DUOLINGO_JWT=your_jwt_token_here

# AI 服务配置
AI_PROVIDER=openrouter
AI_API_KEY=your_api_key
AI_MODEL=mistralai/ministral-3b
API_SECRET_TOKEN=your_api_secret_token_here
```

### 运行

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

访问 `http://localhost:4321` 查看应用。

## 环境变量

| 变量名              | 必填 | 说明                 |
| :------------------ | :--: | :------------------- |
| `DUOLINGO_USERNAME` |  是  | Duolingo 用户名      |
| `DUOLINGO_JWT`      |  是  | Duolingo JWT Token   |
| `AI_PROVIDER`       |  是  | AI 服务商            |
| `AI_API_KEY`        |  是  | AI 服务 API Key      |
| `AI_MODEL`          |  是  | AI 模型名称          |
| `AI_BASE_URL`       |  否  | 仅 `custom` 模式需要 |
| `API_SECRET_TOKEN`  |  是  | API 访问控制令牌     |

## API 访问控制

为了保护你的 AI 额度和数据安全，建议在 `.env.local` 中设置 `API_SECRET_TOKEN`。设置后，API 将需要此令牌才能访问。

### 访问方式

#### 方法一：URL 参数访问（最简单）

在浏览器地址栏直接访问数据时，在链接末尾添加 `?token=你的令牌`。

- 示例：`http://localhost:4321/api/data?token=my-secret-123`

#### 方法二：浏览器控制台调试

如果你在已部署的页面，想通过控制台快速查看数据，可以按 F12 打开控制台输入：

```javascript
fetch("/api/data?token=你的令牌")
  .then((res) => res.json())
  .then(console.log);
```

### 如何验证？

1. 在 `.env.local` 中添加一行：`API_SECRET_TOKEN=你的密码`。
2. 重启项目 (`npm run dev`)。
3. **验证失败情况**：尝试直接访问 `http://localhost:4321/api/data` -> 页面应显示 `{"error":"Unauthorized"}`。
4. **验证成功情况**：尝试带令牌访问 `http://localhost:4321/api/data?token=你的密码` -> 应能正常看到 JSON 数据。

## 获取 JWT Token

1. 登录 [Duolingo 官网](https://www.duolingo.com/)
2. 打开浏览器开发者工具（F12）
3. 切换到「Application」标签
4. 在「Cookies」中找到 `jwt_token` 或在控制台输入以下内容获取

```
document.cookie.match(new RegExp('(^| )jwt_token=([^;]+)'))[0].slice(11)
```

5. 复制该值到 `.env.local`

> **注意**：JWT Token 会定期过期，需要手动更新。

## 部署

### Vercel

1. Fork 项目到 GitHub
2. 登录 [Vercel](https://vercel.com/)
3. 导入仓库
4. 配置环境变量
5. 部署

### Netlify

1. 登录 [Netlify](https://netlify.com/)
2. 导入 GitHub 仓库
3. 构建配置：
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 配置环境变量
5. 部署

项目会自动检测部署环境并使用对应适配器。

## 数据来源

DuoDash 通过调用 Duolingo 官方提供的非官方接口获取数据：

- **用户基础信息**：包含连胜天数、当前经验值、宝石数量、已选课程列表等  
  `https://www.duolingo.com/2017-06-30/users?username={username}`
- **每日学习明细**：包含每日 XP 增长曲线、实际学习时长统计
  `https://www.duolingo.com/2017-06-30/users/{id}/xp_summaries?startDate=1970-01-01`

### 数据字段说明

| 展示项     | 计算逻辑                                                                        |
| ---------- | ------------------------------------------------------------------------------- |
| 连胜天数   | 直接读取 `site_streak` 或 `streak` 字段                                         |
| 总经验     | 优先读取 `total_xp`，否则遍历 `courses` 求和                                    |
| 宝石数量   | 优先级：`gemsTotalCount` > `totalGems` > `gems` > `trackingProperties.gems`     |
| 当前段位   | 读取 `trackingProperties.leaderboard_league` 并映射为中文段位名                 |
| 注册天数   | 当前日期 - `creation_date`（时间戳转换）                                        |
| 总投入时间 | 汇总 `xp_summaries` 中所有 `totalSessionTime`（秒）÷ 60，无数据时显示"暂无数据" |

### 缓存策略

- 服务端缓存：5 分钟
- 刷新方式：点击导航栏刷新按钮

> **注意**：避免频繁刷新，以免触发 API 限流。

## 常见问题

### JWT Token 过期

如遇数据加载失败或「Invalid JWT」错误，请重新获取 Token。

### 日期或热力图显示不准确？

仪表盘会自动根据你的浏览器时区转换 Duolingo 的 UTC 数据。如果你发现日期偏移，可以按以下步骤验证本地时区：

1. 打开浏览器开发者工具 (F12) → **Console**
2. 输入命令并回车：`new Intl.DateTimeFormat().resolvedOptions().timeZone`
3. 确认返回的值是否匹配你当前所在的地理位置。

### AI 点评不显示

检查以下配置：

- AI 相关环境变量是否正确
- API Key 是否有效且有余额
- 网络连接是否正常

### 经验值与 App 不一致

这是正常现象，原因如下：

- 已删除/重置的课程不再返回数据
- 非官方 API 与 App 内部计算逻辑可能不同

网站显示的「总经验」是当前可见课程的经验总和。

## 贡献指南

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add your feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE)

## 致谢

- [Duolingo](https://www.duolingo.com/) - 数据来源
- [Astro](https://astro.build/) - Web 框架
- [Recharts](https://recharts.org/) - 图表库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [GitHubPoster](https://github.com/yihong0618/GitHubPoster) - 热力图设计灵感

---

**声明**：本项目为非官方第三方工具，与 Duolingo Inc. 无关。使用需遵守 Duolingo 服务条款。
