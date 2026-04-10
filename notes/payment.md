# Payment Implementation / 支付实现说明

## Overview / 概述

This project uses **Stripe (test mode)** for payment processing. Card details are collected by **Stripe Elements** in the browser and sent directly to Stripe — they never touch our backend. The server only stores a Stripe `paymentIntentId` reference for each order.

本项目使用 **Stripe（测试模式）** 处理支付。卡号通过 **Stripe Elements** 在浏览器端收集，直接发送给 Stripe，不经过自己的后端。服务端仅存储每个订单对应的 Stripe `paymentIntentId` 引用。

---

## Architecture / 架构

```
User Browses / 用户浏览
        ↓
Add to Cart / 加入购物车  →  localStorage (cart.ts)
        ↓
Cart Page / 购物车页面  →  allowCheckout() flag set / 设置访问标志
        ↓
Checkout Form / 结账表单  →  Stripe Elements (CardElement) / 卡号在 Stripe Elements 中输入
        ↓
Submit / 提交  →  ① POST /payments/create-intent  (server recomputes total)
              →  ② stripe.confirmCardPayment(clientSecret)  (card → Stripe directly)
              →  ③ POST /orders { paymentIntentId }  (server verifies + persists)
        ↓
Confirmation Page / 确认页  →  sessionStorage
```

---

## End-to-End Flow / 端到端流程

### 1. Cart Stage / 购物车阶段

**Files:** `client/src/views/Cart.vue`, `client/src/store/cart.ts`

- Cart data is persisted in `localStorage`.
- Clicking "Checkout" calls `checkoutStore.allowCheckout()`, setting an access flag that prevents users from bypassing the cart by navigating directly to `/checkout`.

- 购物车数据存储在 `localStorage` 中持久化。
- 点击 "Checkout" 按钮时调用 `checkoutStore.allowCheckout()`，设置访问标志，防止用户直接通过 URL 跳过购物车访问结账页。

---

### 2. Checkout Access Guard / 结账访问守卫

**Files:** `client/src/store/checkout.ts`, `client/src/router/index.ts`, `client/src/views/Cart.vue`

The checkout route is protected by a `beforeEnter` route guard combined with a reactive flag in `checkoutStore`.

结账路由通过 `beforeEnter` 路由守卫配合 `checkoutStore` 中的响应式标志共同保护。

**State / 状态** (`checkout.ts`):
```ts
const checkoutState = reactive({
  canAccessCheckout: false,  // default: blocked / 默认拒绝
});
```

**Flag is set to `true` / 标志设为 `true`** (`Cart.vue:141-144`):
```ts
const goToCheckout = () => {
  checkoutStore.allowCheckout();  // only reachable via Cart page "Checkout" button
  router.push("/checkout");       // 只有购物车页面的按钮才能触发
};
```

**Route guard checks the flag / 路由守卫检查标志** (`router/index.ts:36-43`):
```ts
beforeEnter: (to, from, next) => {
  const checkoutStore = useCheckoutStore();
  if (checkoutStore.canAccessCheckout()) {
    next();      // allow / 放行
  } else {
    next("/");   // redirect to home / 跳回首页
  }
},
```

**Result / 效果:**
```
Direct URL access /checkout  →  canAccessCheckout = false  →  redirected to /
直接访问 /checkout            →  canAccessCheckout = false  →  跳回首页

Cart "Checkout" button click  →  allowCheckout()  →  canAccessCheckout = true  →  allowed
购物车点击结账按钮             →  allowCheckout()  →  canAccessCheckout = true  →  放行
```

---

### 3. Checkout Form / 结账表单

**File:** `client/src/views/Checkout.vue`

- A route guard checks `canAccessCheckout`; users not coming from the cart are redirected to the home page.
- A prominent **Test Mode banner** lists Stripe test card numbers (`4242 4242 4242 4242`, etc.) and warns users not to enter real cards.
- Card details are collected via **Stripe Elements** (`CardElement`), mounted on `onMounted` and destroyed on `onBeforeUnmount`. Card data goes directly to Stripe — never to our backend.
- Phone validation uses the `libphonenumber-js` library (US format).
- Order totals are calculated client-side for display only — the server recomputes them authoritatively from DB prices.

