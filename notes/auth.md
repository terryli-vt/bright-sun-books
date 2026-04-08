# Authentication / 认证

## 1. What are bcrypt and jsonwebtoken? / bcrypt 和 jsonwebtoken 是什么？

### bcrypt

A password hashing library. It converts a plain-text password into an irreversible hash string using a slow, salted algorithm. "Slow" is intentional — it makes brute-force attacks impractical.

一个密码哈希库。它使用加盐的慢速算法将明文密码转换为不可逆的哈希字符串。"慢"是故意的——让暴力破解变得不可行。

### jsonwebtoken (JWT)

A library for creating and verifying JSON Web Tokens. A JWT is a signed token that encodes a payload (e.g. `{ userId: 1 }`). The server signs it with a secret key; later it can verify the token hasn't been tampered with — no database lookup needed.

一个用于创建和验证 JSON Web Token 的库。JWT 是一种签名令牌，编码了一段数据（如 `{ userId: 1 }`）。服务器用密钥签名，之后可以验证令牌未被篡改——无需查数据库。

---

## 2. How this project creates a password hash / 本项目如何创建密码哈希

In `POST /auth/register` (`server/src/routes/auth.ts`):

```ts
const passwordHash = await bcrypt.hash(password, 10);
```

- `password` — the user's plain-text password / 用户的明文密码
- `10` — the cost factor (2^10 = 1024 rounds). Higher = slower = more secure / cost factor（2^10 = 1024 轮），越高越慢越安全
- bcrypt automatically generates a random salt and embeds it in the output / bcrypt 自动生成随机盐值并嵌入输出中

The resulting hash looks like: / 生成的哈希形如：

```
$2b$10$xYzSaltSaltSalt...HashHashHash...
 │   │   │                │
 │   │   salt             hash result / 哈希结果
 │   cost factor
 algorithm version / 算法版本
```

The hash (not the plain-text password) is stored in the `users.password_hash` column.

哈希（而非明文密码）存储在 `users.password_hash` 列中。

---

## 3. How login verification works / 登录时如何做验证

In `POST /auth/login`, the server does NOT reverse the hash. Instead it re-hashes the input and compares:

登录时服务器不会反推哈希，而是重新哈希输入并比较：

```ts
const valid = await bcrypt.compare(password, user.passwordHash);
```

`bcrypt.compare` internally: / `bcrypt.compare` 内部流程：

1. Extracts the salt and cost factor from the stored hash / 从存储的哈希中提取盐值和 cost factor
2. Hashes the input password with the **same salt** / 用**同样的盐值**哈希输入的密码
3. Compares the two hash results / 比较两个哈希结果

Same password + same salt = same hash → match ✓

相同密码 + 相同盐 = 相同哈希 → 匹配 ✓

---

## 4. Why you can't reverse a hash / 为什么不能反推密码

Hash functions are **one-way** by design — information is lost during computation, so there is no mathematical path to reverse the process. Like turning an egg into a scrambled egg: easy forward, impossible backward.

哈希函数在设计上就是**单向的**——计算过程中信息被丢弃，不存在反向计算的数学路径。就像把鸡蛋炒成炒蛋：正向容易，反向不可能。

Even if an attacker obtains both the hash and the salt, they can only try **brute force** — guessing passwords one by one:

即使攻击者同时拿到了哈希和盐值，也只能**暴力穷举**——逐个猜测密码：

| Password complexity / 密码复杂度 | Search space / 穷举空间 | Time estimate / 耗时估算 |
|---|---|---|
| 6 digits / 6 位纯数字 | 1,000,000 | ~28 hours / 小时 |
| 8 alphanumeric / 8 位字母+数字 | ~218 billion / 亿 | ~700 years / 年 |
| 12 mixed chars / 12 位混合字符 | astronomical / 天文数字 | beyond universe lifetime / 超过宇宙寿命 |

The three layers of defense: / 三层防御：
- **Salt** prevents pre-computed attacks (rainbow tables) / **盐值**防预计算攻击（彩虹表）
- **bcrypt's slowness** limits brute-force speed / **bcrypt 的慢速**限制暴力破解速度
- **Password complexity** determines the search space / **密码复杂度**决定穷举空间大小

---

## 5. Auth API endpoints / 后端 Auth 接口及逻辑

All routes are under `/auth`, defined in `server/src/routes/auth.ts`.

所有路由挂在 `/auth` 下，定义在 `server/src/routes/auth.ts`。

### `POST /auth/register`

Register a new user. / 注册新用户。

