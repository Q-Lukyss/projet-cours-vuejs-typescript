// src/stores/user.store.ts
import {defineStore} from 'pinia';
import {ref} from 'vue';
import {User} from '@/entities/user';
import {UserService} from '@/services/user.service';

export const useUserStore = defineStore('user', () => {
    const user = ref<User | null>(null);
    const users = ref<User[]>([]);
    const loadingUsers = ref(false);
    const errorUsers = ref<string | null>(null);

    const userService = new UserService();

    // Récupère un user par son uuid
    async function fetchUser(uuid: string) {
        loadingUsers.value = true;
        try {
            user.value = await userService.getUser(uuid);
            loadingUsers.value = false;
        } catch (err: any) {
            errorUsers.value = err.message;
            loadingUsers.value = false;
        }
    }

    // Récupère la liste des utilisateurs
    async function fetchUsers() {
        loadingUsers.value = true;
        try {
            users.value = await userService.getUsers();
            loadingUsers.value = false;
        } catch (err: any) {
            errorUsers.value = err.message;
            loadingUsers.value = false;
        }
    }

    // Sauvegarde ou met à jour un user
    async function saveUser(userToSave: User) {
        loadingUsers.value = true;
        try {
            await userService.createOrUpdateUser(userToSave);
            // Optionnel : mettre à jour le state local si besoin
            loadingUsers.value = false;
        } catch (err: any) {
            errorUsers.value = err.message;
            loadingUsers.value = false;
        }
    }

    async function addSUser(user: User) {
        try {
            await userService.addUser(user);
            // Rafraîchir la liste pour le cours concerné
            await fetchUsers();
        } catch (err: any) {
            errorUsers.value = err.message;
        }
    }

    async function updateUser(user: User) {
        try {
            await userService.updateUser(user);
            await fetchUsers();
        } catch (err: any) {
            errorUsers.value = err.message;
        }
    }

    async function deleteUser(userId: string, courseId: string) {
        try {
            await userService.deleteUser(userId);
            await fetchUsers()
        } catch (err: any) {
            errorUsers.value = err.message;
        }
    }

    return { user, users, loadingUsers, errorUsers, fetchUser, fetchUsers, saveUser, addSUser, updateUser, deleteUser };
});
