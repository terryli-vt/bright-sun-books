<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Create Account</h1>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            v-model="name"
            id="name"
            type="text"
            placeholder="Your name"
            required
          />
        </div>

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
            placeholder="At least 8 characters"
            minlength="8"
            required
          />
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button type="submit" class="auth-btn" :disabled="loading">
          {{ loading ? "Creating account..." : "Register" }}
        </button>
      </form>

      <p class="auth-alt">
        Already have an account?
        <RouterLink to="/login">Log in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";

const API = import.meta.env.VITE_API_URL;
const router = useRouter();
const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleRegister() {
  error.value = "";
  loading.value = true;
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        typeof data.error === "string" ? data.error : "Registration failed"
      );
    }
    // Auto-login after registration
    await authStore.login(email.value, password.value);
    router.push("/");
  } catch (e: any) {
    error.value = e.message || "Registration failed";
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
