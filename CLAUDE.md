# 多端记账应用 (jishiben)

> uni-app (Vue3) + Vercel Serverless + Turso 的个人跨端记账工具
> 一套代码 → 微信小程序 + H5 + Android APK 三端运行
> 
> **H5 在线**: https://jishiben-6zff-ruby.vercel.app

---

## 🎯 对标岗位：成都前端实习

成都中小公司前端实习 JD 关键词：**uni-app、Vue3、小程序、H5、接口联调、uni-ui/Element Plus、AI 工具、线上可访问项目**。

| JD 要求 | 本项目对应 |
|---------|-----------|
| 基于 uni-app 开发跨端页面 | ✅ H5 + 小程序 + Android 三端 |
| 调用接口渲染数据 | ✅ 8 个 RESTful API，JWT 鉴权 |
| 能看懂基础 Java 代码 | ✅ 实习中用过 Spring Boot，CLAUDE.md 保留 Java 基础知识 |
| 有 uni-app 实际项目经验 | ✅ 本项目，源码 + 在线链接 |
| 独立发过小程序/H5，可展示链接 | ✅ H5 已在 Vercel 上线 |
| 对 AI 编程有了解 | ✅ Claude Code 辅助全栈开发 |
| 有 UI/UX 审美 | ✅ uni-ui 组件库 + 统一 Emerald 主题色 |

---

## 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 前端框架 | uni-app (Vue3 Composition API) | HBuilderX 管理 |
| UI 组件 | uni-ui | 官方组件库，小程序原生风格 |
| 状态管理 | Pinia | 用户登录态 + localStorage 持久化 |
| HTTP | uni.request | 封装 JWT 自动带 token，401 自动跳登录 |
| 图表 | ECharts | 暂时用文本统计替代，可后续升级 |
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
│   │   ├── home/home.vue        # 首页：月度汇总卡片 + 记账弹窗 + 最近5笔
│   │   ├── bills/bills.vue      # 账单列表：月份切换 + 类型筛选 + 左滑删除
│   │   ├── stats/stats.vue      # 统计页：分类支出排行柱状条
│   │   └── my/my.vue            # 我的：输入昵称登录/注册/切换账号/退出
│   ├── api/
│   │   ├── request.js           # uni.request 封装（BASE_URL + JWT + 401拦截）
│   │   ├── auth.js              # 登录 API
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
│   ├── auth/login.js            # POST /api/auth/login（新用户自动注册）
│   ├── bills/index.js           # GET /api/bills（分页+筛选）/ POST 新增
│   ├── bills/[id].js            # PUT/DELETE /api/bills/:id
│   ├── bills/stats.js           # GET /api/bills/stats（月度汇总+分类排行）
│   ├── init-db.js               # 建表脚本（node init-db.js）
│   ├── test-api.js              # 测试脚本（CRUD 全链路验证）
│   └── drizzle.config.js        # Drizzle Kit 配置
│
├── vercel.json                  # Vercel 部署配置
├── .gitignore                   # 排除 node_modules/.env/bank/计划/压缩包等
└── CLAUDE.md                    # 本文件
```

---

## 数据库设计

```sql
-- 用户表（昵称即 openid，新用户自动注册）
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  openid TEXT UNIQUE,
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
| POST | `/api/auth/login` | 登录/注册 `{openid}` → token | 无 |
| GET | `/api/bills?page=1&pageSize=20&type=expense&month=2026-07` | 账单列表 | JWT |
| POST | `/api/bills` | 新增账单 | JWT |
| PUT | `/api/bills/:id` | 修改账单 | JWT |
| DELETE | `/api/bills/:id` | 删除账单 | JWT |
| GET | `/api/bills/stats?month=2026-07` | 月度统计+分类排行 | JWT |

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
用户输入昵称 → uni.request POST /api/auth/login {openid: "昵称"}
  → 后端查 users 表 → 不存在则 INSERT（自动注册）
  → 返回 JWT token + userId + nickname
  → 前端存 localStorage（token/userId/nickname）
  → 后续请求自动带 Authorization: Bearer xxx
  → 401 → 清 token → 跳登录页
```

---

## 当前版本已实现

- [x] 登录/注册（昵称输入 → 自动注册 → JWT 鉴权）
- [x] 记账增删改查（分类选择 + 日期 + 备注 + 金额校验）
- [x] 月度收支汇总卡片（收入/支出/结余）
- [x] 账单列表（月份切换 + 收支筛选）
- [x] 统计排行（分类支出柱状条）
- [x] 退出登录（清数据 + 切换账号）
- [x] 云端部署（Vercel H5 在线可访问）

## 待完成（按优先级）

- [ ] uni-app 发行 H5 → 替换 Vercel 前端为 uni-app H5 版本
- [ ] 微信小程序发行 + 体验版二维码
- [ ] ECharts 饼图/折线图集成
- [ ] 分类管理（自定义分类，存入数据库）
- [ ] 预算设置与超支提醒

---

## 与旧版（bank/）的区别

旧版已删除。旧版架构：uni-app + Spring Boot + H2 + natapp 内网穿透。
新版架构：uni-app + Vercel Serverless + Turso（无需本地后端，24h 在线）。

---

## 面试话术速查

### 项目介绍（30秒版）
> "多端记账应用，uni-app + Vue3 开发，一套代码发小程序、H5、Android。后端用 Vercel Serverless + Turso 数据库，自建 3 张表 8 个接口，JWT 鉴权。H5 部署在 Vercel，扫码就能用。"

### 为什么用 Turso？
> "SQLite 边缘数据库，免费 9GB，HTTP 协议访问快。个人项目够用，后续换 PostgreSQL 改一行配置。"

### 登录怎么做的？
> "输入昵称 → 后端查库 → 新用户自动注册 INSERT → 老用户直接返回 JWT → 前端存 token → 请求自动带 Authorization → 401 清 token 回登录。"

### 跟后端怎么联调的？
> "RESTful API，JSON 格式。前端 uni.request 封装了 baseURL 和错误处理。后端响应 `{code:0, data:...}` 表示成功，非 0 前端 toast 提示。联调时用 curl 和 test-api.js 逐个接口验证。"
