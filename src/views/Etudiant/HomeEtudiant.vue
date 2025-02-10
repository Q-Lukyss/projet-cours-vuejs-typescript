<template>
  <h1>Home Etudiant</h1>
  <div>
    <div v-if="!users.length">Chargement...</div>
    <ul v-else>
      <li v-for="user in users" :key="user.uuid">
        <h3>{{ user.name }}</h3>
        <p>Email : {{ user.email }}</p>
        <p>Statut : {{ user.statut }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user.store';

const userStore = useUserStore();
const { users } = storeToRefs(userStore);

onMounted(() => {
  userStore.fetchUsers();
});
</script>
