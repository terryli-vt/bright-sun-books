import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface User {
  id: number;
  email: string;
  name: string;
}

const API = import.meta.env.VITE_API_URL;

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null); // ref to hold the current user's information, initialized to null (not logged in)
  const isLoggedIn = computed(() => user.value !== null);

  async function fetchMe() {
    try {
      const res = await fetch(`${API}/auth/me`, { credentials: "include" });
      if (!res.ok) {
        user.value = null;
        return;
      }
      const data = await res.json();
      user.value = data.user; // equivalent to React's setUser(data.user)
    } catch {
      user.value = null;
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    user.value = data.user;
  }

  async function logout() {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    user.value = null;
  }

  return { user, isLoggedIn, login, logout, fetchMe };
});
