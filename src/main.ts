import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseApp } from "./services/firebase"

import App from './App.vue'
import router from './router'
import { useAuthStore } from "@/stores/auth.ts"
import {UserService} from "@/services/user.service.ts";

const app = createApp(App)

app.use(createPinia())
app.provide("firebase", firebaseApp)
app.use(router)

const userService = new UserService();

const authPromise = new Promise<void>((resolve) => {
    onAuthStateChanged(getAuth(), async (user) => {
        const authStore = useAuthStore();
        if (user) {
            try {
                const userData = await userService.getUser(user.uid);
                if (userData) {
                    authStore.setUser({
                        uid: userData.uid,
                        email: userData.email,
                        statut: parseInt(userData.statut)
                    });
                } else {
                    authStore.clearUser();
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de l'utilisateur :", error);
                authStore.clearUser();
            }
        } else {
            authStore.clearUser();
            // Si l'utilisateur se déconnecte et se trouve sur une route protégée, rediriger immédiatement vers Login
            if (router.currentRoute.value.meta.requiresAuth) {
                await router.replace({ name: 'Login' });
            }
        }
        resolve();
    });
});

authPromise.then(() => {
    app.mount('#app');
});