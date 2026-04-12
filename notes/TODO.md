# Project TODO / 项目待办

> Recommended implementation order. Each phase builds on the previous.
> 按推荐顺序实施，每个阶段都依赖前一阶段的基础。

---

## Phase 1 — Refactoring & Code Quality / 重构与代码质量

> Clean up the existing codebase before building new features.
> 在新功能之上盖楼前先打好地基。

### State Management / 状态管理

- [x] Migrate all stores (`cart.ts`, `category.ts`, `checkout.ts`) from custom reactive to **Pinia**
  - 将所有 store 从自定义 reactive 迁移到 **Pinia**
- [x] Install and configure Pinia in `main.ts`
  - 在 `main.ts` 中安装并配置 Pinia

### Environment Variables / 环境变量

- [x] Create `client/.env` and `client/.env.example` with `VITE_API_URL`
  - 创建 `client/.env` 和 `client/.env.example`，添加 `VITE_API_URL`
- [x] Replace all hardcoded `http://localhost:8000` URLs in `Checkout.vue` (lines 310, 365) and `BookList.vue` (line 93) with `import.meta.env.VITE_API_URL`
  - 替换 `Checkout.vue` 中两处、`BookList.vue` 中一处硬编码的 `http://localhost:8000`

### Frontend Fixes / 前端修复

- [x] Replace `window.location.href = "/confirmation"` with `router.push("/confirmation")` in `Checkout.vue:384`
  - 将 `window.location.href` 跳转改为 `router.push()`
- [x] Replace `alert()` error messages with inline UI error messages (2 places in `Checkout.vue`)
  - 将 `alert()` 错误提示改为页面内 UI 错误信息（2处）
- [x] Fix email validation — remove DOM hack (`document.createElement("input")`), use a simple regex instead
  - 修复邮箱校验，移除 DOM hack，改用简单正则
- [x] Remove debug `console.log` from `Checkout.vue:278`
  - 删除 `Checkout.vue:278` 遗留的调试 `console.log`
- [x] Remove commented-out `console.log` block in `server/src/routes/orders.ts:23-27`
  - 删除 `orders.ts` 中被注释掉的 `console.log` 块

### Backend Fixes / 后端修复

- [x] Add input validation to `POST /orders` using **Zod** (validate types, lengths, required fields)
  - 使用 **Zod** 为 `POST /orders` 添加入参校验
- [x] Move price calculation to the backend — recalculate `subtotal`, `surcharge`, `total` from `bookId` + `quantity` using DB prices instead of trusting frontend values
  - 将金额计算移至后端，从数据库价格重新计算，不再信任前端传来的金额
- [x] Add CORS origin restriction in `app.ts` (only allow known frontend origin)
  - 在 `app.ts` 中限制 CORS 来源

---

## Phase 1.5 — Initial Deployment / 初次部署

> **Deploy right after Phase 1.** Phase 1 sets up env vars and removes hardcoded localhost URLs, making the codebase environment-ready. Deploy early so the portfolio is always live and production issues surface incrementally rather than all at once.
>
> **Phase 1 完成后立即部署。** Phase 1 配置了环境变量并移除了 localhost 硬编码，代码具备多环境部署能力。尽早部署让 portfolio 随时可访问，也能及早暴露生产环境特有问题，而不是最后一股脑爆发。
>
> After this, redeploy whenever a phase is completed. / 此后每完成一个阶段，重新部署一次即可。

### Recommended Stack / 推荐部署方案

> - **Frontend** (Vue + Vite static build): **Vercel** or **Netlify** — free, zero-config, auto-deploys on push
> - **Backend** (Express/Node.js): **Railway** or **Render** — both have free tiers suitable for small apps
> - **Database**: Already on **NeonDB** (serverless PostgreSQL) — no extra setup needed
> - **前端**（Vite 静态产物）：**Vercel** 或 **Netlify** — 免费、零配置、push 自动部署
> - **后端**（Express/Node.js）：**Railway** 或 **Render** — 均有适合小项目的免费 tier
> - **数据库**：已在 **NeonDB** 云端运行，无需额外配置

### Backend Deployment / 后端部署

- [x] Choose a hosting platform (Railway recommended) and create a new project
  - 选择托管平台（推荐 Railway），创建新项目
- [x] Set environment variables on the platform: `DATABASE_URL`, `PORT`
  - 在平台上配置环境变量：`DATABASE_URL`、`PORT`
- [x] Update CORS in `app.ts` to allow the production frontend URL (not `*`)
  - 在 `app.ts` 中将 CORS 来源更新为生产前端的真实域名