- Validates input with Zod: `email`, `password` (min 8 chars), `name` / 用 Zod 校验入参
- Checks if email already exists → 409 if duplicate / 检查邮箱是否已注册 → 重复返回 409
- Hashes password with `bcrypt.hash(password, 10)` / 用 bcrypt 哈希密码
- Inserts into `users` table, returns user info (without password) / 插入 users 表，返回用户信息（不含密码）

### `POST /auth/login`

Authenticate and issue a JWT. / 验证凭据并签发 JWT。

- Validates `email` and `password` / 校验邮箱和密码
- Looks up user by email → 401 if not found / 按邮箱查找用户 → 未找到返回 401
- Compares password with `bcrypt.compare` → 401 if mismatch / 用 bcrypt.compare 比对密码 → 不匹配返回 401
- Signs a JWT with `{ userId }`, expires in 7 days / 签发包含 `{ userId }` 的 JWT，7 天过期
- Sets JWT in an `httpOnly` cookie (not accessible by JavaScript, preventing XSS theft) / 将 JWT 存入 httpOnly cookie（JS 无法读取，防止 XSS 窃取）

### `POST /auth/logout`

Clear the auth cookie. / 清除认证 cookie。

- Calls `res.clearCookie("token")` — the browser deletes the cookie / 调用 `res.clearCookie("token")`，浏览器删除该 cookie

### `GET /auth/me`

Return the current logged-in user. / 返回当前登录用户信息。

- Reads `token` from cookie / 从 cookie 读取 token
- Verifies JWT with `jwt.verify` → extracts `userId` / 用 jwt.verify 验证 → 提取 userId
- Queries user from database, returns `{ id, email, name }` / 从数据库查询用户，返回 `{ id, email, name }`
- Returns 401 if no token, invalid token, or user not found / 无 token、token 无效或用户不存在返回 401

---

## 6. authMiddleware / authMiddleware 介绍和用法

Defined in `server/src/middleware/auth.ts`.

定义在 `server/src/middleware/auth.ts`。

### What it does / 做了什么

An Express middleware that protects routes behind authentication. It verifies the JWT from the cookie and attaches the user ID to the request object.

一个 Express 中间件，用于保护需要登录才能访问的路由。它验证 cookie 中的 JWT，并将用户 ID 挂到请求对象上。

```ts
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  // No token → 401
  // jwt.verify fails → 401
  // Success → req.userId = payload.userId, then call next()
}
```

### How to use / 如何使用

Add `authMiddleware` as a middleware parameter before the route handler:

将 `authMiddleware` 作为中间件参数放在路由处理函数之前：

```ts
import { authMiddleware, AuthRequest } from "../middleware/auth";

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  // req.userId is available here / 这里可以使用 req.userId
  console.log(req.userId); // e.g. 1
});
```

### Where it's used in this project / 在本项目中的使用

- `POST /orders` — requires login to place an order; `req.userId` is saved to the `orders.user_id` column to link the order to the user.

- `POST /orders` — 下单需要登录；`req.userId` 写入 `orders.user_id` 列，将订单关联到用户。

---

## 7. Frontend auth store / 前端 auth store

Defined in `client/src/store/auth.ts`. Uses the Composition API style (`defineStore` with setup function).

定义在 `client/src/store/auth.ts`，使用组合式 API 风格。

### State / 状态

- `user` — `ref<User | null>`, holds `{ id, email, name }` when logged in, `null` otherwise / 登录时保存用户信息，否则为 null
- `isLoggedIn` — `computed(() => user.value !== null)`, derived boolean / 计算属性，是否已登录

### Actions / 方法

#### `login(email, password)`

1. `POST /auth/login` with `credentials: "include"` (sends/receives cookies cross-origin) / 发送登录请求，携带 cookie
2. If the response is not OK, throws an error with the server's message / 响应失败则抛出错误
3. On success, sets `user` from the response / 成功则将返回的用户信息写入 `user`

#### `logout()`

1. `POST /auth/logout` with `credentials: "include"` — server clears the `token` cookie / 请求登出，服务器清除 cookie
2. Sets `user` to `null` / 将 `user` 置为 null

#### `fetchMe()`

1. `GET /auth/me` with `credentials: "include"` / 请求当前用户信息
2. If the response is OK, sets `user` from the response / 成功则写入用户信息
3. If not (401, network error, etc.), silently sets `user` to `null` — no error thrown / 失败则静默置为 null，不抛错

Called in `App.vue` `onMounted` to restore auth state from the cookie on page load.

