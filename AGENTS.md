# AGENTS.md — 多端记账应用（小记）

> uni-app (Vue3) + Vercel Serverless + Turso 的个人跨端记账工具
> 一套代码 → 微信小程序 + H5 + Android APK 三端运行
> 
> **H5 在线**: https://jishiben-6zff-ruby.vercel.app

---

## 项目概述

**应用名：** 小记

**一句话：** 个人收支管理工具，一套代码同时运行在微信小程序、手机浏览器和安卓桌面。

**技术栈：** 前端 uni-app (Vue3 Composition API) + uni-ui，后端 Vercel Serverless (Node.js) + Turso (SQLite Edge)，JWT 鉴权 + bcrypt 密码加密。

**核心功能：** 用户名密码注册登录、收支记录增删改查、ECharts 统计图表、H5 在线访问。

---

## 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 前端框架 | uni-app (Vue3 Composition API) | HBuilderX 管理 |
| UI 组件 | uni-ui | 官方组件库，小程序原生风格 |
| 状态管理 | Pinia | 用户登录态 + localStorage 持久化 |
| HTTP | uni.request | 封装 JWT 自动带 token，401 自动跳登录 |
| 图表 | ECharts | 支出分类占比饼图 + 月度收支对比柱状图 |
| 后端 | Vercel Serverless Functions | 免费，自动部署，无需服务器 |
| 数据库 | Turso (SQLite Edge) | 免费 9GB，HTTP 协议，全球边缘节点 |
| ORM | Drizzle ORM | 类型安全，SQLite 方言 |
| 部署 | Vercel | 前端 H5 + API 统一域名，推送即部署 |

---

## 项目结构

```
jishiben/
├── front/                       # uni-app 前端（HBuilderX 打开此目录）
│   ├── pages/
│   │   ├── login/login.vue      # 登录/注册页（独立页面，无 TabBar）
│   │   ├── home/home.vue        # 首页：月度汇总卡片 + 记账弹窗 + 最近5笔
│   │   ├── bills/bills.vue      # 账单列表：月份切换 + 类型筛选 + 编辑/删除
│   │   ├── stats/stats.vue      # 统计页：分类支出排行柱状条 + ECharts 图表
│   │   └── my/my.vue            # 我的：用户信息 + 退出登录
│   ├── components/
│   │   ├── MonthPicker.vue      # 月份选择器（左右箭头 + picker）
│   │   ├── BillCard.vue         # 账单卡片组件
│   │   ├── TypeToggle.vue       # 收支切换组件
│   │   ├── CategoryGrid.vue     # 分类选择网格组件
│   │   ├── LoadingSpinner.vue   # 加载动画组件
│   │   ├── EmptyState.vue       # 空状态组件
│   │   └── ParticleBackground.vue # 粒子背景组件（已简化）
│   ├── api/
│   │   ├── request.js           # uni.request 封装（BASE_URL + JWT + 401拦截）
│   │   ├── auth.js              # 登录/注册 API
│   │   └── bills.js             # 账单 CRUD + 统计 API
│   ├── store/
│   │   └── user.js              # Pinia store：token/nickname/isLogin + login/logout
│   ├── pages.json               # 路由 + TabBar（首页/账单/我的）
│   ├── manifest.json            # 多端配置
│   ├── main.js                  # 入口：createSSRApp + app.use(createPinia())
│   └── App.vue                  # 根组件
│
├── api/                         # Vercel Serverless Functions
│   ├── _lib/
│   │   ├── db.js                # Turso 连接（createClient → drizzle）
│   │   ├── schema.js            # Drizzle 表定义：users / bills / categories
│   │   └── jwt.js               # JWT 签发 / 验证 / 提取 userId
│   ├── auth/
│   │   ├── login.js             # POST /api/auth/login（bcrypt 验证）
│   │   └── register.js          # POST /api/auth/register（自动注册）
│   ├── bills/
│   │   ├── index.js             # GET /api/bills（分页+筛选）/ POST 新增
│   │   ├── [id].js              # PUT/DELETE /api/bills/:id
│   │   └── stats.js             # GET /api/bills/stats（月度汇总+分类排行）
│   ├── init-db.js               # 建表脚本（node init-db.js）
│   ├── migrate.js               # 数据库迁移脚本
│   ├── test-api.js              # 测试脚本（CRUD 全链路验证）
│   └── drizzle.config.js        # Drizzle Kit 配置
│
├── 计划/                        # 项目文档
│   ├── 简历改造计划.md           # 简历优化方案
│   ├── 项目亮点与功能增强建议.md  # 功能规划
│   ├── 登录页改造与组件抽离计划.md # UI 改造计划
│   ├── 运行项目中出现的问题.md    # 踩坑记录（面试可用）
│   ├── 微信小程序认证与上线计划.md # 小程序发布流程
│   └── 718.md                   # 开发计划（最终版）
│
├── vercel.json                  # Vercel 部署配置
├── .gitignore                   # 排除 node_modules/.env/bank/计划/压缩包等
└── AGENTS.md                    # 本文件
```

