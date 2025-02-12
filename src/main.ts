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

let appMounted = false  // Flag pour monter l'application une seule fois

const userService = new UserService();

onAuthStateChanged(auth, async (user) => {
    const authStore = useAuthStore()
    if (user) {
        // Récupérer le document utilisateur complet depuis Firestore
        try {
            const userData = await userService.getUser(user.uid);
            if (userData) {
                // Ici, userData contient le véritable statut (qui peut être 0, 5, 10, etc.)
                authStore.setUser({ uid: userData.uuid, email: userData.email, statut: parseInt(userData.statut) });
            } else {
                // Si le document n'existe pas, vous pouvez choisir de déconnecter l'utilisateur
                authStore.clearUser();
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur :", error);
            authStore.clearUser();
        }
    } else {
        authStore.clearUser()
    }
    // Monter l'application si ce n'est pas déjà fait
    if (!appMounted) {
        app.mount('#app')
        appMounted = true
    }
})
