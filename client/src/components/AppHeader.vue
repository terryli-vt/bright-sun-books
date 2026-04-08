<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo -->
      <RouterLink to="/" class="header-logo">
        <img src="@/assets/site/logo.svg" alt="Bright Sun Books" class="logo-img" />
        <span class="logo-name">Bright Sun Books</span>
      </RouterLink>

      <!-- Right side -->
      <div class="header-right">
        <template v-if="authStore.isLoggedIn">
          <span class="user-name">{{ authStore.user?.name }}</span>
          <button class="header-link" @click="handleLogout">Logout</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="header-link">Log In</RouterLink>
          <RouterLink to="/register" class="header-link register-link">Register</RouterLink>
        </template>

        <RouterLink to="/cart" class="cart-btn" aria-label="Shopping cart">
          <i class="fas fa-bag-shopping"></i>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const cartCount = computed(() =>
  cartStore.cart.reduce((total, item) => total + item.quantity, 0)
);

async function handleLogout() {
  await authStore.logout();
  router.push("/");
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-text-primary);
}

.logo-img {
  width: 28px;
  height: auto;
}

.logo-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.header-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-btn);
  transition: var(--transition);
}

.header-link:hover {
  background: var(--color-bg-secondary);
}

.register-link {
  background: var(--color-accent);
  color: #fff;
}

.register-link:hover {
  background: var(--color-accent);
  opacity: 0.88;
}

.cart-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: 18px;
  transition: var(--transition);
}

.cart-btn:hover {
  background: var(--color-bg-secondary);
}

.cart-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--color-danger);
  color: #ffffff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

@media (max-width: 900px) {
  .header-inner {
    padding: 0 var(--space-md);
  }
}
</style>
