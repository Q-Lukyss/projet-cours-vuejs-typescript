import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { firebaseApp } from "./services/firebase";

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.provide("firebase", firebaseApp);
app.use(router)

app.mount('#app')
