import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "@/assets/styles/main.css";
import "@fortawesome/fontawesome-free/css/all.css";

const app = createApp(App); // Passing a component to createApp()

app.use(router);

app.mount("#app"); // Mount the app instance to the DOM