- [x] Add a `start` script to `server/package.json` (e.g. `node dist/server.js`) and verify the build works
  - 在 `server/package.json` 中添加 `start` 脚本，确认构建正常
- [x] Deploy and verify `GET /` health check responds correctly
  - 部署后验证 `GET /` 健康检查接口正常响应

### Frontend Deployment / 前端部署

- [x] Choose a hosting platform (Vercel recommended) and connect the GitHub repo
  - 选择托管平台（推荐 Vercel），连接 GitHub 仓库
- [x] Set environment variable `VITE_API_URL` to the deployed backend URL
  - 将 `VITE_API_URL` 环境变量设置为已部署的后端地址
- [x] Configure build settings: build command `npm run build`, output directory `dist`
  - 配置构建设置：构建命令 `npm run build`，输出目录 `dist`
- [x] Verify client-side routing works — add a rewrite rule so all paths serve `index.html` (required for Vue Router history mode)
  - 验证客户端路由正常：添加重写规则让所有路径都指向 `index.html`（Vue Router history 模式必需）
- [x] Do a full end-to-end smoke test on the live URL (browse → add to cart → checkout)
  - 在线上 URL 进行完整的端到端冒烟测试（浏览 → 加购 → 结账）

### After Each Subsequent Phase / 每完成一个阶段后

- [ ] Update any new environment variables on both platforms (e.g. `STRIPE_SECRET_KEY`, `JWT_SECRET` in later phases)
  - 在两个平台上更新新增的环境变量（如后续阶段的 `STRIPE_SECRET_KEY`、`JWT_SECRET`）
- [ ] Redeploy and smoke test the new functionality on the live URL
  - 重新部署并在线上验证新功能

---

## Phase 2 — Authentication System / 用户认证系统

> Users can register, log in, and have their orders linked to their account.
> 用户可以注册、登录，订单与账户绑定。

### Database / 数据库

- [x] Add `users` table to schema: `id`, `email` (unique), `passwordHash`, `name`, `createdAt`
  - 在 schema 中添加 `users` 表
- [x] Add `userId` foreign key to `orders` table (nullable for guest orders if needed)
  - 在 `orders` 表中添加 `userId` 外键
- [x] Generate and run Drizzle migration
  - 生成并运行 Drizzle 迁移

### Backend / 后端

- [x] Install `bcrypt` (password hashing) and `jsonwebtoken` (JWT)
  - 安装 `bcrypt` 和 `jsonwebtoken`
- [x] Create `POST /auth/register` — validate input, hash password, create user
  - 创建注册接口：校验入参、哈希密码、创建用户
- [x] Create `POST /auth/login` — verify credentials, return JWT (stored in httpOnly cookie)
  - 创建登录接口：验证凭据，返回 JWT（存入 httpOnly cookie）
- [x] Create `POST /auth/logout` — clear auth cookie
  - 创建登出接口：清除 auth cookie
- [x] Create `GET /auth/me` — return current user info from JWT
  - 创建 `/me` 接口：从 JWT 返回当前用户信息
- [x] Create `authMiddleware` — verify JWT on protected routes
  - 创建 `authMiddleware`，用于保护需要登录的路由
- [x] Protect `POST /orders` with `authMiddleware`
  - 用 `authMiddleware` 保护 `POST /orders`

### Frontend / 前端

- [x] Create `auth` Pinia store: `user`, `isLoggedIn`, `login()`, `logout()`, `fetchMe()`
  - 创建 `auth` Pinia store
- [x] Create `Login.vue` page with email + password form
  - 创建登录页
- [x] Create `Register.vue` page with name + email + password form
  - 创建注册页
- [x] Add login/register links + logout button to `AppHeader.vue`
  - 在 header 中添加登录/注册链接和退出按钮
- [x] Add route guard: redirect unauthenticated users from `/checkout` to `/login`
  - 添加路由守卫：未登录用户访问结账页时跳转登录页

---

## Phase 3 — Stripe Payment Integration / Stripe 支付集成

> Replace the raw card number approach with Stripe's test mode. No real card data ever touches the server.
> 用 Stripe 测试模式替换原有的明文卡号方案，真实卡号不经过自己的服务器。

### Setup / 配置

- [x] Create Stripe account and get test mode API keys (`pk_test_...` / `sk_test_...`)
  - 创建 Stripe 账号，获取测试模式 API key
- [x] Add `STRIPE_SECRET_KEY` to `server/.env`
  - 将 `STRIPE_SECRET_KEY` 添加到 `server/.env`
