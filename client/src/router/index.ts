import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Category from "@/views/Category.vue";
import Cart from "@/views/Cart.vue";

const router = createRouter({
  // By default, BASE_URL is '/'. You can configure this in vite.config.js
  // Using the HTML5 history API to change the URL without reloading the page.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    {
      path: "/category",
      name: "Category",
      component: Category,
    },
    {
      path: "/cart",
      name: "Cart",
      component: Cart,
    },
  ],
});

export default router;
