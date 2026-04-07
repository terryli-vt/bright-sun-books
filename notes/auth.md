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