- 路由守卫检查 `canAccessCheckout` 标志，未经过购物车的用户将被重定向至首页。
- 醒目的**测试模式横幅**列出 Stripe 测试卡号（`4242 4242 4242 4242` 等），提醒用户不要输入真实卡号。
- 卡号通过 **Stripe Elements**（`CardElement`）收集，在 `onMounted` 挂载、`onBeforeUnmount` 销毁。卡数据直达 Stripe，不经过自己的后端。
- 电话校验使用 `libphonenumber-js` 库（美国号码格式）。
- 金额在前端仅用于展示，服务端根据 DB 价格权威重算。

---

### 3. Order Submission / 提交订单

**File:** `client/src/views/Checkout.vue` — `submitOrder()`

```
① POST /payments/create-intent  { items }
   → Server recomputes total from DB prices
   → Creates a Stripe PaymentIntent
   → Returns { clientSecret, paymentIntentId }
   → 服务端按 DB 价格重算总价，创建 Stripe PaymentIntent，
     返回 clientSecret 与 paymentIntentId

② stripe.confirmCardPayment(clientSecret, { payment_method: { card, billing_details } })
   → Stripe.js confirms the card payment using the mounted CardElement
   → Card details go directly to Stripe — never touch our server
   → 用 Stripe.js 通过挂载的 CardElement 完成支付确认
   → 卡号直接发送给 Stripe，不经过自己的服务器

③ POST /orders  { customer, items, paymentIntentId, date }
   → Server retrieves the PaymentIntent from Stripe
   → Verifies status === "succeeded" AND amount matches the recomputed total
   → Server generates a confirmation UUID and writes the order in a DB transaction
   → Returns { confirmationNumber, subtotal, surcharge, total, items }
   → 服务端从 Stripe 拉取 PaymentIntent，校验状态与金额，
     生成 confirmation UUID，并在事务中写入数据库

④ Clear cart  /  清空购物车

⑤ Save order details to sessionStorage → router.push("/confirmation")
   订单详情存入 sessionStorage → 跳转到确认页
```

**Order request payload / 订单请求结构:**
```json
{
  "customer": {
    "name": "...",
    "address": "...",
    "phone": "...",
    "email": "..."
  },
  "items": [{ "bookId": 1, "quantity": 2 }],
  "paymentIntentId": "pi_...",
  "date": "2024-01-01T00:00:00.000Z"
}
```

**Order response / 订单响应结构:**
```json
{
  "success": true,
  "confirmationNumber": "550e8400-e29b-41d4-a716-446655440000",
  "subtotal": 19.98,
  "surcharge": 1.00,
  "total": 20.98,
  "items": [{ "bookId": 1, "name": "...", "price": 9.99, "quantity": 2 }]
}
```

---

### 4. Backend Processing / 后端处理

**Files:** `server/src/routes/orders.ts`, `server/src/routes/payments.ts`

`POST /orders` uses a **database transaction** to atomically write to 3 tables:

`POST /orders` 使用**数据库事务（transaction）**原子性地写入3张表：

| Table / 表 | Contents / 内容 |
|---|---|
| `customers` | Name, address, phone, email (no card data) / 姓名、地址、电话、邮箱（不含卡数据） |
| `orders` | UUID confirmation number, date, customer FK, user FK (nullable), Stripe `paymentIntentId` / UUID 确认号、日期、客户外键、用户外键（可空）、Stripe paymentIntentId |
| `line_items` | bookId + quantity per item / 每本书的 bookId 与数量 |

Before writing, the server retrieves the PaymentIntent from Stripe and rejects the order unless `status === "succeeded"` AND the amount matches the server-recomputed total.

写库之前，服务端先从 Stripe 拉取 PaymentIntent，必须满足 `status === "succeeded"` 且金额与服务端重算的总价一致，才会继续写入。

**Endpoints / 接口:**
- `POST /payments/create-intent` (auth required) — recomputes total from DB, creates a Stripe PaymentIntent, returns `clientSecret` + `paymentIntentId` / 重算金额，创建 Stripe PaymentIntent，返回 `clientSecret` 与 `paymentIntentId`
- `POST /orders` (auth required) — verifies the PaymentIntent with Stripe, generates a UUID confirmation number, writes the order / 通过 Stripe 校验 PaymentIntent，生成 UUID 确认号并写库

---

### 5. Confirmation Page / 确认页

**File:** `client/src/views/Confirmation.vue`

- Reads order details from `sessionStorage`.
- Displays customer info, line items, totals, and the server-generated confirmation UUID.
- Redirects to home if accessed without order data in session.

- 从 `sessionStorage` 读取订单数据并展示。
- 显示客户信息、订单项、金额，以及服务端生成的 UUID 确认号。
- 若无 session 中的订单数据直接访问则跳回首页。

---

## Database Schema / 数据库结构

