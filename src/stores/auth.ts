import { defineStore } from 'pinia';
import { getAuth, signOut } from "firebase/auth";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as null | { uid: string; email: string; statut: number },
        isInitialized: false,
    }),
    actions: {
        setUser(user: { uid: string; email: string; statut: number } | null) {
            this.user = user;
            this.isInitialized = true;
        },
        clearUser() {
            this.user = null;
            this.isInitialized = true;  // Important : on marque l'initialisation même si l'utilisateur est nul
        },
        async logout() {
            const auth = getAuth();
            try {
                await signOut(auth);
                this.clearUser();
            } catch (error) {
                console.error("Erreur lors du logout :", error);
            }
        }
    }
});