---

## 数据库设计

```sql
-- 用户表（用户名 + bcrypt 密码）
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT DEFAULT '用户',
  avatar TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 账单表
CREATE TABLE bills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  amount REAL NOT NULL CHECK(amount > 0),
  category TEXT NOT NULL,
  note TEXT,
  bill_date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 分类表（预留，当前版本用前端硬编码分类）
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'default',
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  sort_order INTEGER DEFAULT 0
);
```

---

## API 接口

Base: `https://jishiben-6zff-ruby.vercel.app`

| 方法 | 路径 | 说明 | Auth |
|------|------|------|------|
| POST | `/api/auth/register` | 注册 `{username, password, nickname}` → token | 无 |
| POST | `/api/auth/login` | 登录 `{username, password}` → token | 无 |
| GET | `/api/bills?page=1&pageSize=20&type=expense&month=2026-07` | 账单列表 | JWT |
| POST | `/api/bills` | 新增账单 | JWT |
| PUT | `/api/bills/:id` | 修改账单 | JWT |
| DELETE | `/api/bills/:id` | 删除账单 | JWT |
| GET | `/api/bills/stats?month=2026-07` | 月度统计+分类排行 | JWT |

---

## 已完成的核心功能

### ✅ 阶段一：基础架构（2026-07-18）

- [x] Turso 数据库 + Drizzle ORM 连接
- [x] JWT 鉴权（签发/验证/提取 userId）
- [x] bcrypt 密码加密
- [x] 账单 CRUD API
- [x] 统计 API（月度汇总 + 分类排行）
- [x] Vercel 部署

### ✅ 阶段二：前端页面（2026-07-19）

- [x] 登录/注册页面（独立页面，无 TabBar）
- [x] 首页：月度汇总卡片 + 记账弹窗 + 最近5笔账单
- [x] 账单列表：月份切换 + 收支筛选 + 编辑/删除
- [x] 统计页：ECharts 饼图 + 柱状图
- [x] 我的页面：用户信息 + 退出登录

### ✅ 阶段三：组件抽离（2026-07-20）

- [x] MonthPicker 组件（月份选择器）
- [x] BillCard 组件（账单卡片）
- [x] TypeToggle 组件（收支切换）
- [x] CategoryGrid 组件（分类选择网格）
- [x] LoadingSpinner 组件（加载动画）
- [x] EmptyState 组件（空状态）

### ✅ 阶段四：UI 优化（2026-07-21）

- [x] 登录页简化（纯渐变背景，无特效）
- [x] 弹窗按钮固定底部（避开 TabBar）
- [x] 弹窗打开时隐藏 TabBar
- [x] 日期选择器统一使用 picker 原生组件
- [x] 错误提示自动滚动到顶部
- [x] 响应式适配（手机端居中）

---

## 后续开发计划

### P0 优先级（求职前可选）

- [ ] **预算设置与超支提醒**
  - 用户设置月度预算（如 3000 元）
  - 首页显示「本月已支出 ¥2500 / 预算 ¥3000」
  - 超过 80% 时黄色提醒，超过 100% 红色提醒
  - 预计时间：3 小时

- [ ] **分类管理功能**
  - 允许用户添加/删除自定义分类
  - 分类数据存到数据库 `categories` 表
  - 前端加一个管理页面
  - 预计时间：1 天

- [ ] **月度收支趋势折线图**
  - 后端返回近 6 个月数据
  - 前端用 ECharts line chart 展示
  - 预计时间：2 小时

- [ ] **数据导出（CSV）**
  - 导出某月账单为 CSV
  - 用户可以用 Excel 打开
  - 预计时间：2 小时

### P1 优先级（实习后再做）

- [ ] **账单搜索功能**
  - 按备注/分类/金额范围搜索历史账单
  - 前端 filter 或后端搜索
  - 预计时间：2 小时

- [ ] **离线模式（PWA）**
  - H5 版本支持离线访问
  - 数据先存 localStorage，联网后自动同步
  - 预计时间：1 天

- [ ] **多账本功能**
  - 用户可以创建多个账本（家庭账本/旅行账本）
  - 切换查看不同账本
  - 预计时间：1 天

- [ ] **账单图片上传**
  - 记账时上传小票照片
  - 存到对象存储（Vercel Blob 或第三方 OSS）
  - 预计时间：半天

---

## 已解决的技术难题

### 1. ECharts 首次进入统计页不渲染

**问题：** `v-if` 切换后，DOM 插入发生在下一个宏任务，`nextTick` 只保证响应式数据更新完成，不保证 DOM 已经 paint。