**ORM:** Drizzle ORM + PostgreSQL (NeonDB)

```
users
├── id (PK)
├── email (unique)
├── passwordHash
├── name
└── createdAt

customers
├── id (PK)
├── name
├── address
├── phone
└── email

orders
├── id (PK)
├── confirmationNumber (unique, UUID)
├── date
├── customerId (FK → customers.id)
├── userId (FK → users.id, nullable)   ← guest orders allowed
└── paymentIntentId (Stripe, nullable) ← legacy orders may be null

line_items
├── id (PK)
├── orderId (FK → orders.id)
├── bookId (FK → books.id)
└── quantity
```

---

## Tech Stack / 技术栈

| Layer / 层 | Technology / 技术 |
|---|---|
| UI Framework / UI 框架 | Vue 3 |
| Routing / 路由 | Vue Router 4 |
| State Management / 状态管理 | Pinia |
| Payment / 支付 | Stripe (test mode) + `@stripe/stripe-js` |
| Phone Validation / 电话校验 | `libphonenumber-js` |
| Styling / 样式 | Tailwind CSS + DaisyUI |
| Backend / 后端 | Express |
| Auth / 认证 | bcrypt + JWT (httpOnly cookie) |
| Validation / 入参校验 | Zod |
| ORM | Drizzle ORM |
| Database / 数据库 | PostgreSQL (NeonDB) |

---

## Issues & Outdated Patterns / 问题与过时写法

> This is a portfolio project. The following issues **must** be addressed before any production deployment.
>
> 这是一个 portfolio 项目，以下问题在**生产环境部署前必须处理**。

### Security Issues / 安全问题

**1. Raw card number stored in plaintext / 完整信用卡号明文存储**

`Checkout.vue` sends the full card number to the backend, which writes it directly to the `customers.card_number` column. This violates PCI DSS and exposes users to severe data breach risk.

`Checkout.vue` 将完整卡号发送到后端并直接写入数据库，违反 PCI DSS 标准，一旦数据库泄露后果严重。

> Fix: Integrate Stripe.js — the card number never touches your server. Stripe returns a token you store instead.
>
> 修复：接入 Stripe.js，卡号不经过自己的服务器，Stripe 返回 token 存储即可。

---

**2. Order totals trusted from frontend / 订单金额完全信任前端**

`subtotal`, `surcharge`, and `total` are calculated in the browser and sent as part of the order payload (`Checkout.vue:358-361`). The backend (`orders.ts`) stores whatever it receives without recalculating. A malicious user could tamper with the request body and submit any price.

订单金额在浏览器端计算后直接发给后端（`Checkout.vue:358-361`），后端不做任何验证就存入数据库。恶意用户可以篡改请求体，提交任意金额。

> Fix: Remove totals from the payload. Let the backend recalculate from `bookId` + `quantity` using prices fetched from the database.
>
> 修复：从 payload 中移除金额字段，由后端根据 `bookId` + `quantity` 从数据库重新计算。

---

**3. No input validation on the backend / 后端无任何输入校验**

`orders.ts` blindly inserts whatever arrives in `req.body` into the database. There is no type checking, length limit, or sanitization. This opens the door to malformed data and potential injection.

`orders.ts` 直接将 `req.body` 的内容插入数据库，没有类型检查、长度限制或内容过滤，存在脏数据和注入风险。

> Fix: Add a validation layer with `zod` or `express-validator` before touching the database.
>
> 修复：在操作数据库前用 `zod` 或 `express-validator` 校验入参。

---

**4. No CVV field / 没有 CVV 字段**

Real payment forms always require a CVV/CVC. Omitting it means even basic card fraud checks are skipped.

真实支付表单必须要求 CVV/CVC，缺少这个字段意味着连基本的卡片欺诈检测都无法进行。

---

### Logic Issues / 逻辑问题

**5. Race condition in confirmation number generation / 确认号生成存在竞态条件**

`generateConfirmationNumber()` works in two steps: check uniqueness → generate number. Between these two steps, another request could claim the same number (TOCTOU). In practice this is unlikely, but the correct fix is to let the database enforce uniqueness (the `UNIQUE` constraint already exists) and handle the conflict on insert rather than pre-checking.

`generateConfirmationNumber()` 分两步执行：生成号码 → 检查唯一性。两步之间存在窗口期，另一个请求可能同时拿到相同的号码（TOCTOU 问题）。正确做法是依赖数据库的 `UNIQUE` 约束，在插入时捕获冲突并重试，而不是提前查询。

---

