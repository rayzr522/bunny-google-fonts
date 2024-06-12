import "vue-toastification/dist/index.css";
import "./style.css";

import { createApp } from "vue";
import Toast, { POSITION, PluginOptions } from "vue-toastification";
import App from "./App.vue";

createApp(App)
  .use(Toast, { position: POSITION.TOP_CENTER } satisfies PluginOptions)
  .mount("#app");