- [x] Add `VITE_STRIPE_PUBLIC_KEY` to `client/.env`
  - 将 `VITE_STRIPE_PUBLIC_KEY` 添加到 `client/.env`
- [x] Install `stripe` on backend, `@stripe/stripe-js` on frontend
  - 后端安装 `stripe`，前端安装 `@stripe/stripe-js`

### Backend / 后端

- [x] Create `POST /payments/create-intent` — calculate order total from DB, create Stripe PaymentIntent, return `clientSecret`
  - 创建支付意图接口：从 DB 计算金额，创建 Stripe PaymentIntent，返回 `clientSecret`
- [x] Update `POST /orders` to accept Stripe `paymentIntentId` instead of card data; verify payment succeeded before saving order
  - 更新下单接口：接受 Stripe `paymentIntentId`，验证支付成功后再存订单
- [x] Remove `cardNumber`, `cardExpMonth`, `cardExpYear` from `customers` table schema and migration
  - 从 `customers` 表中删除明文卡号字段

### Frontend / 前端

- [x] Replace manual card input fields with **Stripe Elements** (`CardElement` or `PaymentElement`)
  - 用 **Stripe Elements** 替换手动信用卡输入字段
- [x] Add a clearly visible **"Test Mode" banner** on the checkout page — instruct users NOT to enter real card info, display test card numbers (e.g. `4242 4242 4242 4242`)
  - 在结账页添加醒目的**测试模式横幅**，告知用户不要输入真实卡号，并展示测试卡号
- [x] On submit: call `/payments/create-intent` → confirm payment via `stripe.confirmCardPayment()` → call `POST /orders` with `paymentIntentId`
  - 提交时：调用创建意图接口 → 用 Stripe SDK 确认支付 → 携带 `paymentIntentId` 提交订单
- [x] Replace `Math.random()` confirmation number with `crypto.randomUUID()` (or generate on backend)
  - 用 `crypto.randomUUID()` 替换 `Math.random()` 生成确认号（或改为后端生成）

---

## Phase 4 — Payment UI Redesign / 支付界面重设计

> Make checkout feel modern and trustworthy.
> 让结账流程更现代、更有可信度。

- [x] Redesign checkout layout — consider a **two-panel layout** (form left, order summary right, sticky)
  - 重新设计结账布局，考虑左侧表单 + 右侧固定订单摘要的双栏布局
- [x] Add a **step indicator** (e.g. Cart → Details → Payment → Confirmation)
  - 添加步骤指示器（如：购物车 → 填写信息 → 支付 → 确认）
- [x] Add a reusable **Toast / Snackbar** notification component to replace all `alert()` calls
  - 添加可复用的 Toast 通知组件，替换所有 `alert()` 调用
- [x] Improve inline form error styling (icons, better colour contrast)
  - 改善表单内联错误样式（图标、更好的颜色对比度）
- [x] Add loading skeleton or progress indicator during payment processing
  - 支付处理中添加加载骨架屏或进度提示
- [x] Make the confirmation page more polished — add a success animation, print/download receipt button
  - 美化确认页：添加成功动画，添加打印/下载收据按钮

---

## Phase 5 — Dark / Light Mode / 深色 / 浅色模式

- [ ] Add `dark` theme to DaisyUI config in `tailwind.config.js` (alongside existing `light`)
  - 在 `tailwind.config.js` 中为 DaisyUI 添加 `dark` 主题
- [ ] Update CSS variables in `main.css` to include dark-mode token variants
  - 在 `main.css` 中为暗色模式添加 CSS 变量变体
- [ ] Create a `theme` Pinia store that persists preference to `localStorage`
  - 创建 `theme` Pinia store，将偏好持久化到 `localStorage`
- [ ] Add a **theme toggle button** (sun/moon icon) to `AppHeader.vue`
  - 在 `AppHeader.vue` 中添加主题切换按钮（太阳/月亮图标）
- [ ] Apply `data-theme` attribute to `<html>` based on store value
  - 根据 store 值将 `data-theme` 属性应用到 `<html>`
- [ ] Audit all pages and components for hardcoded colours that break in dark mode
  - 检查所有页面和组件，修复在暗色模式下显示异常的硬编码颜色

---

## Phase 6 — Orders History & Receipts / 订单历史与收据

> Authenticated users can view all their past orders and re-print receipts.
> 已登录用户可以查看所有历史订单并重新打印收据。

### Backend / 后端

- [x] Create `GET /orders` (protected) — return all orders for the logged-in user with line items
  - 创建 `GET /orders`（需登录）：返回当前用户的所有订单及明细
