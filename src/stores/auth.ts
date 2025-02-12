// src/store/auth.ts
import { defineStore } from 'pinia';
import {getAuth, signOut} from "firebase/auth";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as null | { uid: string; email: string; statut: number }
    }),
    actions: {
        setUser(user: { uid: string; email: string; statut: number } | null) {
            this.user = user;
        },
        clearUser() {
            this.user = null;
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
