import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "@/store/auth";

import "@/assets/styles/main.css";
import "@fortawesome/fontawesome-free/css/all.css";

(async () => {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);

  // Restore auth state from cookie BEFORE installing the router.
  // Vue Router triggers the initial navigation on app.use(router),
  // so isLoggedIn must already be correct when route guards run.
  const authStore = useAuthStore();
  await authStore.fetchMe();

  app.use(router);
  app.mount("#app");
})();