- [x] Create `GET /orders/:id` (protected) — return single order detail (verify ownership)
  - 创建 `GET /orders/:id`（需登录）：返回单条订单详情（验证归属权）

### Frontend / 前端

- [x] Create `Orders.vue` page — list of all past orders (date, confirmation #, total)
  - 创建订单列表页：展示日期、确认号、金额等
- [x] Create `OrderDetail.vue` page — full receipt view with itemized breakdown
  - 创建订单详情页：完整收据，含明细分解
- [x] Add `/orders` and `/orders/:id` protected routes to router
  - 在 router 中添加受保护的订单相关路由
- [x] Add "My Orders" link to `AppHeader.vue` (visible only when logged in)
  - 在 header 中添加"我的订单"链接（仅登录后显示）
- [x] Add "View Order History" link on the confirmation page
  - 在确认页添加"查看订单历史"链接

---

## Phase 7 — Testing / 测试

> Aim for confidence, not 100% coverage. Focus on critical paths.
> 目标是信心，而非100%覆盖率。聚焦关键路径。

### Setup / 配置

- [ ] Install and configure **Vitest** for frontend unit/component tests
  - 安装并配置 **Vitest** 用于前端单元/组件测试
- [ ] Install **Supertest** + **Vitest** (or Jest) for backend API tests
  - 安装 **Supertest** 用于后端 API 测试
- [ ] Set up test database or mock for backend tests
  - 为后端测试配置测试数据库或 mock

### Frontend Tests / 前端测试

- [ ] Unit tests for Pinia stores (`cart`, `auth`, `theme`)
  - 为 Pinia stores 编写单元测试
- [ ] Unit tests for utility functions (price calculation, confirmation number generation)
  - 为工具函数编写单元测试（金额计算、确认号生成）
- [ ] Component tests for `BookList.vue` (renders books, add-to-cart interaction)
  - 为 `BookList.vue` 编写组件测试
- [ ] Component tests for `Cart.vue` (quantity update, remove item, total calculation)
  - 为 `Cart.vue` 编写组件测试
- [ ] Component tests for `Checkout.vue` form validation
  - 为 `Checkout.vue` 表单校验编写测试

### Backend Tests / 后端测试

- [ ] API tests for `GET /books` and `GET /categories`
  - 为书籍和分类接口编写 API 测试
- [ ] API tests for `POST /auth/register` and `POST /auth/login`
  - 为注册和登录接口编写测试
- [ ] API tests for `POST /orders` (valid payload, invalid payload, unauthenticated)
  - 为下单接口编写测试（合法/非法参数、未登录）
- [ ] API tests for `GET /orders` (authenticated, verify ownership)
  - 为订单历史接口编写测试

---

## Future Ideas / 未来想法

> Not in scope for now, but worth considering later.
> 暂不在计划内，但值得日后考虑。

### Features / 功能

- [ ] **Book search** — full-text search bar in the header
  - 书籍搜索：header 中的全文搜索栏
- [ ] **Book detail page** — dedicated page per book with description and author info
  - 书籍详情页：含描述、作者信息
- [ ] **Pagination** — paginate book listings instead of loading all at once
  - 分页：书籍列表分页加载
- [ ] **Email confirmation** — send order receipt to user's email via SendGrid / Resend
  - 邮件确认：通过 SendGrid/Resend 发送订单收据到邮箱
- [ ] **Book ratings & reviews** — let users leave ratings after purchase
  - 书籍评分与评论：允许用户购买后留下评价
- [ ] **Wishlist / Saved items** — save books for later
  - 收藏/心愿单：保存感兴趣的书籍
- [ ] **Admin panel** — manage books, categories, and view all orders
  - 管理后台：管理书籍、分类、查看所有订单

### Technical / 技术

- [ ] **Dockerize** the project — `docker-compose.yml` for one-command local setup
  - Docker 化：用 `docker-compose.yml` 实现一键本地启动
- [ ] **CI/CD pipeline** — GitHub Actions for lint + test on every PR
  - CI/CD 流水线：GitHub Actions 在每次 PR 时自动 lint + 测试
- [ ] **Rate limiting** — protect API endpoints from abuse with `express-rate-limit`
  - 接口限流：用 `express-rate-limit` 保护 API 接口
- [ ] **Structured logging** — server-side logging with `pino` or `winston`
  - 结构化日志：使用 `pino` 或 `winston` 记录服务端日志
- [ ] **OpenAPI / Swagger docs** — auto-generate API documentation
  - OpenAPI/Swagger 文档：自动生成 API 文档
