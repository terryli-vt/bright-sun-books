# Stripe Payment Integration / Stripe 支付集成

> A detailed walkthrough of the `POST /payments/create-intent` endpoint — what it does, why it exists, and how to build it step by step.
>
> 详细讲解 `POST /payments/create-intent` 这个端点：它是什么、为什么存在、以及如何一步步实现。

---

## 1. The Big Picture: Why Stripe Is Designed This Way / 大局观:为什么 Stripe 要这么设计

### 1.1 The Three Actors / 三个角色

Three parties are involved in the entire payment flow:

整个支付过程中有三方参与:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  User's     │      │   Your      │      │   Stripe    │
│  Browser    │      │   Backend   │      │   Backend   │
│  (Frontend) │      │  (Express)  │      │ (3rd party) │
└─────────────┘      └─────────────┘      └─────────────┘
```

- **User's Browser** — where the user enters the card number and clicks "Pay"
- **Your Backend** — the Express server you wrote, which manages your own database
- **Stripe Backend** — Stripe's servers, which actually talk to the bank and move money

- **用户浏览器** — 用户在这里输入卡号、点"支付"按钮
- **你的后端** — 你写的 Express 服务器,管你自己的数据库
- **Stripe 后端** — Stripe 公司的服务器,真正负责跟银行通信、扣钱

### 1.2 A Fundamental Question: Should Card Numbers Pass Through Your Server? / 一个根本问题:卡号能不能经过你的服务器?

**Answer: absolutely not.** Two reasons:

**答案是:绝对不要。** 原因有两个:

1. **Legal / compliance** — As soon as real card numbers touch your server, you must comply with a security standard called **PCI-DSS**. It's extremely strict (audits, encryption, isolated network segments) and a personal project simply cannot meet it.
2. **Security liability** — If your server is ever breached, every user's card number leaks, and you are legally liable for damages.

1. **法律 / 合规问题** — 只要真实卡号经过你的服务器,你就要遵守一套叫 **PCI-DSS** 的安全标准,这套标准非常严格(要审计、要加密、要专门的网络隔离),个人项目根本扛不住。
2. **安全责任问题** — 你的服务器一旦被黑,所有用户的卡号就泄露了,法律上你要赔。

So the core idea of Stripe's design is: **let card numbers go directly from the browser to Stripe, bypassing your server entirely**.

所以 Stripe 的核心设计就是:**让卡号从用户浏览器直接发给 Stripe,完全绕过你的服务器**。

```
Card number path (CORRECT / 正确):
Browser ──────────────────────────────► Stripe
        (bypass your backend / 绕过你的后端)

Card number path (WRONG, never do this / 错误,千万别这样):
Browser ──► Your Backend ──► Stripe
            (huge compliance and security burden / 巨大的合规和安全责任)
```

### 1.3 But Then How Does Stripe Know How Much to Charge? / 但是问题来了:那怎么知道扣多少钱?

If we let the browser tell Stripe directly "charge $0.01", users could open DevTools, change `$999` to `$0.01`, and steal everything in the store.

如果让浏览器直接告诉 Stripe"扣 0.01 元",用户可以打开浏览器开发者工具,把 999 元改成 0.01 元,然后白嫖整个商店。

So the amount **must be decided by your backend**, never by the browser.

所以金额 **必须由你的后端决定**,不能让浏览器决定。

### 1.4 Stripe's Solution: PaymentIntent / Stripe 的解决方案: PaymentIntent (支付意图)

Stripe introduces an object called **PaymentIntent** — think of it as **"a pending bill"**. The flow looks like this:

Stripe 设计了一个叫 **PaymentIntent** 的东西,可以理解成 **"一张待付款的账单"**。流程是这样的:

```
Step 1: Your backend tells Stripe "I want to collect $100"
        第 1 步:你的后端先告诉 Stripe "我要收 100 元"

        ┌─────────┐                    ┌─────────┐
        │ Backend │──── $100 ─────────►│ Stripe  │
        └─────────┘                    └─────────┘
                                            │
                                            ▼
                                  Stripe creates a PaymentIntent
                                  and returns a clientSecret
                                  (think: "the bill's password")
                                  Stripe 创建一个 PaymentIntent
                                  返回一个 clientSecret
                                  (可以理解为"账单的密码")

