# Kimi Code CLI 使用指南（写给 Claude Code 迁移过来的前端开发者）

> 适用方向：uni-app 小程序 / H5 / Web / Vue / React 前端开发  
> 项目背景：当前仓库是一个 `uni-app + Vercel Serverless + Turso` 的多端记账应用  
> 写在前面：**Kimi Code CLI 不需要像 Claude Code 那样手动配置第三方模型 key 或 switcher**，安装后直接用自然语言驱动。

---

## 一、Kimi 模型本身能干什么

Kimi 是 Moonshot AI 的大模型，Kimi Code CLI 直接把它接入了本地开发工作流。可以理解为：

- **能读代码**：整个项目的文件、目录结构、依赖关系都能读取分析。
- **能写代码**：直接修改、创建、删除文件，支持多文件联改。
- **能跑命令**：可以在 Bash 里执行 `npm`、`git`、`node` 等命令，也支持后台任务。
- **能联网搜索**：遇到不知道的包、API、报错，可以直接搜。
- **能规划任务**：/goal + /todo 组合，适合复杂需求分步推进。
- **能识别上下文**：当前目录、项目类型、git 状态、依赖版本都会作为上下文。

简单说：Claude Code 能干的大部分活，Kimi Code 也能干，而且**不需要你自己去配 DeepSeek/DeepV4Pro 等第三方模型**。

---

## 二、Kimi Code 与 Claude Code CLI 的核心区别

| 对比项 | Claude Code CLI（你之前用的） | Kimi Code CLI（当前） |
|--------|------------------------------|----------------------|
| 模型来源 | 原生 Claude，或通过 `ccswitch` 切换到国产模型 | 内置 Kimi，无需切换 |
| 配置成本 | 需要 token、模型地址、context 配置 | 登录即用，无需额外 key |
| 联网搜索 | 不登录 Claude 原生账号，搜索/文档能力受限 | 内置联网，直接可用 |
| 文件操作 | 读写文件、执行命令 | 读写文件、执行命令 |
| 计划模式 | 有 | 有，/plan |
| 目标追踪 | 有 | 有，/goal + /todo |
| 后台任务 | 有 | 有，/tasks |
| 项目记忆 | 靠 `CLAUDE.md` | 靠 `AGENTS.md` + 全局配置 |
| 代码风格 | 偏西方工程规范 | 会匹配项目已有风格 |

**迁移建议**：把你在 Claude Code 里积累的 `CLAUDE.md` 规范内容，改写成 Kimi 能识别的 `AGENTS.md`，作用几乎一样。

---

## 三、前端开发者应该怎么配置全局文件

Kimi Code 不像 Claude Code 那样依赖 `ccswitch` 的模型配置。你要做的是两件事：

### 1. 项目级配置：`AGENTS.md`

放在项目根目录，告诉 Kimi 这个项目的**技术栈、目录约定、编码规范、禁止行为**。  
当前项目已经有 `CLAUDE.md`，建议再补充一个 `AGENTS.md`，内容更面向 Kimi 的 prompt 解析。

**推荐模板（针对本 uni-app 项目）：**

```markdown
# AGENTS.md

## 项目概述
- 多端记账应用：uni-app (Vue3 Composition API) + Vercel Serverless + Turso
- 一套代码输出：微信小程序 + H5 + Android APK

## 目录约定
- front/        uni-app 前端，HBuilderX 打开此目录
- api/          Vercel Serverless Functions
- vercel.json   Vercel 路由配置
- CLAUDE.md     项目说明文档

## 技术栈
- 前端：uni-app、Vue3、Pinia、uni-ui、uni.request
- 后端：Node.js、Drizzle ORM、Turso、JWT
- 部署：Vercel、HBuilderX

## 编码规范
- 使用 Vue3 Composition API，优先 `<script setup>`
- 样式使用 uni.scss 变量，主题色 Emerald #10b981
- API 请求统一走 front/api/request.js，禁止直接写 uni.request
- 后端接口统一返回 { code: 0, data: ..., message: '' }
- 不允许硬编码密钥，.env 不能提交

## 修改规则
- 小改动用 Edit，大文件重写用 Write
- 修改后必须验证：前端看编译，后端看 node test-api.js
- 不要修改 .gitignore 中已忽略的文件
- 不要未经确认执行 git commit / push
```

### 2. 全局级配置：`~/.kimi-code/config.toml`（可选）

如果你经常让 Kimi 用特定风格回复，可以在全局配置里设置：

```toml
[model]
# Kimi Code 内置，一般不需要改
# 只有在你需要切换模型版本时才配置

[ui]
language = "zh"

[permissions]
# 默认允许文件编辑和命令执行
allow_file_edit = true
allow_shell = true
```

> 对于前端开发，**项目级 `AGENTS.md` 比全局配置更重要**。因为每个项目技术栈不同，Kimi 需要先知道“这是 uni-app 项目”还是“这是 React 项目”。

