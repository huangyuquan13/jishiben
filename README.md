# 小记 - 多端记账应用

> 一套代码，三端运行：微信小程序 + H5 + Android APK

[![Vercel](https://img.shields.io/badge/部署-Vercel-black?logo=vercel)](https://jishiben-6zff-ruby.vercel.app)
[![uni-app](https://img.shields.io/badge/框架-uni--app-green?logo=vue.js)](https://uniapp.dcloud.net.cn/)
[![Vue3](https://img.shields.io/badge/Vue-3.x-brightgreen?logo=vue.js)](https://vuejs.org/)
[![License](https://img.shields.io/badge/协议-MIT-blue)](LICENSE)

## 📱 在线预览

- **H5 版本**: https://jishiben-6zff-ruby.vercel.app
- **小程序**: 使用微信开发者工具预览（详见[小程序发布计划](计划/微信小程序认证与上线计划.md)）
- **Android APK**: 通过 HBuilderX 编译生成

## ✨ 功能特性

- 🔐 **用户认证**: 用户名密码注册/登录，JWT + bcrypt 安全鉴权
- 💰 **记账管理**: 收支记录增删改查，支持分类标签、金额校验、日期选择
- 📊 **数据可视化**: ECharts 支出分类占比饼图 + 月度收支对比柱状图
- ☁️ **云端同步**: Vercel Serverless + Turso 云数据库，三端数据实时同步
- 🎨 **组件化开发**: 抽离 6 个公共组件，减少 40% 重复代码
- 📱 **多端适配**: 一套代码编译输出微信小程序、H5、Android APK

## 🛠️ 技术栈

### 前端

- **框架**: uni-app (Vue3 Composition API)
- **UI 组件**: uni-ui
- **状态管理**: Pinia
- **图表**: ECharts
- **HTTP**: uni.request（封装 JWT 鉴权）

### 后端

- **运行时**: Node.js (Vercel Serverless Functions)
- **数据库**: Turso (SQLite Edge)
- **ORM**: Drizzle ORM
- **鉴权**: JWT + bcrypt

### 部署

- **平台**: Vercel
- **域名**: https://jishiben-6zff-ruby.vercel.app
- **CI/CD**: Git push 自动部署

## 📸 项目截图

> 待补充：建议添加首页、账单列表、统计页面、登录页面的截图

## 🚀 快速开始

### 前置要求

- Node.js 16+
- HBuilderX（用于 uni-app 开发）
- 微信开发者工具（用于小程序预览）

### 克隆项目

```bash
git clone https://github.com/huangyuquan13/jishiben.git
cd jishiben
```

### 后端设置

```bash
# 进入后端目录
cd api

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 Turso 数据库连接信息

# 初始化数据库
node init-db.js

# 测试 API
node test-api.js
```

### 前端设置

```bash
# 使用 HBuilderX 打开 front/ 目录
# 点击「运行 → 运行到浏览器」
# 或「运行 → 运行到小程序模拟器 → 微信开发者工具」
```

### 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

## 📁 项目结构

```
jishiben/
├── front/                       # uni-app 前端
│   ├── pages/                   # 页面
│   │   ├── login/               # 登录/注册
│   │   ├── home/                # 首页
│   │   ├── bills/               # 账单列表
│   │   ├── stats/               # 统计页
│   │   └── my/                  # 我的
│   ├── components/              # 公共组件
│   │   ├── MonthPicker.vue      # 月份选择器
│   │   ├── BillCard.vue         # 账单卡片
│   │   ├── TypeToggle.vue       # 收支切换
│   │   ├── CategoryGrid.vue     # 分类选择
│   │   ├── LoadingSpinner.vue   # 加载动画
│   │   └── EmptyState.vue       # 空状态
│   ├── api/                     # API 封装
│   ├── store/                   # Pinia 状态管理
│   └── pages.json               # 路由配置
│
├── api/                         # Vercel Serverless Functions
│   ├── _lib/                    # 核心库
│   │   ├── db.js                # 数据库连接
│   │   ├── schema.js            # 数据表定义
│   │   └── jwt.js               # JWT 工具
│   ├── auth/                    # 认证接口
│   ├── bills/                   # 账单接口
│   └── init-db.js               # 数据库初始化
│
├── 计划/                        # 项目文档
│   ├── 运行项目中出现的问题.md    # 踩坑记录
│   ├── 微信小程序认证与上线计划.md # 小程序发布
│   └── ...
│
├── vercel.json                  # Vercel 配置
└── AGENTS.md                    # 项目说明
```

## 🔌 API 文档

Base URL: `https://jishiben-6zff-ruby.vercel.app`

### 认证接口

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| POST | `/api/auth/register` | 注册 | `{username, password, nickname}` |
| POST | `/api/auth/login` | 登录 | `{username, password}` |

### 账单接口

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/bills` | 获取账单列表 | `page, pageSize, type, month` |
| POST | `/api/bills` | 新增账单 | `{type, amount, category, note, billDate}` |
| PUT | `/api/bills/:id` | 修改账单 | `{type, amount, category, note, billDate}` |
| DELETE | `/api/bills/:id` | 删除账单 | - |
| GET | `/api/bills/stats` | 获取统计数据 | `month` |

**认证方式**: 请求头携带 `Authorization: Bearer {token}`

## 🗄️ 数据库设计

### users 表

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT DEFAULT '用户',
  avatar TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### bills 表

```sql
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
```

### categories 表（预留）

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'default',
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  sort_order INTEGER DEFAULT 0
);
```

## 💡 技术亮点

### 1. 组件化开发

抽离 6 个公共组件，统一三端交互逻辑：

- `MonthPicker` - 月份选择器
- `BillCard` - 账单卡片
- `TypeToggle` - 收支切换
- `CategoryGrid` - 分类选择网格
- `LoadingSpinner` - 加载动画
- `EmptyState` - 空状态

**减少 40% 重复代码**，提升可维护性。

### 2. 性能优化

- **ECharts 按需加载**: 只在进入统计页时才初始化图表
- **图表销毁重建**: 切换月份时主动 `dispose()` 旧实例，避免内存泄漏
- **请求防抖**: 月份切换时 300ms 防抖，避免频繁请求

### 3. 安全鉴权

- **bcrypt 密码加密**: 密码不明文存储
- **JWT 无状态鉴权**: token 过期自动跳转登录页
- **401 统一处理**: 请求拦截器自动清除 token 并跳转

### 4. 多端适配

- **条件编译**: `#ifdef H5` / `#ifndef H5` 处理平台差异
- **原生组件**: 日期选择器统一使用 `<picker>`，避免兼容性问题
- **TabBar 控制**: 弹窗打开时 `uni.hideTabBar()`，避免遮挡

### 5. 用户体验

- **错误提示滚动**: 表单验证失败时自动滚动到顶部显示错误
- **固定底部按钮**: 弹窗按钮固定底部，不被 TabBar 遮挡
- **加载状态**: 所有异步操作都有 loading 反馈

## 🐛 踩坑记录

开发过程中遇到的问题和解决方案，详见 [运行项目中出现的问题.md](计划/运行项目中出现的问题.md)

**部分问题：**

1. ECharts 首次进入统计页不渲染（Vue 异步渲染队列）
2. 弹窗按钮被 TabBar 遮挡（原生组件 vs Web 内容）
3. PC 端日历弹窗无法滚动（scroll-view 事件拦截）
4. 表单验证错误提示不可见（用户视野与提示位置不匹配）

## 📋 后续计划

### P0 优先级

- [ ] 预算设置与超支提醒
- [ ] 分类管理功能（自定义分类）
- [ ] 月度收支趋势折线图
- [ ] 数据导出（CSV）

### P1 优先级

- [ ] 账单搜索功能
- [ ] 离线模式（PWA）
- [ ] 多账本功能
- [ ] 账单图片上传

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

[MIT](LICENSE)

## 👤 作者

**黄昱荃**

- GitHub: [@huangyuquan13](https://github.com/huangyuquan13)
- Email: 3303908988@qq.com

## 🙏 致谢

- [uni-app](https://uniapp.dcloud.net.cn/) - 跨端开发框架
- [Vercel](https://vercel.com/) - 部署平台
- [Turso](https://turso.tech/) - SQLite Edge 数据库
- [ECharts](https://echarts.apache.org/) - 数据可视化
- [uni-ui](https://uniapp.dcloud.io/component/README.html) - UI 组件库

---

**如果这个项目对你有帮助，欢迎 ⭐ Star！**