Step 2: Your backend hands the clientSecret to the frontend
        第 2 步:你的后端把 clientSecret 给前端

        ┌─────────┐                    ┌─────────┐
        │ Backend │── clientSecret ───►│ Browser │
        └─────────┘                    └─────────┘

Step 3: Browser uses the clientSecret + card number to call Stripe directly
        第 3 步:浏览器拿着 clientSecret + 卡号,直接调 Stripe

        ┌─────────┐                    ┌─────────┐
        │ Browser │── card+secret ────►│ Stripe  │
        └─────────┘                    └─────────┘
                                            │
                                            ▼
                                  Stripe actually charges the card
                                  Marks the "bill" as succeeded
                                  Stripe 真正扣款
                                  把这张"账单"标记为 succeeded

Step 4: Browser tells your backend "payment succeeded, please save the order"
        第 4 步:浏览器告诉你的后端"支付成功了,给我下单"

        ┌─────────┐                    ┌─────────┐
        │ Browser │── paymentIntentId─►│ Backend │
        └─────────┘                    └─────────┘
                                            │
                                            ▼
                                  Backend re-asks Stripe:
                                  "Was this bill really paid?"
                                  Only then does it write the DB
                                  后端再问一次 Stripe:
                                  "这张账单真的付了吗?"
                                  确认后才写数据库
```

**Key takeaways / 关键点:**

- The amount is decided by the **backend** (anti-tampering)
- The card number goes from the **browser directly to Stripe** (avoids compliance burden)
- Before saving the order, the backend **re-verifies** the status with Stripe (anti-forgery)

- 金额由 **后端** 决定(防篡改)
- 卡号由 **浏览器直接** 给 Stripe(避开合规)
- 下单前后端再 **二次核实** Stripe 那边的状态(防伪造)

---

## 2. Where `POST /payments/create-intent` Fits / 这个端点在整个流程里的位置

It is **Step 1** above — the backend telling Stripe "prepare a bill for $X".

它就是上面的 **第 1 步**:后端告诉 Stripe "准备一张 X 元的账单"。

**Why does it need its own endpoint? / 为什么需要单独一个端点?**

1. Creating a PaymentIntent requires `STRIPE_SECRET_KEY`, which can only live on the backend — never expose it to the browser.
2. The amount must be recalculated server-side from the database; you cannot trust the browser.
3. The frontend's Stripe Elements need a `clientSecret` to initialise — it must be ready **before** the user enters card details.

1. 创建 PaymentIntent 要用 `STRIPE_SECRET_KEY`,这个 key 只能在后端用,不能给浏览器
2. 金额必须由后端从数据库重算,不能信任浏览器
3. 在用户输入卡号 **之前** 就要先准备好 `clientSecret`,前端的 Stripe Elements 才能初始化

This endpoint **does not actually charge anyone** — it just says "hey Stripe, get ready to collect this much". The real charge happens in Step 3, directly between the browser and Stripe.

这个端点 **本身不扣钱**,只是"打个招呼,告诉 Stripe 我准备要收这个数"。真正扣钱发生在第 3 步,而且是浏览器直接和 Stripe 之间发生的。

---

## 3. Step-by-Step Implementation / 一步步实现

Each step explains both **what to do** and **why**.

每一步都说明 **做什么** 和 **为什么**。

### Step 1: Create a Stripe client instance / 步骤 1:创建一个 Stripe 客户端实例

**What:** Create [server/src/lib/stripe.ts](../server/src/lib/stripe.ts) and initialise the Stripe SDK there.

**做什么:** 新建文件 `server/src/lib/stripe.ts`,里面初始化 Stripe SDK。

**Why:**

- The `stripe` npm package wraps the Stripe API so you don't have to write raw HTTP requests.
- Putting initialisation in one file means every route can `import` the same instance — no duplication.
- Checking `STRIPE_SECRET_KEY` at startup makes the server fail loudly on boot if it's missing, instead of silently failing on the first payment attempt.

**为什么:**

- Stripe SDK 是一个 npm 包(`stripe`),用它可以方便地调 Stripe 的 API,而不用自己手写 HTTP 请求
- 把初始化代码单独放一个文件,以后多个路由都可以 `import` 它,不用每个文件都重复初始化
- 启动时检查 `STRIPE_SECRET_KEY` 是否存在,如果没配会立刻报错——比"等到第一次有人付款才发现"好得多

```ts
// server/src/lib/stripe.ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

