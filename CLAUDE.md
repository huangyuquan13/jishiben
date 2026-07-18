# 记账小工具 (jiZhang)

> 全栈练手项目：uni-app 跨端前端 + SpringBoot 后端 + natapp 内网穿透上线
> 一套代码 → 微信小程序 + H5 + Android APK 三端运行

## 技术栈

| 层 | 技术 | 版本 |
|---|------|------|
| 前端框架 | uni-app (Vue3 Composition API) | Vue 3 |
| UI 组件库 | uni-ui（官方组件库） | — |
| 构建工具 | HBuilderX + Vite | — |
| 后端框架 | SpringBoot | 3.2.0 |
| ORM | Spring Data JPA + Hibernate | 6.3 |
| 数据库 | H2（文件模式，开发用） / MySQL（上线用） | — |
| 内网穿透 | natapp HTTP 隧道 | 免费版 |
| 跨端发布 | 微信小程序 / H5 / Android APK | — |

## 项目结构

```
F:\Ayanjiusuo\hx\uniapp\jishiben\
├── CLAUDE.md                    ← 本文件
├── front\                       ← uni-app 前端
│   ├── App.vue                  ← 应用入口，onLaunch/onShow 从 API 拉数据
│   ├── pages.json               ← 路由 + TabBar 配置
│   ├── manifest.json            ← 应用配置（权限/图标/启动页）
│   ├── uni.scss                 ← 全局 SCSS 变量（主题色/间距/阴影）
│   ├── utils\
│   │   └── api.js               ← API 层：封装 uni.request + 条件编译切换地址
│   ├── pages\
│   │   ├── home\home.vue        ← 首页：月度概览 + 记一笔弹窗 + 最近3笔
│   │   ├── bills\bills.vue      ← 账单页：月份筛选 + 搜索 + 日期分组列表
│   │   ├── my\my.vue            ← 我的页：统计卡片 + 预算/分类/关于
│   │   └── stats\stats.vue      ← 统计详情：分类占比 + 每日趋势
│   ├── uni_modules\             ← uni-ui 全部组件（已安装）
│   └── static\tab\              ← TabBar 图标（6个，81×81 PNG）
│
├── bank\                        ← SpringBoot 后端
│   ├── pom.xml                  ← Maven：SpringBoot + JPA + H2 + MySQL
│   ├── sql\init.sql             ← MySQL 建表语句 + 初始化数据
│   └── src\main\java\com\jizhang\
│       ├── JizhangApplication.java        ← 启动类（端口 8080）
│       ├── entity\Bill.java              ← 账单实体（JPA → t_bill 表）
│       ├── repository\BillRepository.java ← JPA 数据访问层
│       ├── service\BillService.java       ← 业务逻辑（CRUD + 统计 + 趋势）
│       ├── controller\
│       │   ├── BillController.java        ← 账单 + 统计 API
│       │   └── SettingsController.java    ← 设置 + 分类管理 API
│       └── config\
│           ├── CorsConfig.java            ← 跨域 + UTF-8 编码过滤器
│           └── DataInitializer.java       ← 启动时自动插入12条初始数据
│
├── natapp\                      ← 内网穿透客户端
│   ├── natapp.exe
│   └── config.ini               ← authtoken（不要泄露！）
│
└── 记账小工具.zip               ← Gemini 生成的 React 原型（仅供参考）
```

## 如何运行

### 开发模式（小程序模拟器）

```bash
# 终端1：启动后端
cd bank
mvn spring-boot:run

# HBuilderX：运行 → 运行到微信小程序
```

### App 真机调试（natapp 内网穿透）

```bash
# 1. 启动后端
cd bank && mvn spring-boot:run

# 2. 启动 natapp
cd natapp && .\natapp.exe

# 3. HBuilderX → 发行 → 原生App-云打包
#    → 选 Android + 公共测试证书 → 打包 → 下载 APK → 安装
```

### 给同学用（前提：你电脑开着 + 后端跑着 + natapp 连着）

natapp 公网地址写在 APK 里，同学装好即用，无需配置。

## API 接口

