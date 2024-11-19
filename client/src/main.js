import { createApp } from "vue";
import App from "./App.vue"; // import the root component App from a single-file component.
import router from "./router";

import "@/assets/styles/index.css";
import "@fortawesome/fontawesome-free/css/all.css";

// Passing a component to createApp()
const app = createApp(App);

app.use(router);

// Mount the app instance to the DOM
app.mount("#app");
