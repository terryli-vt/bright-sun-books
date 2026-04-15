import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiFetch } from "@/lib/api";

interface User {
  id: number;
  email: string;
  name: string;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => user.value !== null);

  async function fetchMe() {
    try {
      const data = await apiFetch<{ user: User }>("/auth/me");
      user.value = data.user;
    } catch {
      user.value = null;
    }
  }

  async function login(email: string, password: string) {
    const data = await apiFetch<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    user.value = data.user;
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      user.value = null;
    }
  }

  return { user, isLoggedIn, login, logout, fetchMe };
});