**解决：** `setTimeout(() => renderCharts(), 300)` 推迟到下一个宏任务，给浏览器足够的 paint 时间。

### 2. ECharts 切换月份后图表消失

**问题：** `v-if` 销毁了旧 DOM 但 ECharts 实例不知道，导致 `setOption()` 写到幽灵容器上。

**解决：** 每次 load 前调用 `dispose()` 销毁旧实例，置 null，让下一轮 init 走全新创建路径。

### 3. 弹窗按钮被 TabBar 遮挡

**问题：** TabBar 是原生组件，会遮挡弹窗内容，`vh` 单位包含 TabBar 区域。

**解决：** 弹窗打开时调用 `uni.hideTabBar()` 隐藏 TabBar，关闭时恢复。

### 4. PC 端日历弹窗无法滚动

**问题：** scroll-view 会捕获内部所有滚动事件，包括 fixed 定位的日历弹窗。

**解决：** 统一改用 `<picker mode="date">` 原生组件，避免 scroll-view 拦截。

### 5. 表单验证错误提示不可见

**问题：** 错误提示在弹窗顶部，但用户视野在底部，看不到提示。

**解决：** 表单验证失败时，用 `scroll-view` 的 `scroll-top` 属性自动滚动到顶部。

---

## 常用命令

```bash
# 前端开发：HBuilderX 打开 front/ 目录，点击「运行 → 运行到浏览器」

# 后端本地测试
cd api
node test-api.js          # CRUD 全链路测试
node init-db.js           # 重新建表（仅首次/new schema 变更时）

# 部署：推送后 Vercel 自动部署
git add -A && git commit -m "feat: xxx" && git push
```

---

## 登录流程

```
用户输入用户名+密码 → uni.request POST /api/auth/login
  → 后端查询 users 表 → bcrypt 验证密码
  → 返回 JWT token + userId + nickname
  → 前端存 localStorage（token/userId/nickname）
  → Pinia 自动恢复登录态
  → 后续请求自动带 Authorization: Bearer xxx
  → 401 → 清 token → 跳登录页
```

---

## 编码规范

- 使用 Vue3 Composition API，优先 `<script setup>`
- 样式使用 uni.scss 变量，主题色 Emerald #10b981
- API 请求统一走 `front/api/request.js`，禁止直接写 `uni.request`
- 后端接口统一返回 `{ code: 0, data: ..., message: '' }`
- 不允许硬编码密钥，`.env` 不能提交
- 相同内容出现 2 次或以上，必须抽离成组件或函数
- 列表渲染必须加 `key`，优先用稳定唯一 ID
- 频繁触发的事件（scroll、input）必须防抖/节流

---

## 修改规则

- 小改动用 Edit，大文件重写用 Write
- 修改后必须验证：前端看编译，后端看 `node test-api.js`
- 不要修改 `.gitignore` 中已忽略的文件
- 不要未经确认执行 `git commit` / `push`
- 不要"改进"相邻代码、注释、格式
- 不重构没坏的东西
- 匹配现有风格，即使你个人偏好不同

---

## 面试话术速查

### 项目介绍（30秒版）
> "多端记账应用，uni-app + Vue3 开发，一套代码发小程序、H5、Android。后端用 Vercel Serverless + Turso 数据库，自建 3 张表 8 个接口，JWT 鉴权 + bcrypt 密码加密。H5 部署在 Vercel，扫码就能用。"

### 为什么用 Turso？
> "SQLite 边缘数据库，免费 9GB，HTTP 协议访问快。个人项目够用，后续换 PostgreSQL 改一行配置。"

### 登录怎么做的？
> "输入用户名密码 → 后端 bcrypt 验证 → 返回 JWT → 前端存 token → 请求自动带 Authorization → 401 清 token 回登录。"

### 跟后端怎么联调的？
> "RESTful API，JSON 格式。前端 uni.request 封装了 baseURL 和错误处理。后端响应 `{code:0, data:...}` 表示成功，非 0 前端 toast 提示。联调时用 curl 和 test-api.js 逐个接口验证。"

### 遇到什么技术难题？
> "弹窗按钮被 TabBar 遮挡，我试了三次调整 vh 高度都没解决，最后发现 TabBar 是原生组件，需要用 `uni.hideTabBar()` API 来控制。这个坑让我理解了移动端布局的特殊性——原生组件和 Web 内容是两个层级。"

---

## 总结

这个项目已经有很好的基础：**云端部署、真实鉴权、跨端编译、数据可视化、组件化开发**。当前最需要的是：

1. **把已有的功能讲透**（面试准备）
2. **小程序认证上线**（增加亮点）
3. **P0 功能作为后续补充**（有时间再做）

功能不在多，在于**把已有的功能讲清楚**。面试官更看重你能说清楚：
- 为什么这么设计？
- 遇到什么坑？怎么解决的？
- 如果重新做，会怎么改进？

祝投递顺利！
