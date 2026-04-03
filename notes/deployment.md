# Deployment Guide / 部署指南

---

## Backend — Railway / 后端部署（Railway）

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
| `DATABASE_URL` | Your Neon database connection string / Neon 数据库连接字符串 |
| `CORS_ORIGIN` | Leave blank for now, fill in after frontend is deployed / 先留空，前端部署后填入 |

> Do **not** set `PORT` — Railway injects it automatically.
> 不要设置 `PORT`，Railway 会自动注入。

### 4. Configure build & start commands / 配置构建和启动命令

In **Settings → Deploy**, confirm:
在 **Settings → Deploy** 中确认：

- Build Command: `npm run build`
- Start Command: `npm run start`

### 5. Generate domain / 生成域名

In **Settings → Networking → Generate Domain**:
在 **Settings → Networking → Generate Domain**：

- Check the deploy logs for the actual port (e.g. `Server running on http://localhost:8080`)
  查看部署日志确认实际端口（例如 `Server running on http://localhost:8080`）
- Enter that port number when prompted
  在弹窗中填入该端口号

### 6. Verify / 验证

Visit `https://your-railway-domain.up.railway.app/`
访问 `https://你的域名.up.railway.app/`

Expected response / 预期响应：
```
Welcome to the Bookstore API!
```

---

## Frontend — Vercel / 前端部署（Vercel）

### 7. Create Vercel project / 创建 Vercel 项目

1. Log in at [vercel.com](https://vercel.com)
   登录 [vercel.com](https://vercel.com)
2. Click **Add New Project → Import Git Repository**, select your repo, set Root Directory to `client`
   点击 **Add New Project → Import Git Repository**，选择仓库，Root Directory 设为 `client`

### 8. Configure build settings / 配置构建设置

Vercel auto-detects Vite. Confirm:
Vercel 会自动识别 Vite，确认以下配置：

- Build Command: `npm run build`
- Output Directory: `dist`

### 9. Set environment variable / 设置环境变量

In **Settings → Environment Variables**:
在 **Settings → Environment Variables** 中添加：

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your Railway backend URL / Railway 后端域名，例如 `https://xxx.up.railway.app` |

### 10. Deploy / 部署

Click Deploy and wait for completion. The `vercel.json` rewrite rule is already configured so Vue Router history mode works correctly.
点击 Deploy 等待完成。`vercel.json` 中已配置重写规则，Vue Router history 模式可正常工作。

---

## Finalise / 收尾

### 11. Update CORS_ORIGIN / 回填 CORS_ORIGIN

After the frontend is deployed, copy the Vercel URL and update the Railway variable:
前端部署完成后，将 Vercel 域名填回 Railway：

```
CORS_ORIGIN=https://your-app.vercel.app
```

Railway will automatically restart the service.
Railway 会自动重启服务。

### 12. End-to-end smoke test / 端到端冒烟测试

Walk through the full flow on the live URL:
在线上地址走一遍完整流程：

- [ ] Home page loads, category nav works / 首页正常加载，分类导航可用
- [ ] Category page shows correct books / 分类页显示正确书目
- [ ] Add to cart, quantity updates correctly / 加入购物车，数量正确
- [ ] Cart page shows items, navigate to checkout / 购物车页正常，可进入结账
- [ ] Submit order, confirmation page shows correct details and totals / 提交订单，确认页显示正确信息和金额