---

### Step 2: Create the payments route file / 步骤 2:新建 payments 路由文件

**What:** Create [server/src/routes/payments.ts](../server/src/routes/payments.ts) with an empty router skeleton.

**做什么:** 新建 `server/src/routes/payments.ts`,先把空的路由结构搭起来。

**Why:** You already have `books.ts`, `orders.ts`, `auth.ts` — one file per concern. Payment logic deserves its own file, matching the existing layout.

**为什么:** 你现在有 `books.ts`、`orders.ts`、`auth.ts` 等路由,每个职责一类。支付逻辑独立成一个文件,符合现有的代码组织方式。

```ts
// server/src/routes/payments.ts
import express from "express";
const router = express.Router();

// All the code below goes here / 接下来的代码都加在这里

export default router;
```

---

### Step 3: Mount the route in app.ts / 步骤 3:在 app.ts 里挂载这个路由

**What:** Add `app.use("/payments", paymentsRouter)` in [server/src/app.ts](../server/src/app.ts).

**做什么:** 在 `server/src/app.ts` 里加一行 `app.use("/payments", paymentsRouter)`。

**Why:** Routers must be attached to the Express app to be reachable. Mounting under `/payments` means a route defined as `router.post("/create-intent", ...)` will live at `POST /payments/create-intent`.

**为什么:** Express 的路由必须挂到 app 上才能生效。挂在 `/payments` 前缀下,这样路由文件里写的 `router.post("/create-intent", ...)` 实际访问路径就是 `POST /payments/create-intent`。

---

### Step 4: Validate the request body with Zod / 步骤 4:定义请求体的校验规则(Zod)

**What:** Use Zod to declare what fields the frontend must send.

**做什么:** 用 Zod 定义前端要传什么字段。

**Why:**

- This matches the habit you established in Phase 1 — never trust incoming data.
- If the frontend sends garbage (negative `quantity`, non-numeric `bookId`), Zod rejects it before any business logic runs.

**为什么:**

- 这是你 Phase 1 已经在 `orders.ts` 里建立的习惯——所有进来的数据都先校验,不信任前端
- 如果前端传错了(比如 `quantity` 是负数、`bookId` 不是数字),Zod 会立刻拒绝,不让坏数据进入业务逻辑

**What does the frontend send?** Only the cart contents (`bookId` + `quantity`). **Never the amount** — the backend computes that.

**前端会传什么?** 只需要传购物车里的商品列表(`bookId` 和 `quantity`),**绝对不要传金额**——金额由后端算。

```ts
const createIntentSchema = z.object({
  items: z
    .array(
      z.object({
        bookId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1), // at least one item / 至少要有 1 个商品
});
```

---

### Step 5: Look up real prices in the database / 步骤 5:从数据库取真实价格

**What:** Given the list of `bookId`s, fetch their actual prices from the DB.

**做什么:** 拿到 `bookId` 列表后,从数据库查这些书的真实价格。

