import { createRouter, createWebHistory } from "vue-router";
import "vue-router";
import { useCheckoutStore } from "@/store/checkout";
import { useAuthStore } from "@/store/auth";

import Home from "@/views/Home.vue";
import Category from "@/views/Category.vue";
import Cart from "@/views/Cart.vue";
import Checkout from "@/views/Checkout.vue";
import Confirmation from "@/views/Confirmation.vue";
import Orders from "@/views/Orders.vue";
import OrderDetail from "@/views/OrderDetail.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import NotFound from "@/views/NotFound.vue";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresCheckoutAccess?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "Home", component: Home },
    {
      path: "/category/:categoryName?",
      name: "Category",
      component: Category,
      props: true,
    },
    { path: "/cart", name: "Cart", component: Cart },
    { path: "/login", name: "Login", component: Login },
    { path: "/register", name: "Register", component: Register },
    {
      path: "/checkout",
      name: "Checkout",
      component: Checkout,
      meta: { requiresAuth: true, requiresCheckoutAccess: true },
    },
    { path: "/confirmation", name: "Confirmation", component: Confirmation },
    {
      path: "/orders",
      name: "Orders",
      component: Orders,
      meta: { requiresAuth: true },
    },
    {
      path: "/orders/:id",
      name: "OrderDetail",
      component: OrderDetail,
      meta: { requiresAuth: true },
    },
    { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore();
    if (!authStore.isLoggedIn) {
      return { path: "/login", query: { redirect: to.fullPath } };
    }
  }
  if (to.meta.requiresCheckoutAccess) {
    const checkoutStore = useCheckoutStore();
    if (!checkoutStore.canAccessCheckout) {
      return "/cart";
    }
  }
});

export default router;