**6. `Math.random()` is not cryptographically secure / `Math.random()` 不是密码学安全的随机数**

`Math.random()` is predictable and should not be used for anything security-sensitive. For confirmation numbers, use `crypto.getRandomValues()` instead.

`Math.random()` 是可预测的伪随机数，不应用于任何安全敏感场景。应改用 `crypto.getRandomValues()`。

```ts
// Current / 现在
Math.floor(100000000 + Math.random() * 900000000)

// Better / 更好
const arr = new Uint32Array(1);
crypto.getRandomValues(arr);
const num = 100000000 + (arr[0] % 900000000);
```

---

### Code Quality Issues / 代码质量问题

**7. Hardcoded `localhost` API URLs / API 地址硬编码为 `localhost`**

`http://localhost:8000` appears twice in `Checkout.vue` (lines 310, 365). This breaks immediately in any non-local environment.

`Checkout.vue` 中两处硬编码了 `http://localhost:8000`（第310、365行），在任何非本地环境中都无法工作。

> Fix: Use `import.meta.env.VITE_API_URL` from a `.env` file.
>
> 修复：改用 `.env` 文件中的 `import.meta.env.VITE_API_URL`。

---

**8. `window.location.href` instead of `router.push()` / 用 `window.location.href` 跳转而非 `router.push()`**

`Checkout.vue:384` uses `window.location.href = "/confirmation"`, which triggers a full page reload and discards Vue's in-memory state. In a Vue SPA, `router.push("/confirmation")` is the correct approach.

`Checkout.vue:384` 用 `window.location.href` 跳转，会触发整页重载，丢失 Vue 内存状态。Vue SPA 中应使用 `router.push("/confirmation")`。

---

**9. `alert()` for error messages / 用 `alert()` 显示错误**

`Checkout.vue` uses `alert()` in two places (lines 328, 387) for error feedback. `alert()` is blocking, non-styleable, and a poor UX. Should be replaced with an inline error message or a toast notification.

`Checkout.vue` 有两处用 `alert()` 显示错误（第328、387行）。`alert()` 是阻塞式的、无法自定义样式，体验差。应改为页面内错误提示或 toast 通知。

---

**10. Email validated via a dummy DOM element / 邮箱校验依赖隐藏 DOM 元素**

`validateEmail()` creates a hidden `<input type="email">` element just to call `.checkValidity()`. This is a hack that relies on browser internals.

`validateEmail()` 创建了一个隐藏的 `<input type="email">` 元素来调用 `.checkValidity()`，这是一种依赖浏览器内部实现的 hack 写法。

> Fix: Use a simple regex or the `validator.js` library.
>
> 修复：改用简单正则或 `validator.js` 库。

---

**11. Debug `console.log` left in production code / 遗留的调试日志**

`Checkout.vue:278` has `console.log("potentially valid: ", ...)` that was never removed. Exposes internal state in the browser console.

`Checkout.vue:278` 有一行未删除的 `console.log`，会在浏览器控制台暴露内部状态。

---

**12. US-only phone validation / 电话号码只支持美国格式**

`libphonenumber-js` is called with a hardcoded `"US"` locale (`Checkout.vue:232`), rejecting all non-US phone numbers.

`libphonenumber-js` 传入了硬编码的 `"US"` 地区（`Checkout.vue:232`），会拒绝所有非美国号码。

---

### Summary / 汇总

| # | Category / 类别 | Issue / 问题 | Severity / 严重程度 |
|---|---|---|---|
| 1 | Security | Plaintext card number in DB / 明文卡号存数据库 | Critical |
| 2 | Security | Frontend-trusted order totals / 信任前端金额 | High |
| 3 | Security | No backend input validation / 无后端校验 | High |
| 4 | Security | No CVV field / 缺少 CVV | Medium |
| 5 | Logic | TOCTOU race condition / 确认号竞态条件 | Low |
| 6 | Logic | `Math.random()` for IDs / 不安全随机数 | Low |
| 7 | Code Quality | Hardcoded `localhost` URLs / 硬编码地址 | High |
| 8 | Code Quality | `window.location.href` in SPA / 非 SPA 跳转方式 | Medium |
| 9 | Code Quality | `alert()` for errors / 阻塞式错误提示 | Low |
| 10 | Code Quality | DOM hack for email validation / DOM hack 校验邮箱 | Low |
| 11 | Code Quality | Debug `console.log` not removed / 遗留调试日志 | Low |
| 12 | Code Quality | US-only phone validation / 仅支持美国电话 | Low |
