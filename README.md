# DuoDash

Duolingo 学习数据仪表盘，直观展示你的 XP 趋势、连胜记录、成就进度，并提供 AI 学习点评和分享卡片功能。

## 功能特性

- **今日概览**：显示今日 XP、课程数、连胜天数和学习分钟数
- **趋势图表**：最近 7 天 XP 和学习时长面积图，显示周期内总量汇总
- **年度热力图**：全年学习热力图，支持年份切换；宽屏显示全年，窄屏自动切换为上下半年视图
- **成就系统**：20 个徽章，覆盖连胜、单日 XP、累计天数、总 XP 四个维度
- **课程管理**：展示所有学习中的语言课程及 XP 分布
- **AI 点评**：基于学习数据调用 AI 生成个性化点评，支持多个服务商
- **分享卡片**：生成连胜成就、经验突破、本周报告三种卡片
- **本地缓存**：命中缓存时立即渲染，后台静默刷新；跨天后自动失效
- **响应式 + Gzip**：适配桌面、平板、移动端；服务端中间件自动压缩 API 响应

## 项目结构

```
duodash/
├── src/
│   ├── components/
│   │   ├── DuoDashApp.tsx              # 根组件，管理数据流与演示模式
│   │   ├── icons.tsx                   # 通用图标封装
│   │   ├── achievements/
│   │   │   ├── AchievementsSection.tsx # 成就徽章展示与进度详情
│   │   │   └── AchievementIcons.tsx    # 徽章图标
│   │   ├── charts/
│   │   │   ├── chartConfig.ts          # 图表公共配置（颜色等）
│   │   │   ├── AreaHistoryChart.tsx    # XP / 时长面积趋势图
│   │   │   └── HeatmapChart.tsx        # 年度热力图
│   │   ├── dashboard/
│   │   │   ├── DashboardView.tsx       # 仪表盘布局，懒加载各子模块
│   │   │   ├── AiCoach.tsx             # AI 点评（视口触发 + 本地回退）
│   │   │   ├── LoginScreen.tsx         # 引导配置页
│   │   │   ├── ErrorScreen.tsx         # 错误状态
│   │   │   ├── LoadingScreen.tsx       # 加载状态
│   │   │   ├── Navbar.tsx              # 导航栏（刷新 / 分享入口）
│   │   │   ├── PageHeader.tsx          # 用户信息头部
│   │   │   ├── StatCard.tsx            # 统计卡片
│   │   │   ├── TodayOverview.tsx       # 今日概览
│   │   │   ├── CourseList.tsx          # 课程列表
│   │   │   └── index.ts
│   │   └── share/
│   │       ├── ShareModal.tsx          # 分享弹窗（卡片选择 + PNG 导出）
│   │       ├── cards/                  # 分享卡片模板
│   │       └── useSnapdom.ts           # 截图工具 Hook
│   ├── hooks/
│   │   ├── useDashboardData.ts         # 数据拉取、缓存、演示模式状态
│   │   ├── useAchievementStats.ts      # 成就数据计算
│   │   ├── useChartDimensions.ts       # 图表尺寸响应
│   │   ├── useUserDataCache.ts         # localStorage 缓存读写
│   │   └── useViewportObserver.ts      # 视口进入检测（AI 懒触发）
│   ├── layouts/
│   ├── middleware.ts                   # Gzip 压缩中间件
│   ├── pages/
│   │   ├── index.astro
│   │   └── api/
│   │       ├── config.ts               # 环境变量检查
│   │       ├── data.ts                 # 数据聚合（含服务端缓存）
│   │       └── ai.ts                   # AI 点评接口
│   ├── services/
│   │   ├── duolingoService.ts          # Duolingo 原始数据转换
│   │   ├── duolingoResolvers.ts        # 各字段解析逻辑
│   │   ├── aiService.ts                # AI 服务调用封装
│   │   ├── historyBuilder.ts           # 每日 / 周 / 年历史数据构建
│   │   └── todayStatsResolver.ts       # 今日 XP / 课程数 / 连胜状态解析
│   ├── styles/
│   ├── types.ts                        # 全局类型定义
│   └── utils/
│       ├── api-utils.ts                # Token 鉴权、响应封装
│       ├── dateUtils.ts                # 时区感知日期处理
│       └── demo-data.ts                # 演示数据生成
├── astro.config.mjs
├── postcss.config.mjs
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

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# Duolingo 凭据
DUOLINGO_USERNAME=your_duolingo_username
DUOLINGO_JWT=your_jwt_token_here

# AI 服务配置（根据 AI_PROVIDER 只需填对应的 API Key）
AI_PROVIDER=deepseek
AI_MODEL=deepseek-chat
DEEPSEEK_API_KEY=your_api_key

# API 访问控制（可选，设置后所有 API 请求需携带该 Token）
API_SECRET_TOKEN=your_secret_token
```

### 运行