在 `App.vue` 的 `onMounted` 中调用，页面加载时从 cookie 恢复登录状态。

### Why `credentials: "include"`? / 为什么需要 `credentials: "include"`？

The JWT is stored in an `httpOnly` cookie — JavaScript cannot read it directly. The browser only sends cookies automatically for **same-origin** requests. Since the client (port 5173) and server (port 8000) are different origins, `fetch` will not include cookies by default. `credentials: "include"` tells the browser to send cookies even for cross-origin requests.

JWT 存储在 httpOnly cookie 中，JS 无法直接读取。浏览器只会在**同源**请求中自动发送 cookie。由于客户端（5173 端口）和服务端（8000 端口）属于不同源，`fetch` 默认不会携带 cookie。`credentials: "include"` 告诉浏览器在跨域请求中也发送 cookie。

---

## 8. Login page / 登录页

Defined in `client/src/views/Login.vue`, route: `/login`.

定义在 `client/src/views/Login.vue`，路由：`/login`。

### Flow / 流程

1. User fills in email + password and submits the form / 用户填写邮箱和密码后提交表单
2. Calls `authStore.login(email, password)` / 调用 `authStore.login()`
3. On success, redirects to the URL in `route.query.redirect` (if present), otherwise `/` / 成功后跳转到 `redirect` 查询参数指定的 URL，没有则跳转首页
4. On failure, displays the error message below the form / 失败则在表单下方显示错误信息

### Redirect mechanism / 重定向机制

When an unauthenticated user tries to access a protected page (e.g. `/checkout`), the route guard redirects them to `/login?redirect=/checkout`. After successful login, the `redirect` query parameter is read and the user is taken to their original destination:

当未登录用户尝试访问受保护页面（如 `/checkout`）时，路由守卫将其重定向到 `/login?redirect=/checkout`。登录成功后读取 `redirect` 参数，跳转到用户原本想去的页面：

```ts
// In Login.vue
const redirect = (route.query.redirect as string) || "/";
router.push(redirect);
```

This avoids the frustration of losing navigation context after login.

这样避免了登录后丢失之前的导航目的地。

---

## 9. Register page / 注册页

Defined in `client/src/views/Register.vue`, route: `/register`.

定义在 `client/src/views/Register.vue`，路由：`/register`。

### Flow / 流程

1. User fills in name + email + password (min 8 characters) and submits / 用户填写姓名、邮箱、密码（最少 8 位）后提交
2. `POST /auth/register` — creates the account on the server / 在服务端创建账号
3. If the server returns an error (e.g. "Email already registered"), displays it / 服务端返回错误（如邮箱已注册）则显示
4. On success, **automatically calls `authStore.login()`** to log the user in immediately — no need to visit the login page separately / 成功后**自动调用 `authStore.login()`** 立即登录，无需再跳登录页
5. Redirects to `/` / 跳转到首页

---

## 10. Route guard for `/checkout` / `/checkout` 路由守卫

Defined in `client/src/router/index.ts`, using Vue Router's `beforeEnter` guard.

定义在 `client/src/router/index.ts`，使用 Vue Router 的 `beforeEnter` 守卫。

### Logic / 逻辑

```ts
beforeEnter: (to, from, next) => {
  const authStore = useAuthStore();
  const checkoutStore = useCheckoutStore();

  if (!authStore.isLoggedIn) {
    // Not logged in → redirect to login with return URL
    // 未登录 → 跳转登录页并携带返回地址
    next({ path: "/login", query: { redirect: "/checkout" } });
  } else if (checkoutStore.canAccessCheckout) {
    // Logged in + came from cart → allow
    // 已登录 + 从购物车来 → 放行
    next();
  } else {
    // Logged in but didn't go through cart flow → redirect home
    // 已登录但未经过购物车流程 → 跳转首页
    next("/");
  }
};
```

Two layers of protection: / 两层保护：
1. **Authentication** — must be logged in / **身份认证** — 必须已登录
2. **Flow control** — must have come through the cart (via `canAccessCheckout`) / **流程控制** — 必须从购物车进入（通过 `canAccessCheckout`）

### Header UI / 头部 UI

`AppHeader.vue` conditionally renders based on `authStore.isLoggedIn`:

`AppHeader.vue` 根据 `authStore.isLoggedIn` 条件渲染：

- **Logged out** → shows "Log In" link + "Register" button / **未登录** → 显示"Log In"链接 + "Register"按钮
- **Logged in** → shows user's name + "Logout" button / **已登录** → 显示用户名 + "Logout"按钮
