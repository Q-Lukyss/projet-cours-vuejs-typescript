import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseApp } from "./services/firebase"

import App from './App.vue'
import router from './router'
import { useAuthStore } from "@/stores/auth.ts"

const app = createApp(App)

app.use(createPinia())
app.provide("firebase", firebaseApp)
app.use(router)

let appMounted = false  // Flag pour monter l'application une seule fois

onAuthStateChanged(auth, (user) => {
    const authStore = useAuthStore()
    if (user) {
        // Par exemple, ici on met statut à 0 ; adaptez selon votre logique
        authStore.setUser({ uid: user.uid, email: user.email!, statut: 0 })
    } else {
        authStore.clearUser()
    }
    // Monter l'application si ce n'est pas déjà fait
    if (!appMounted) {
        app.mount('#app')
        appMounted = true
    }
})