```bash
npm run dev      # 开发模式，默认 http://localhost:4321
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

> 未配置账号时，首页会显示引导界面，点击「预览演示数据」可直接体验完整功能。

## 环境变量

| 变量名 | 必填 | 说明 |
| :--- | :--: | :--- |
| `DUOLINGO_USERNAME` | ✅ | Duolingo 用户名 |
| `DUOLINGO_JWT` | ✅ | Duolingo JWT Token |
| `AI_PROVIDER` | ✅ | AI 服务商（见下方支持列表） |
| `AI_MODEL` | ✅ | AI 模型名称 |
| `API_SECRET_TOKEN` | 可选 | API 访问控制令牌，不设置则无鉴权 |
| `DEEPSEEK_API_KEY` | 可选 | `deepseek` |
| `OPENROUTER_API_KEY` | 可选 | `openrouter` |
| `SILICONFLOW_API_KEY` | 可选 | `siliconflow` |
| `MOONSHOT_API_KEY` | 可选 | `moonshot` |
| `ZENMUX_API_KEY` | 可选 | `zenmux` |
| `CUSTOM_API_KEY` | 可选 | `custom` |
| `AI_BASE_URL` | 可选 | 仅 `custom` 模式需要 |

## API 访问控制

设置 `API_SECRET_TOKEN` 后，客户端请求必须携带该 Token：

```
# URL 参数（最简单）
http://localhost:4321/api/data?token=your-secret-token
```

未携带 Token 时返回 `{"error":"Unauthorized"}`。

## 获取 JWT Token

1. 登录 [Duolingo 官网](https://www.duolingo.com/)
2. 按 F12 打开开发者工具 → 控制台，执行：

```js
document.cookie.match(/jwt_token=([^;]+)/)[1]
```

3. 将输出值填入 `.env.local` 的 `DUOLINGO_JWT` 字段

> JWT Token 会定期过期，API 返回 401 时需重新获取。

## 部署

项目会自动检测部署环境：存在 `NETLIFY` 环境变量时使用 Netlify adapter，否则使用 Vercel adapter，同一套代码无需修改即可部署到两个平台。

### Vercel

1. Fork 项目到 GitHub
2. 登录 [Vercel](https://vercel.com/) → 导入仓库
3. 配置环境变量 → 部署

### Netlify

1. 登录 [Netlify](https://netlify.com/) → 导入 GitHub 仓库
2. Build command: `npm run build`，Publish directory: `dist`
3. 配置环境变量 → 部署

## 数据来源

DuoDash 通过以下 Duolingo 非官方接口获取数据：

| 接口 | 用途 |
| --- | --- |
| `GET /2017-06-30/users?username={username}` | 解析用户 ID |
| `GET /2023-05-23/users/{id}` | 用户主数据（连胜、XP、段位、全部课程，含数学/音乐） |
| `GET /2017-06-30/users/{id}/xp_summaries?startDate=1970-01-01` | 完整学习历史（每日 XP、实际学习时长） |

### 字段计算逻辑

| 展示项 | 计算逻辑 |
| --- | --- |
| 连胜天数 | `site_streak` → `streak` |
| 总经验 | `total_xp` → 遍历 `courses` 求和 |
| 宝石数量 | `gemsTotalCount` → `totalGems` → `gems` → `tracking_properties.gems` → `lingots` |
| 当前段位 | `trackingProperties.leaderboard_league` 映射为中文段位名 |
| 注册天数 | 当前日期 - `creation_date`（时区感知） |
| 预估投入时间 | 汇总 `xp_summaries.totalSessionTime`（秒）÷ 60 |
| 今日 XP / 课程数 | 按浏览器时区从 `xpGains` / `xp_summaries` 筛选当日数据 |
| 当前学习语言 | 顶层 `learningLanguage` 字段与 `courses` 列表匹配取名称 |

### 缓存策略

| 层 | 策略 |
| --- | --- |
| 服务端 | 内存缓存，TTL 5 分钟，跨天或超时后失效 |
| 客户端 | `localStorage`，命中时立即渲染，后台静默刷新；跨天后自动失效 |

> 避免频繁点击刷新，以免触发 Duolingo API 限流。

## 常见问题

**JWT Token 过期**  
API 返回「JWT Token 已过期或无效」时，重新执行控制台命令获取新 Token 并更新 `.env.local`，重启服务即可。

**日期 / 热力图显示偏移**  
客户端通过 `x-user-timezone` 请求头将浏览器时区传给服务端，所有日期计算均基于该时区。可在控制台确认当前时区是否准确：

```js
Intl.DateTimeFormat().resolvedOptions().timeZone
```

**AI 点评不显示**  
- 检查 `AI_PROVIDER` 对应的 API Key 是否填写且有效
- AI 不可用时界面会回退到本地生成的简短分析，不会报错

**经验值与 App 不一致**  
已删除 / 重置的课程不再返回数据，且非官方 API 与 App 内部计算逻辑存在差异，属于正常现象。

## 贡献指南

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交：`git commit -m 'feat: add your feature'`
4. 推送：`git push origin feature/your-feature`
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE)

## 致谢

- [Duolingo](https://www.duolingo.com/) — 数据来源
- [Astro](https://astro.build/) — Web 框架
- [Recharts](https://recharts.org/) — 图表库
- [Tailwind CSS](https://tailwindcss.com/) — CSS 框架
- [snapdom](https://github.com/zumerlab/snapdom) — 分享卡片截图
- [GitHubPoster](https://github.com/yihong0618/GitHubPoster) — 热力图设计灵感

---

> 本项目为非官方第三方工具，与 Duolingo Inc. 无关。使用需遵守 [Duolingo 服务条款](https://www.duolingo.com/terms)。
