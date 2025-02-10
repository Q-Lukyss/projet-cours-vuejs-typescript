// src/store/auth.ts
import { defineStore } from 'pinia';

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
        }
    }
});
