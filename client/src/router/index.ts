import { createRouter, createWebHistory } from "vue-router";
import { useCheckoutStore } from "@/store/checkout";

import Home from "@/views/Home.vue";
import Category from "@/views/Category.vue";
import Cart from "@/views/Cart.vue";
import Checkout from "@/views/Checkout.vue";
import Confirmation from "@/views/Confirmation.vue";

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
    {
      path: "/checkout",
      name: "Checkout",
      component: Checkout,
      beforeEnter: (to, from, next) => {
        const checkoutStore = useCheckoutStore();
        if (checkoutStore.canAccessCheckout()) {
          next();
        } else {
          next("/"); // Redirect to Cart Page
        }
      },
    },
    {
      path: "/confirmation",
      name: "Confirmation",
      component: Confirmation,
    },
  ],
});

export default router;