### 3. 针对技术栈的配置重点

| 方向 | AGENTS.md 里一定要写清楚 |
|------|-------------------------|
| uni-app 小程序 | 目录是 HBuilderX 工程、用 Vue2 还是 Vue3、是否用 TS、unpackage/ 处理方式 |
| Vue3 Web | 构建工具 Vite/Webpack、组件库、状态管理、路由模式 |
| React | CRA / Vite / Next.js、React 版本、状态库、样式方案 |
| 通用 | ESLint/Prettier 规则、提交规范、测试命令 |

---

## 四、编码过程中常见的问题

### 1. Kimi 改了代码但运行报错的场景

- **没按项目约定来**：比如直接在 `.vue` 文件里写原生 `uni.request`，没走封装。
- **多端兼容没注意**：uni-app 里 `window`、`document`、`localStorage` 在小程序端不通用。
- **依赖版本问题**：Kimi 可能引用了一个新版本 API，但项目 lock 的是旧版本。
- **路径写错**：uni-app 里 `@/` 别名、相对路径、平台条件编译容易出错。

**应对**：改完后让它 `npm run dev:%PLATFORM%` 或 `node test-api.js` 跑一下验证。

### 2. 上下文丢失/理解偏差

- 大文件没一次性给全，Kimi 可能只基于片段改。
- 复杂需求建议先用 `/goal` 拆解，再用 `/todo` 追踪。
- 关键文件用 `@` 显式引用，比如 `@front/api/request.js 增加超时重试`。

### 3. 前端特有的坑

| 问题 | 解决办法 |
|------|---------|
| HBuilderX 与命令行混用 | 前端编译优先用 HBuilderX；后端 API 调试可以用命令行 |
| 跨域 / BASE_URL 配置 | 开发期用 `localhost:3000`，生产用 Vercel 域名，统一在 `request.js` 管理 |
| JWT token 失效 | 看 `request.js` 的 401 拦截是否触发，token 是否被清空 |
| uni-ui 组件不生效 | 检查 `uni_modules` 是否已安装，easycom 配置是否正确 |
| 图片/字体资源路径 | uni-app 打包后路径会变，尽量用网络资源或 `~@/static/xxx` |
| manifest.json 平台差异 | 小程序和 H5 的 appid、路由、权限配置不同 |

### 4. 与 Claude Code 不同的工作习惯

- Kimi Code 默认**会主动执行命令验证**（比如跑测试），不需要你反复强调。
- 如果命令会修改共享状态（`git push`、删库、改生产配置），Kimi 会询问确认。
- 你不需要写英文 prompt，中文表达即可，但技术术语保留英文（`ref`、`props`、`setup`）。

---

## 五、常用命令速查

### 基础交互

| 命令 | 作用 |
|------|------|
| `/help` 或 `/?` | 查看所有命令 |
| `/ask 怎么配置 pinia` | 进入问答模式，不自动改文件 |
| `@front/api/request.js 这个文件是做什么的` | 引用文件提问 |

### 任务与规划

| 命令 | 作用 |
|------|------|
| `/goal 实现分类管理功能` | 开启一个目标，持续追踪 |
| `/todo` | 查看当前待办 |
| `/plan` | 进入计划模式，先出方案再动手 |
| `/tasks` | 查看后台任务 |

### 代码操作

你不需要记很多命令，**直接说需求**就行。比如：

```
帮我在 front/pages/stats/stats.vue 里加一个 ECharts 饼图
```

```
后端 /api/bills/stats 接口增加按年份统计的返回字段
```

```
修复登录后 401 不自动跳转的问题，先看 request.js
```

### 项目相关

```bash
# 后端本地测试
cd api && node test-api.js

# 重新建表（谨慎）
cd api && node init-db.js

# 前端开发
# 用 HBuilderX 打开 front/ 目录，点击「运行 → 运行到浏览器/小程序模拟器」
```

---

## 六、给这个 uni-app 项目的快速上手指南

1. **让 Kimi 读项目**：先问 `介绍一下这个项目`，它会去读 `CLAUDE.md` 和目录结构。
2. **明确需求**：不要只说“改一下首页”，要说“在首页月度汇总卡片下面增加本月的支出Top3”。
3. **改完后验证**：
   - 前端：HBuilderX 运行到浏览器或小程序模拟器。
   - 后端：`cd api && node test-api.js`
4. **复杂功能先规划**：比如“集成 ECharts 饼图”，先用 `/plan` 让它出步骤，确认后再执行。
5. **不要自己配模型**：Kimi Code 内置模型，直接对话即可。

---

## 七、一句话总结

> **Claude Code 需要你告诉它“用哪个模型、token 是什么、context 怎么配”；Kimi Code 只需要你告诉它“项目是什么、要干什么”。**  
> 对前端开发者来说，把项目规范写进 `AGENTS.md`，用中文自然语言描述需求，改完让它跑验证，就是最高效的工作流。