Base: `http://localhost:8080/api`（开发）/ natapp 域名（公网）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/bills?month=2026-07` | 按月份查账单 |
| POST | `/bills` | 添加账单 |
| DELETE | `/bills/{id}` | 删除账单 |
| GET | `/bills/stats?month=2026-07` | 月度统计（总收支 + 分类占比） |
| GET | `/bills/trend?month=2026-07` | 每日交易趋势 |
| GET | `/settings` | 获取用户设置 |
| PUT | `/settings` | 更新设置 |
| POST | `/settings/categories` | 添加分类 |
| DELETE | `/settings/categories/{code}` | 删除分类 |

## 数据模型

```javascript
// 一笔账单
{
    id: Long,           // 自增主键
    type: String,       // "expense" | "income"
    amount: Double,     // 金额
    category: String,   // 分类代码
    categoryName: String, // 分类名称（中文）
    categoryIcon: String, // 分类图标（emoji）
    date: LocalDate,    // YYYY-MM-DD
    note: String,       // 备注
    createTime: Long    // 时间戳
}
```

## 核心功能

1. **记一笔** — 半屏弹窗表单（金额/分类/日期/备注），uni-popup + uni-easyinput + uni-datetime-picker
2. **账单列表** — 月份切换 + 搜索 + 类型/分类筛选 + 按日期分组展示
3. **月度统计** — 分类占比进度条 + 每日收支趋势图
4. **预算管理** — 设置月预算，进度条实时反馈（绿/黄/红 三色），超支提醒
5. **分类管理** — 自定义收支分类 + emoji 图标选择
6. **数据持久化** — H2 文件数据库 + Spring Data JPA + 启动自动填充初始数据

## 架构设计要点

### 前端数据流

```
App.vue onLaunch/onShow → api.getBills() → 存 globalData
    ↓
Page onShow → api.getBills() → 更新页面数据
    ↓
用户保存 → api.addBill() → loadData() 重拉 → 页面刷新
```

每页 `onShow` 时从 API 拉数据，不依赖本地缓存。保存/删除后重拉保证一致性。

### API 层条件编译

```javascript
// #ifdef APP-PLUS
const BASE_URL = 'http://natapp域名/api';    // App → 公网
// #endif
// #ifdef H5
const BASE_URL = 'http://localhost:8080/api'; // 浏览器 → 本地
// #endif
```

### 后端分层

```
Controller → Service → Repository (JPA) → H2/MySQL
   (REST)     (业务)      (数据访问)      (持久化)
```

## 已解决的问题（踩坑记录）

| 问题 | 解决 |
|------|------|
| natapp TCP 隧道 502 | HTTP 隧道才支持 Web 访问 |
| natapp 连不上后端 | 先启后端再启 natapp |
| H2 重启数据全丢 | `jdbc:h2:mem` → `jdbc:h2:file` |
| 中文存成 ?? | 添加 CharacterEncodingFilter + UTF-8 配置 |
| GET 500 报 DateTimeParseException | 前端参数 `'2026'` → `'2026-07'` |
| POST 400 日期解析失败 | Entity 加 `@JsonFormat(pattern="yyyy-MM-dd")` |
| APK 打包后还是旧代码 | 清除 `unpackage/dist` 和 `unpackage/cache` |
| Android 权限格式报错 | 用 `<uses-permission android:name="..."/>` 格式 |
| 首页最近3笔不更新 | `recentBills` 按 `createTime` 降序排序 |
| Hibernate 方言错误 | 显式指定 `H2Dialect` |

详见 `C:\Users\33039\Desktop\vue3教程\移动端学习\内网穿透前后端联调踩坑记录.md`

## uni-app 知识点速查

| 概念 | uni-app 写法 |
|------|-------------|
| 路由配置 | `pages.json` 中 `pages` 数组 |
| TabBar | `pages.json` 中 `tabBar.list` |
| 页面跳转 | `uni.navigateTo` / `uni.switchTab` |
| 生命周期 | `onLoad` / `onShow` / `onReady` / `onHide` / `onUnload` |
| 数据更新 | Vue3 响应式：`ref().value = xxx` |
| 本地缓存 | `uni.setStorageSync` / `uni.getStorageSync` |
| 网络请求 | `uni.request` |
| 条件编译 | `#ifdef APP-PLUS` / `#ifdef MP-WEIXIN` / `#ifdef H5` |
| 跨端发布 | HBuilderX → 发行 → 选择目标平台 |

## 开发流程回顾

此项目完整经历了：
1. **需求设计** — brainstorming 选定记账工具
2. **原型参考** — Gemini 生成 React 版本 → 翻译为 uni-app Vue3
3. **前端开发** — uni-ui 组件库 + 条件编译 + 多端适配
4. **后端开发** — SpringBoot 3.x + JPA + H2 → MySQL
5. **联调调试** — natapp 内网穿透 + 中文编码 + 日期格式等 12 个坑
6. **打包发布** — Android APK 云打包 + 图标/启动页配置

> 最后更新：2026年7月8日
