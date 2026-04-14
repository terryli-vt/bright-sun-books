# client

Frontend for bright-sun-books, built with Vue 3 + TypeScript + Vite.

## Tech Stack

- Vue 3 + TypeScript, Vite
- Vue Router (with a `canAccessCheckout` route guard)
- Pinia stores
  - `cart.ts` synced to localStorage
  - `category.ts`, `checkout.ts`
- Tailwind CSS + DaisyUI

## Project Structure

```
src/
├── components/    shared components (e.g. OrderReceipt)
├── views/         route pages (Orders, OrderDetail, Confirmation, ...)
├── router/        routes and guards
├── stores/        Pinia stores
└── main.ts
```

Path alias: `@` → `client/src/`. The API base path is `/api`, served from the same origin — no separate backend URL needed.

## Recommended IDE

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur). Type checking for `.vue` files is done via `vue-tsc`.

## Commands

```sh
npm install
npm run dev          # Vite dev server on port 5173
npm run build        # type-check + production build
npm run type-check   # run vue-tsc only
```

See the [Vite configuration reference](https://vite.dev/config/).
