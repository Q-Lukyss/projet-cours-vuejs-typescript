// src/stores/user.store.ts
import {defineStore} from 'pinia';
import {ref} from 'vue';
import {User} from '@/entities/user';
import {UserService} from '@/services/user.service';

export const useUserStore = defineStore('user', () => {
    const user = ref<User | null>(null);
    const users = ref<User[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const userService = new UserService();

    // Récupère un user par son uuid
    async function fetchUser(uuid: string) {
        loading.value = true;
        try {
            user.value = await userService.getUser(uuid);
            loading.value = false;
        } catch (err: any) {
            error.value = err.message;
            loading.value = false;
        }
    }

    // Récupère la liste des utilisateurs
    async function fetchUsers() {
        loading.value = true;
        try {
            users.value = await userService.getUsers();
            loading.value = false;
        } catch (err: any) {
            error.value = err.message;
            loading.value = false;
        }
    }

    // Sauvegarde ou met à jour un user
    async function saveUser(userToSave: User) {
        loading.value = true;
        try {
            await userService.createOrUpdateUser(userToSave);
            // Optionnel : mettre à jour le state local si besoin
            loading.value = false;
        } catch (err: any) {
            error.value = err.message;
            loading.value = false;
        }
    }

    return { user, users, loading, error, fetchUser, fetchUsers, saveUser };
});
