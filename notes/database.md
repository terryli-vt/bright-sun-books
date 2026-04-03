# Database Structure / 数据库结构

**ORM:** Drizzle ORM
**Database / 数据库:** PostgreSQL

---

## Tables Overview / 数据表概览

The database contains 5 tables: `categories`, `books`, `customers`, `orders`, `line_items`.

数据库共有5张表：`categories`、`books`、`customers`、`orders`、`line_items`。

---

## Table Definitions / 表结构定义

### `categories`

Stores book categories (e.g., Fiction, Science, History).

存储书籍分类（如：Fiction、Science、History）。

| Column / 字段 | Type / 类型 | Constraints / 约束 |
|---|---|---|
| `id` | serial | PRIMARY KEY |
| `name` | varchar(255) | NOT NULL, UNIQUE |

---

### `books`

Stores book information. Each book belongs to one category.

存储书籍信息。每本书属于一个分类。

| Column / 字段 | Type / 类型 | Constraints / 约束 |
|---|---|---|
| `id` | serial | PRIMARY KEY |
| `title` | varchar(255) | NOT NULL |
| `author` | varchar(255) | — |
| `image_url` | varchar(255) | — |
| `price` | real | NOT NULL, DEFAULT 0 |
| `category_id` | integer | FK → `categories.id` |

---

### `customers`

Stores customer information submitted at checkout.

存储结账时提交的客户信息。

| Column / 字段 | Type / 类型 | Constraints / 约束 |
|---|---|---|
| `id` | serial | PRIMARY KEY |
| `name` | text | NOT NULL |
| `address` | text | NOT NULL |
| `phone` | text | NOT NULL |
| `email` | text | NOT NULL |
| `card_number` | text | NOT NULL ⚠️ |
| `card_exp_month` | text | NOT NULL |
| `card_exp_year` | text | NOT NULL |

> ⚠️ `card_number` is stored in plaintext — not suitable for production. See `notes/payment.md`.
>
> ⚠️ `card_number` 以明文存储，不适用于生产环境，详见 `notes/payment.md`。

---

### `orders`

Stores one order per customer checkout submission.

每次结账提交对应一条订单记录。

| Column / 字段 | Type / 类型 | Constraints / 约束 |
|---|---|---|
| `id` | serial | PRIMARY KEY |
| `confirmation_number` | text | NOT NULL, UNIQUE |
| `date` | timestamp | NOT NULL |
| `customer_id` | integer | NOT NULL, FK → `customers.id` |

---

### `line_items`

Stores individual books within an order. One row per book per order.

存储订单中的每本书，每本书对应一行记录。

| Column / 字段 | Type / 类型 | Constraints / 约束 |
|---|---|---|
| `id` | serial | PRIMARY KEY |
| `order_id` | integer | NOT NULL, FK → `orders.id` |
| `book_id` | integer | NOT NULL, FK → `books.id` |
| `quantity` | integer | NOT NULL |

---

## Relationships / 表关系

### One-to-Many / 一对多

**`categories` → `books`**

One category can contain many books. A book belongs to exactly one category.

一个分类可以包含多本书，一本书只属于一个分类。

```
categories (1) ──< books (many)
    id  ←──  category_id
```

---

**`customers` → `orders`**

One customer can have many orders (each checkout creates a new customer record). One order belongs to exactly one customer.

一个客户可以有多条订单记录（每次结账都会创建新的客户记录）。一条订单只属于一个客户。

```
customers (1) ──< orders (many)
    id  ←──  customer_id
```

---

**`orders` → `line_items`**

One order can contain many line items (one per book). Each line item belongs to exactly one order.

一条订单可以包含多个订单明细（每本书一条）。每条明细只属于一条订单。

```
orders (1) ──< line_items (many)
    id  ←──  order_id
```

---

**`books` → `line_items`**

One book can appear in many line items across different orders. Each line item references exactly one book.

一本书可以出现在不同订单的多条明细中。每条明细只对应一本书。

```
books (1) ──< line_items (many)
    id  ←──  book_id
```

---

### Many-to-Many (via join table) / 多对多（通过中间表）

**`orders` ↔ `books`** (through `line_items`)

An order can contain many books, and a book can appear in many orders. `line_items` is the **join table** that resolves this relationship, also storing the `quantity` for each book in each order.

一条订单可以包含多本书，一本书也可以出现在多条订单中。`line_items` 是解决这一关系的**中间表**，同时记录每本书在每条订单中的数量。

```
orders ──< line_items >── books
  id  ←── order_id    book_id ──→ id
```

---

## Entity Relationship Diagram / ER 图

```
┌─────────────┐         ┌─────────────────────┐
│  categories │         │       customers      │
│─────────────│         │─────────────────────│
│ id (PK)     │         │ id (PK)             │
│ name        │         │ name                │
└──────┬──────┘         │ address             │
       │ 1              │ phone               │
       │                │ email               │
       │ many           │ card_number  ⚠️     │
┌──────▼──────┐         │ card_exp_month      │
│    books    │         │ card_exp_year       │
│─────────────│         └──────────┬──────────┘
│ id (PK)     │                    │ 1
│ title       │                    │
│ author      │                    │ many
│ image_url   │         ┌──────────▼──────────┐
│ price       │         │        orders       │
│ category_id │         │─────────────────────│
└──────┬──────┘         │ id (PK)             │
       │ 1              │ confirmation_number │
       │                │ date                │
       │ many           │ customer_id (FK)    │
       │           ┌────└──────────┬──────────┘
       │           │               │ 1
       │      many │               │
       │           │               │ many
┌──────▼───────────▼──┐
│      line_items     │
│─────────────────────│
│ id (PK)             │
│ order_id (FK)       │
│ book_id  (FK)       │
│ quantity            │
└─────────────────────┘
```

---

## Source / 来源

Schema defined in: `server/src/db/schema.ts`