**Why:** This is the entire reason this endpoint exists — **the amount must be derived from real DB data, not from anything the frontend sends**. The frontend can be tampered with; the database (assuming it's not compromised) cannot.

**为什么:** 这就是这个端点存在的核心意义——**金额必须由数据库的真实数据算出来,而不是相信前端**。前端可能被篡改,数据库不会(除非数据库本身被攻破,那是另一回事)。

This logic is identical to [orders.ts:54-67](../server/src/routes/orders.ts#L54-L67) and can be copied directly:

这段逻辑和 `orders.ts:54-67` 完全一样,你可以直接照搬:

```ts
const bookIds = items.map((i) => i.bookId);
const bookRows = await db
  .select({ id: books.id, price: books.price })
  .from(books)
  .where(inArray(books.id, bookIds));

const bookMap = new Map(bookRows.map((b) => [b.id, b]));

// Verify every bookId actually exists / 校验前端传的 bookId 是否都真实存在
const missingId = bookIds.find((id) => !bookMap.has(id));
if (missingId) {
  res.status(400).json({ success: false, error: `Book ${missingId} not found` });
  return;
}
```

**Why the "missing" check?** If the frontend sends a bogus `bookId` (e.g. 999999), `bookMap.get(...)!.price` would crash. Returning a clean 400 is better than a server crash.

**为什么要做"missing 检查"?** 万一前端传了一个不存在的 `bookId`(比如 999999),后面 `bookMap.get(...)!.price` 会崩溃。明确返回 400 比让服务器崩溃好得多。

---

### Step 6: Calculate the total / 步骤 6:计算总金额

**What:** Multiply DB price by quantity and compute `subtotal`, `surcharge`, `total`.

**做什么:** 用数据库价格 × 数量,算出 subtotal、surcharge、total。

**Why:** The 5% surcharge rule must match `orders.ts` exactly — otherwise the user sees "$105" but is charged "$100", which is a real-money bug.

**为什么:** 同样的 5% 附加费规则,要和 `orders.ts` 保持一致——否则用户看到"账单 105 元"但实际扣了 100 元,会出问题。

```ts
const subtotal = items.reduce(
  (sum, i) => sum + bookMap.get(i.bookId)!.price * i.quantity,
  0
);
const surcharge = subtotal * 0.05;
const total = subtotal + surcharge;
```

> **Note:** This duplicates `orders.ts`. **Don't extract a helper yet** — wait until `orders.ts` is also refactored (Phase 3 second item), then extract once with two real callers in front of you. Refactoring with two concrete callers is much clearer than refactoring with one.
>
> **注意:** 这里和 `orders.ts` 是重复逻辑。**先别急着抽函数**,等 `orders.ts` 改造完之后(Phase 3 第二条),再一起抽——一次抽两个调用点比一次抽一个更清楚该怎么抽。

---

### Step 7: Convert the amount to cents / 步骤 7:把金额转成"美分"

**What:** Multiply `total` (in dollars) by 100 and round to the nearest integer.

**做什么:** 把 `total`(单位:元/美元)乘以 100 并四舍五入,变成整数美分。

**Why: this is the most common Stripe pitfall.** Stripe's API always uses the **smallest currency unit**:

**为什么: 这是 Stripe 最容易踩的坑!** Stripe 的 API 一律用「最小货币单位」表示金额:

- USD → cents (1 dollar = 100 cents) / 美元 → 美分(1 美元 = 100 美分)
- CNY → fen (1 yuan = 100 fen) / 人民币 → 分(1 元 = 100 分)
- JPY → yen (no decimals, do **not** multiply by 100) / 日元 → 日元(没有小数,不乘 100)

If you forget the `* 100` and pass `100` (meaning $100), Stripe will read it as 100 cents = **$1**, and your customer gets 99% off.

If you skip rounding and pass `10.5 * 100 = 1050.0000001` (floating-point error), Stripe will reject it because it requires an integer.

如果你不乘 100,直接传 `100`(本意是 100 美元),Stripe 会理解成 100 美分,也就是 **1 美元**——你的客户白嫖 99%。

如果你不四舍五入直接传 `10.5 * 100 = 1050.0000001`(浮点数误差),Stripe 会拒绝接受,因为它要的是整数。

```ts
const amountInCents = Math.round(total * 100);
```

---

### Step 8: Create the PaymentIntent via Stripe / 步骤 8:调 Stripe 创建 PaymentIntent

**What:** Call `stripe.paymentIntents.create(...)`. Stripe returns an object containing `id` and `client_secret`.

**做什么:** 用 Stripe SDK 调 `stripe.paymentIntents.create(...)`,Stripe 会返回一个对象,里面包含 `id` 和 `client_secret`。

**Why each parameter / 为什么这样写参数:**

- `amount`: how much to charge, in cents / 要收多少钱(美分)
- `currency`: e.g. `"usd"` for a US store / 货币单位,你的店是美元就写 `"usd"`
- `automatic_payment_methods: { enabled: true }`: lets Stripe decide which payment methods to show (card, Apple Pay, Google Pay…). For card-only, use `payment_method_types: ["card"]`. / 让 Stripe 自动决定显示哪些支付方式(卡、Apple Pay、Google Pay 等)。如果你只想要卡,可以改成 `payment_method_types: ["card"]`
- `metadata`: arbitrary tags you can attach (like `userId`). It doesn't affect the payment, but it makes Stripe's dashboard much easier to audit later. / 任意你想附加的信息,比如 `userId`。这个字段不影响支付,只是方便你之后在 Stripe 后台查账时知道"这笔支付是哪个用户的"

```ts
const intent = await stripe.paymentIntents.create({
  amount: amountInCents,
  currency: "usd",
  automatic_payment_methods: { enabled: true },
  metadata: {
    userId: String(req.userId ?? ""),
  },
});
```

---

### Step 9: Return the clientSecret to the frontend / 步骤 9:把 clientSecret 返回给前端

**What:** Send back `intent.client_secret` and `intent.id`.

**做什么:** 把 `intent.client_secret` 和 `intent.id` 一起返回。

**Why these two fields / 为什么返回这两个东西:**

- `client_secret` — the frontend's Stripe Elements need it to initialise the payment form. This is by Stripe's design: only with the secret can the frontend confirm the payment.
- `paymentIntentId` — when the frontend later calls `POST /orders`, it sends this back so the backend can re-verify the payment status with Stripe.

- `client_secret`:前端的 Stripe Elements 需要它来初始化支付表单(这是 Stripe 的设计,前端凭这个 secret 才能确认支付)
- `paymentIntentId`:之后调 `POST /orders` 时要把这个 id 一起传回来,后端会用它去 Stripe 二次核实"这笔支付是不是真的成了"

Why also return `subtotal/surcharge/total`? So the checkout page can display the amounts — and these come from the authoritative backend calculation, so the frontend just renders them without doing any math itself.

为什么还要返回 `subtotal/surcharge/total`?方便前端在结账页面显示金额——而且这个金额是后端权威算出来的,前端拿来显示就好,不用自己算。

```ts
res.json({
  clientSecret: intent.client_secret,
  paymentIntentId: intent.id,
  subtotal,
  surcharge,
  total,
});
```

---

### Step 10: Protect the route with authMiddleware / 步骤 10:加 `authMiddleware`

**What:** Add `authMiddleware` to the route definition.

**做什么:** 在路由定义里加 `authMiddleware`,要求登录才能调。

**Why:** `POST /orders` already requires login ([orders.ts:44](../server/src/routes/orders.ts#L44)). Since `create-intent` is a prerequisite for ordering, it should require login too — otherwise unauthenticated users could call `create-intent` but not `POST /orders`, which is a confusing UX.

**为什么:** 你现在的 `POST /orders` 已经要求登录了(`orders.ts:44`)。`create-intent` 是下单的前置步骤,自然也要求登录。否则未登录用户能调 `create-intent`、却调不动 `POST /orders`,体验很奇怪。

```ts
router.post("/create-intent", authMiddleware, async (req: AuthRequest, res) => {
  // ...
});
```

---

## 4. The Full File / 整段代码合在一起

[server/src/routes/payments.ts](../server/src/routes/payments.ts):

```ts
import express from "express";
import { z } from "zod";
import { inArray } from "drizzle-orm";
import { db } from "../db/drizzle";
import { books } from "../db/schema";
import { stripe } from "../lib/stripe";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = express.Router();

const createIntentSchema = z.object({
  items: z
    .array(
      z.object({
        bookId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

router.post("/create-intent", authMiddleware, async (req: AuthRequest, res) => {
  // Step 4: validate input / 步骤 4: 校验输入
  const result = createIntentSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, error: result.error.issues });
    return;
  }
  const { items } = result.data;

  try {
    // Step 5: fetch real prices from the DB / 步骤 5: 从 DB 取价格
    const bookIds = items.map((i) => i.bookId);
    const bookRows = await db
      .select({ id: books.id, price: books.price })
      .from(books)
      .where(inArray(books.id, bookIds));

    const bookMap = new Map(bookRows.map((b) => [b.id, b]));
    const missingId = bookIds.find((id) => !bookMap.has(id));
    if (missingId) {
      res.status(400).json({ success: false, error: `Book ${missingId} not found` });
      return;
    }

    // Step 6: compute the total on the backend / 步骤 6: 后端算金额
    const subtotal = items.reduce(
      (sum, i) => sum + bookMap.get(i.bookId)!.price * i.quantity,
      0
    );
    const surcharge = subtotal * 0.05;
    const total = subtotal + surcharge;

    // Step 7: convert to cents / 步骤 7: 转成美分
    const amountInCents = Math.round(total * 100);

    // Step 8: call Stripe / 步骤 8: 调 Stripe
    const intent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(req.userId ?? ""),
      },
    });

    // Step 9: respond to the frontend / 步骤 9: 返回给前端
    res.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      subtotal,
      surcharge,
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to create payment intent" });
  }
});

export default router;
```

---

## 5. How to Verify It Works / 验证它真的能跑

After implementing, sanity-check it with:

实现完之后,你可以用这几个方法验证:

1. **Check the Stripe Dashboard** — log in → Payments → you should see a PaymentIntent in `requires_payment_method` state (because no one has paid yet, you've only created the bill).
   **看 Stripe Dashboard** — 登录 Stripe 后台 → Payments → 应该能看到一条 `requires_payment_method` 状态的 PaymentIntent(因为还没人付钱,只是创建了"账单")

2. **Hit the endpoint with curl or Postman / 用 curl 或 Postman 调一下:**
   ```
   POST http://localhost:8000/payments/create-intent
   Cookie: <your auth cookie>
   Body: { "items": [{ "bookId": 1, "quantity": 2 }] }
   ```
   You should get back a `clientSecret` (a string like `pi_xxx_secret_xxx`).
   应该返回一个 `clientSecret`(以 `pi_xxx_secret_xxx` 开头的字符串)

3. **Send a bogus bookId on purpose** — should return 400.
   **故意传错的 bookId** — 应该返回 400

4. **Call without an auth cookie** — should return 401.
   **不带登录 cookie** — 应该返回 401

---

## 6. This Is Just the First Step — What Comes Next / 这只是第一步,后面还有什么?

`create-intent` is only the **start** of the Stripe flow. The full pipeline is:

`create-intent` 只是 Stripe 流程的 **开头**。完整流程是:

| Step / 步骤 | Who / 谁做 | What / 做什么 |
|---|---|---|
| 1 | **Backend / 后端** (this task / 本任务) | `create-intent` → returns `clientSecret` / 拿到 `clientSecret` |
| 2 | Frontend / 前端 | Render Stripe Elements card form, initialised with `clientSecret` / 用 Stripe Elements 显示卡号输入框,初始化时传 `clientSecret` |
| 3 | Frontend / 前端 | User clicks "Pay" → `stripe.confirmCardPayment(clientSecret)` — the **browser talks directly to Stripe**, card never touches your backend / 用户点"支付",前端调 `stripe.confirmCardPayment(clientSecret)`,这一步浏览器**直接和 Stripe 通信**,卡号不经过你的后端 |
| 4 | Frontend / 前端 | Stripe returns success → frontend calls `POST /orders` with `paymentIntentId` / Stripe 返回成功 → 前端调 `POST /orders`,带上 `paymentIntentId` |
| 5 | **Backend / 后端** | `POST /orders` calls `stripe.paymentIntents.retrieve(id)` to **double-check** that Stripe shows status `succeeded` before writing to the DB / 用 `stripe.paymentIntents.retrieve(id)` **二次核实** Stripe 那边状态是 `succeeded`,确认无误才写库 |

Step 5's re-verification is critical — it prevents an attacker from forging a fake `paymentIntentId` to create a free order. The backend must ask Stripe directly "did this id really succeed?" — never trust the frontend's word for it.

第 5 步的二次核实非常重要——它防止有人伪造一个假的 `paymentIntentId` 来下单。后端必须亲自去问 Stripe"这个 id 真的付款成功了吗",不能光听前端的。
