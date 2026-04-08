<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Log In</h1>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            v-model="email"
            id="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            v-model="password"
            id="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button type="submit" class="auth-btn" :disabled="loading">
          {{ loading ? "Logging in..." : "Log In" }}
        </button>
      </form>

      <p class="auth-alt">
        Don't have an account?
        <RouterLink to="/register">Register</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/store/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    const redirect = (route.query.redirect as string) || "/";
    router.push(redirect);
  } catch (e: any) {
    error.value = e.message || "Login failed";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg) var(--space-md);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-lg) var(--space-md);
  box-shadow: var(--shadow-card);
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-group input {
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-btn);
  font-size: 15px;
  outline: none;
  transition: var(--transition);
}

.form-group input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.12);
}

.auth-error {
  color: var(--color-danger);
  font-size: 14px;
  margin: 0;
}

.auth-btn {
  margin-top: var(--space-xs);
  padding: 12px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-btn);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.auth-btn:hover:not(:disabled) {
  opacity: 0.88;
}

.auth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-alt {
  text-align: center;
  margin-top: var(--space-sm);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.auth-alt a {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 500;
}

.auth-alt a:hover {
  text-decoration: underline;
}
</style>
