# Deployment Guide / 部署指南

---

## Option A: Unified Vercel Deployment (Recommended) / 方案 A：全部部署到 Vercel（推荐）

This approach deploys both the frontend and backend as a single Vercel project. The Express API is served as a Vercel Serverless Function under `/api`, sharing the same domain as the frontend. This eliminates cross-origin cookie issues on Safari/iOS.

此方案将前端和后端作为一个 Vercel 项目统一部署。Express API 以 Vercel Serverless Function 的形式运行在 `/api` 路径下，与前端共享同一域名。这彻底解决了 Safari/iOS 上跨域 cookie 被拦截的问题。

```
https://your-app.vercel.app/          →  Vue SPA (client/dist)
https://your-app.vercel.app/api/*     →  Express API (api/index.ts serverless)
```

### How it works / 原理

The root `vercel.json` rewrites all `/api/*` requests to the serverless function at `api/index.ts`. That function mounts the existing Express app under `/api`, so Express sees `/api/books` as `/books` and routes it normally — no changes needed to the existing server code.

根目录的 `vercel.json` 将所有 `/api/*` 请求路由到 `api/index.ts` 这个 Serverless Function。该函数将 Express 挂载在 `/api` 下，Express 收到 `/api/books` 后会自动剥去 `/api` 前缀，路由到原有的 `/books` 处理器，服务端代码无需修改。

### 1. Set Root Directory in Vercel / 设置 Vercel 项目根目录

In the Vercel dashboard → your project → **Settings → General → Root Directory**:
在 Vercel 控制台 → 项目 → **Settings → General → Root Directory**：

- Clear the field so it points to the **repo root** (not `client/`)
  清空此字段，指向**仓库根目录**（不是 `client/`）

### 2. Set environment variables / 配置环境变量

In **Settings → Environment Variables**, add all of the following:
在 **Settings → Environment Variables** 中添加以下所有变量：

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `/api` |
| `DATABASE_URL` | Neon database connection string / Neon 数据库连接字符串 |
| `JWT_SECRET` | Your JWT secret / JWT 密钥 |
| `STRIPE_SECRET_KEY` | Your Stripe secret key / Stripe 私钥 |
| `CORS_ORIGIN` | Your Vercel URL, e.g. `https://bright-sun-books.vercel.app` |

> `PORT` is not needed — Vercel manages it automatically for serverless functions.
> 不需要设置 `PORT`，Vercel 会自动管理。

### 3. Deploy / 部署

Push to `main`. Vercel will:
推送到 `main`，Vercel 会自动：

1. Run `cd client && npm install && npm run build` (defined in root `vercel.json`)
   执行客户端构建命令
2. Serve `client/dist` as the static frontend
   将 `client/dist` 作为静态前端
3. Deploy `api/index.ts` as a serverless function
   将 `api/index.ts` 部署为 Serverless Function

### 4. Smoke test / 冒烟测试

- [ ] `GET /api/` returns `Welcome to the Bookstore API!`
- [ ] Home page loads, category nav works / 首页正常，分类导航可用
- [ ] Add to cart → checkout → submit order on mobile Safari / 手机 Safari 可完整下单
- [ ] Confirmation page shows correct details / 确认页显示正确信息

---

## Option B: Separate Deployments — Backend on Railway / 方案 B：分开部署，后端用 Railway

> ⚠️ Known issue: Safari/iOS blocks cross-origin cookies (`SameSite=None`), causing 401 errors on mobile checkout.
> ⚠️ 已知问题：Safari/iOS 会拦截跨域 cookie，导致手机结账时出现 401 认证错误。

### 1. Verify build locally / 本地验证构建

```bash
cd server
npm run build       # Compiles TypeScript → dist/
node dist/server.js # Verify it starts correctly
```

### 2. Create Railway project / 创建 Railway 项目

1. Log in at [railway.app](https://railway.app)
   登录 [railway.app](https://railway.app)
2. Click **New Project → Deploy from GitHub repo**, select your repo, set Root Directory to `server`
   点击 **New Project → Deploy from GitHub repo**，选择仓库，Root Directory 设为 `server`

### 3. Configure environment variables / 配置环境变量

In the Railway project **Variables** panel, add:
在 Railway 项目的 **Variables** 面板添加：

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Neon database connection string / Neon 数据库连接字符串 |
| `JWT_SECRET` | Your JWT secret / JWT 密钥 |
| `STRIPE_SECRET_KEY` | Your Stripe secret key / Stripe 私钥 |
| `CORS_ORIGIN` | Leave blank for now, fill in after frontend is deployed / 先留空，前端部署后填入 |

> Do **not** set `PORT` — Railway injects it automatically.
> 不要设置 `PORT`，Railway 会自动注入。

### 4. Configure build & start commands / 配置构建和启动命令

In **Settings → Deploy**, confirm:
在 **Settings → Deploy** 中确认：

- Build Command: `npm run build`
- Start Command: `npm run start`

### 5. Generate domain / 生成域名

In **Settings → Networking → Generate Domain**, enter the port shown in the deploy logs.
在 **Settings → Networking → Generate Domain** 中填入日志里显示的端口号。

### 6. Create Vercel project for the frontend / 为前端创建 Vercel 项目

1. Log in at [vercel.com](https://vercel.com)
2. **Add New Project → Import Git Repository**, Root Directory: `client`

### 7. Set environment variable / 设置环境变量

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your Railway backend URL, e.g. `https://xxx.up.railway.app` |

### 8. Update CORS_ORIGIN / 回填 CORS_ORIGIN

After the frontend is deployed, copy the Vercel URL and set it in Railway:
前端部署完成后，将 Vercel 域名填回 Railway：

```
CORS_ORIGIN=https://your-app.vercel.app
```
