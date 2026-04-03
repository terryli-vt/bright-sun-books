# Vue 3 复习手册 / Study Notes
> React 对比版 / with React Comparisons

---

## 目录 / Table of Contents

1. [JSX 是什么 / What is JSX](#1-jsx-是什么--what-is-jsx)
2. [Vue Template vs JSX](#2-vue-template-vs-jsx)
3. [ref 与 reactive](#3-ref-与-reactive)
4. [computed vs useMemo](#4-computed-vs-usememo)
5. [事件与双向绑定 / Events & Two-way Binding](#5-事件与双向绑定--events--two-way-binding)
6. [Composition API](#6-composition-api)
7. [Pinia Store](#7-pinia-store)
8. [storeToRefs](#8-storetorefs)
9. [Vue Router](#9-vue-router)
10. [Vite](#10-vite)
11. [快速查阅 / Quick Reference](#11-快速查阅--quick-reference)

---

## 1. JSX 是什么 / What is JSX

JSX 是一种**在 JavaScript 里写 HTML 的语法扩展**，浏览器不认识，需要 Babel 等工具编译成普通 JS。

JSX is a syntax extension that lets you write HTML inside JavaScript. Browsers don't understand it — it must be compiled by tools like Babel.

**编译前 / Before compile:**
```jsx
const el = <div className="box">Hello, {name}!</div>
```

**编译后 / After compile:**
```js
const el = React.createElement("div", { className: "box" }, "Hello, ", name)
```

### JSX vs HTML 主要区别 / Key Differences

| 对比项 / Item | HTML | JSX |
|---|---|---|
| CSS 类名 / Class | `class` | `className` |
| 插入变量 / Variables | 不支持 / Not supported | `{变量名}` |
| 自闭合标签 / Self-closing | `<br>` 可以 | 必须 `<br />` |
| 行内样式 / Inline style | `style="color:red"` | `style={{ color: 'red' }}` |

---

## 2. Vue Template vs JSX

Vue 的 `<template>` 和 JSX 做同一件事——描述 UI，最终都编译成 JS 函数。但它们是两种不同的方案。

Vue's `<template>` and JSX both describe UI and compile to JS functions — but they are two different approaches.

| 对比项 / Item | JSX (React) | Vue Template |
|---|---|---|
| 语法风格 / Style | JS 里嵌 HTML | 专门的模板语言 / Dedicated template language |
| 条件渲染 / Conditional | `{cond && <div/>}` | `v-if="cond"` |
| 循环 / Loop | `{list.map(...)}` | `v-for="item in list"` |
| 编译产物 / Compiled to | `React.createElement(...)` | `h(...)` Vue 渲染函数 |

> ▶ Vue 其实也支持 JSX，底层编译目标是一样的。
> Vue also supports JSX — the compilation target is the same.

---

## 3. ref 与 reactive

两者都是 Vue 响应式系统的核心，让数据变化时自动更新视图。

Both are core to Vue's reactivity system — data changes automatically update the view.

### ref — 包裹单个值 / Wrap a single value

```js
const count = ref(0)

count.value++       // JS 里需要 .value / Need .value in JS
// {{ count }}      // 模板里自动解包，不需要 .value / Auto-unwrapped in template
```

### reactive — 包裹对象 / Wrap an object

```js
const state = reactive({ count: 0, name: '张三' })

state.count++          // 不需要 .value / No .value needed
state.name = '李四'
```

### 原理 / How it works

Vue 用 JS 的 `Proxy` 拦截对象的读取和修改，读取时追踪依赖，修改时通知更新。

Vue uses JS `Proxy` to intercept reads (track dependencies) and writes (trigger updates).

### 如何选择 / Which to use

| 场景 / Scenario | 推荐 / Recommended |
|---|---|
| 单个原始值（数字、字符串）/ Single primitive | `ref` |
| 一组相关状态 / Related group of state | `reactive` |
| 社区趋势 / Community trend | 统一用 `ref` / Always use `ref` |

### 对应 React / React Equivalent

| Vue | React |
|---|---|
| `ref(0)` | `const [count, setCount] = useState(0)` |
| `count.value++` | `setCount(count + 1)` |
| `ref` 把值和修改合二为一 | `useState` 拆出单独的 setter |

---

## 4. computed vs useMemo

缓存计算结果，依赖不变就不重新计算。

Cache computed values — only recompute when dependencies change.

### 基本用法 / Basic Usage

```js
// Vue — 自动追踪依赖 / Auto-tracks dependencies
const doubled = computed(() => count.value * 2)
// 返回 ref 对象，需要 .value / Returns a ref, need .value
console.log(doubled.value)

// React — 手动声明依赖 / Manually declare dependencies
const doubled = useMemo(() => count * 2, [count])
// 直接是值 / Direct value
console.log(doubled)
```

### 忘记写依赖的后果 / Risk of missing dependencies

```js
// React — 写错依赖数组，产生 bug
const result = useMemo(() => a + b, [a])  // 忘记写 b，b 变化时不更新 ❌

// Vue — 不存在这个问题，自动追踪 a 和 b ✓
const result = computed(() => a.value + b.value)
```

### Vue computed 支持 setter / Vue computed with setter

```js
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (val) => {
    [firstName.value, lastName.value] = val.split(' ')
  }
})

fullName.value = '张 三'  // 触发 setter，自动拆分 / Triggers setter
```

### 对比总结 / Summary

| 对比 / Compare | `useMemo` | `computed` |
|---|---|---|
| 依赖追踪 / Dependencies | 手动写数组 / Manual array | 自动 / Automatic |
| 返回值 / Return value | 直接是值 / Direct value | ref 对象，需 `.value` |
| 支持写入 / Writable | ❌ | ✓ 可选 / Optional |
| Bug 风险 / Bug risk | 依赖数组写错 / Easy to forget | 几乎没有 / Almost none |

---

## 5. 事件与双向绑定 / Events & Two-way Binding

**双向绑定** = 数据→视图 + 视图→数据同步。

Two-way binding = data→view + view→data sync.

### React 写法 / React

```jsx
<input value={name} onChange={(e) => setName(e.target.value)} />
// 没有语法糖，永远手动写两步 / No shorthand, always manual
```

### Vue 手动写法 / Vue Manual

```vue
<input :value="name" @input="name = $event.target.value" />
```

- `:value` = `v-bind:value` 的缩写，单向绑定 / one-way bind
- `@input` = `v-on:input` 的缩写，事件监听 / event listener
- `$event` = 原生事件对象 / native event object（等价于 React 的 `e`）

### Vue v-model 语法糖 / v-model Shorthand

```vue
<input v-model="name" />

<!-- 等价于 / Equivalent to: -->
<input :value="name" @input="name = $event.target.value" />
```

### `:` 冒号的作用 / The colon `:` prefix

```vue
<input value="name" />     <!-- 字符串 "name" / String literal -->
<input :value="name" />    <!-- 变量 name 的值 / JS expression -->
<button :disabled="count === 0">  <!-- 表达式 / Expression -->
```

`: ` 等价于 React 的 `{}`，把引号里的内容从字符串变成 JS 表达式。

The `:` is equivalent to React's `{}` — it turns the attribute value from a string into a JS expression.

### 对比总结 / Summary

| | React | Vue 手动 / Manual | Vue 语法糖 / Shorthand |
|---|---|---|---|
| 数据→视图 | `value={name}` | `:value="name"` | `v-model="name"` |
| 视图→数据 | `onChange={...}` | `@input="..."` | 自动处理 / Auto |

---

## 6. Composition API

Vue 3 引入的组织逻辑方式，**按功能聚合代码**，而非按类型分块。

Vue 3's way to organize logic by feature — not by option type.

### Options API（Vue 2）— 按类型分 / Organized by type

```js
export default {
  data()    { return { count: 0, name: '' } },
  computed: { doubled() { ... } },
  methods:  { increment() { ... } },
  mounted() { fetch('/api/user')... }
}
// 同一功能的代码被强制拆散 / Same feature's code is scattered
```

### Composition API（Vue 3）— 按功能分 / Organized by feature

```js
// useCounter.js — 计数器逻辑独立封装 / Counter logic isolated
export function useCounter() {
  const count = ref(0)
  const doubled = computed(() => count.value * 2)
  function increment() { count.value++ }
  return { count, doubled, increment }
}

// useUser.js — 用户逻辑独立封装 / User logic isolated
export function useUser() {
  const username = ref('')
  async function fetchUser() { ... }
  return { username, fetchUser }
}
```

```vue
<!-- 组件中组合使用 / Compose in component -->
<script setup>
import { useCounter } from './useCounter'
import { useUser } from './useUser'

const { count, doubled, increment } = useCounter()
const { username, fetchUser } = useUser()
</script>
```

### 与 React Hooks 对比 / vs React Hooks

| 功能 / Feature | Vue Composition API | React Hooks |
|---|---|---|
| 封装逻辑 / Encapsulate | `useXxx()` 函数 | `useXxx()` Hook |
| 响应式状态 / State | `ref` / `reactive` | `useState` |
| 计算值 / Computed | `computed` | `useMemo` |
| 副作用 / Side effects | `watchEffect` / `watch` | `useEffect` |

> ▶ `<script setup>` 就是 Composition API 的语法糖，`ref`、`computed`、`defineProps` 都属于它。
> `<script setup>` is syntactic sugar for Composition API.

---

## 7. Pinia Store

解决**组件间共享状态**的问题，任何组件都能读取和修改，改了会自动通知所有使用它的组件。

Solves shared state between components — any component can read/write, and changes auto-update all consumers.

### Props Drilling 问题 / The Problem

```
没有 Store，状态要一层层往下传 / Without Store: pass props down every level

App
├── Header   需要 username ← props
├── Sidebar  需要 username ← props
└── Profile  需要 username ← props
```

### 定义 Store / Define a Store

```js
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const username = ref('张三')

  function updateName(name) { username.value = name }

  return { username, updateName }
})
```

### 在组件中使用 / Use in Component

```vue
<!-- 任意组件直接读取 / Any component reads directly -->
<script setup>
const userStore = useUserStore()
</script>

<template>
  <div>{{ userStore.username }}</div>
  <button @click="userStore.updateName('李四')">改名</button>
</template>
```

`Header` 和 `Profile` 共用同一份数据，一个修改，另一个自动更新。

Both share the same data — one updates, the other auto-reflects the change.

### 对比 React / vs React

| | Vue | React |
|---|---|---|
| 内置方案 / Built-in | `provide` / `inject` | Context |
| 主流第三方 / Popular lib | Pinia（旧：Vuex） | Redux / Zustand |

---

## 8. storeToRefs

直接解构 store 会失去响应式，`storeToRefs` 把状态包装成 ref，解构后仍然同步。

Destructuring a store directly breaks reactivity. `storeToRefs` wraps state as refs, keeping them reactive.

### ❌ 直接解构 — 错误 / Direct Destructure — Wrong

```js
const { username } = userStore
// username 变成普通变量，不再跟 store 同步 / Loses reactivity
```

### ✅ 正确写法 / Correct

```js
import { storeToRefs } from 'pinia'

const { username } = storeToRefs(userStore)   // 状态 → 用 storeToRefs / State
const { updateName } = userStore               // 方法直接解构即可 / Methods: direct
```

### 规则总结 / Summary

| 场景 / Scenario | 写法 / Syntax |
|---|---|
| 不解构，直接用 / No destructure | `userStore.username` |
| 解构状态 / Destructure state | `const { x } = storeToRefs(store)` |
| 解构方法 / Destructure methods | `const { fn } = store` |

> ▶ 方法不是响应式数据，直接解构没问题。/ Methods aren't reactive data — direct destructure is fine.

---

## 9. Vue Router

把 URL 映射到组件，实现无刷新页面跳转。

Maps URLs to components for client-side navigation without page reloads.

### 定义路由 / Define Routes

```js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',          component: Home },
    { path: '/about',     component: About },
    { path: '/user/:id',  component: User },  // 动态参数 / Dynamic param
  ]
})
```

### 模板中使用 / In Template

```vue
<nav>
  <RouterLink to="/">首页</RouterLink>
  <RouterLink to="/about">关于</RouterLink>
  <!-- RouterLink 不会刷新页面 / No page reload -->
</nav>

<RouterView />  <!-- 当前路由组件渲染在这里 / Current route renders here -->
```

### 读取参数 / Read Params

```js
const route = useRoute()
console.log(route.params.id)   // URL: /user/123 → 输出 123
```

### 编程式导航 / Programmatic Navigation

```js
const router = useRouter()

router.push('/user/123')                        // 跳转 / Navigate
router.push({ name: 'user', params: { id } })  // 用路由名跳转 / By name
router.replace('/home')                         // 不留历史记录 / No history entry
router.back()                                   // 后退 / Go back
```

### 导航守卫（权限控制）/ Navigation Guards

```js
router.beforeEach((to, from) => {
  const isLoggedIn = !!localStorage.getItem('token')
  if (to.meta.requiresAuth && !isLoggedIn) return '/login'
})

// 路由配置中标记 / Mark in route config
{ path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } }
```

### 嵌套路由 / Nested Routes

```js
{
  path: '/dashboard',
  component: Dashboard,
  children: [
    { path: 'stats',    component: Stats },    // /dashboard/stats
    { path: 'settings', component: Settings }, // /dashboard/settings
  ]
}
```

```vue
<!-- Dashboard.vue -->
<template>
  <Sidebar />
  <RouterView />  <!-- 子路由渲染在这里 / Child route renders here -->
</template>
```

### 对比 React Router / vs React Router

| 功能 / Feature | Vue Router | React Router |
|---|---|---|
| 读取参数 / Read params | `useRoute()` | `useParams()` |
| 编程跳转 / Navigate | `useRouter()` | `useNavigate()` |
| 渲染出口 / Route outlet | `<RouterView>` | `<Outlet>` |
| 链接组件 / Link | `<RouterLink>` | `<Link>` |

---

## 10. Vite

前端构建工具，负责开发时的本地服务器和上线时的打包。

A frontend build tool — local dev server during development + bundler for production.

### 为什么需要构建工具 / Why We Need It

```
TypeScript      →  编译成 JS / Compile to JS
JSX / Vue SFC   →  编译成普通 JS / Compile to plain JS
import / export →  打包 / Bundle for browser
SCSS / Tailwind →  编译成 CSS / Compile to CSS
```

### Vite 做两件事 / Two Things Vite Does

```bash
npm run dev    # 启动开发服务器 → localhost:5173，支持热更新 HMR
npm run build  # 打包 → 生成 dist/ 文件夹，可直接部署
```

### 为什么比 Webpack 快 / Why Faster than Webpack

| | Webpack | Vite |
|---|---|---|
| 启动 / Startup | 打包所有文件再启动 / Bundle everything first | 按需处理 / On-demand |
| 热更新 / HMR | 整体重新编译 / Full recompile | 只更新改动模块 / Changed module only |
| 速度 / Speed | 慢，项目越大越慢 / Slow | 近乎瞬间 / Near instant |

---

## 11. 快速查阅 / Quick Reference

| 概念 / Concept | Vue 写法 / Vue Syntax | React 对应 / React Equivalent |
|---|---|---|
| 响应式状态 / State | `ref(0)` / `reactive({})` | `useState(0)` |
| 计算值 / Computed | `computed(() => ...)` | `useMemo(() => ..., [deps])` |
| 模板插值 / Interpolation | `{{ value }}` | `{ value }` |
| 属性绑定 / Prop bind | `:prop="value"` (v-bind) | `prop={value}` |
| 事件绑定 / Event bind | `@click="fn"` (v-on) | `onClick={fn}` |
| 双向绑定 / Two-way bind | `v-model="name"` | `value` + `onChange` 手动 |
| 条件渲染 / Conditional | `v-if` / `v-else` | `{cond && <Comp />}` |
| 列表渲染 / List render | `v-for="item in list"` | `{list.map(item => ...)}` |
| 接收 Props / Receive props | `defineProps<{ title: string }>()` | `function Comp({ title })` |
| Store 状态 / Store | Pinia — `useXxxStore()` | Zustand / Redux |
| Store 解构 / Store destructure | `storeToRefs(store)` | 直接解构 / Direct |
| 路由参数 / Route params | `useRoute().params.id` | `useParams().id` |
| 路由跳转 / Navigate | `useRouter().push('/path')` | `useNavigate()('/path')` |
| 构建工具 / Build tool | Vite | Vite（React 也用 / also used） |
