<template>
  <div>
    <h1>Gestion des Utilisateurs (Admin)</h1>

    <!-- Section : Ajouter Utilisateur -->
    <section>
      <h2>Ajouter Utilisateur</h2>
      <input v-model="newUser.nom" placeholder="Nom" />
      <input v-model="newUser.prenom" placeholder="Prénom" />
      <input v-model="newUser.email" placeholder="Email" />
      <input v-model="newUser.statut" placeholder="Statut" />
      <button @click="onAddUser">Ajouter Utilisateur</button>
    </section>

    <!-- Liste des Utilisateurs -->
    <section v-if="users && users.length">
      <h2>Utilisateurs</h2>
      <table>
        <thead>
        <tr>
          <th @click="sortBy('nom')">
            Nom
            <span v-if="sortKey === 'nom'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th @click="sortBy('prenom')">
            Prénom
            <span v-if="sortKey === 'prenom'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th @click="sortBy('statut')">
            Statut
            <span v-if="sortKey === 'statut'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in sortedUsers" :key="user.uid">
          <td>{{ user.nom }}</td>
          <td>{{ user.prenom }}</td>
          <td>{{ user.statut }}</td>
          <td>{{ user.email }}</td>
          <td>
            <button @click="startEditingUser(user)">Modifier</button>
            <button @click="onDeleteUser(user.uid)">Supprimer</button>
          </td>
        </tr>
        </tbody>
      </table>
    </section>
    <div v-else>
      <p>Aucun utilisateur disponible.</p>
    </div>

    <!-- Section : Modifier Utilisateur -->
    <section v-if="editingUser">
      <h2>Modifier Utilisateur</h2>
      <input v-model="editingUser.nom" placeholder="Nom" />
      <input v-model="editingUser.prenom" placeholder="Prénom" />
      <input v-model="editingUser.email" placeholder="Email" />
      <input v-model="editingUser.statut" placeholder="Statut" />
      <button @click="onUpdateUser">Enregistrer</button>
      <button @click="cancelEditingUser">Annuler</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user.store';
import type { User } from '@/entities/user';

const userStore = useUserStore();
const { users, fetchUsers, addSUser, updateUser, deleteUser } = userStore;

// Formulaire d'ajout
const newUser = ref({ nom: '', prenom: '', email: '', statut: '' });
// Utilisateur en cours d'édition
const editingUser = ref<User | null>(null);

// Variables pour le tri
const sortKey = ref<'nom' | 'prenom' | 'statut'>('nom');
const sortOrder = ref<'asc' | 'desc'>('asc');

onMounted(async () => {
  await fetchUsers();
});

// Computed pour trier les utilisateurs
const sortedUsers = computed(() => {
  return [...users].sort((a: User, b: User) => {
    const key = sortKey.value;
    if (a[key] < b[key]) return sortOrder.value === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

// Fonction de tri
function sortBy(key: 'nom' | 'prenom' | 'statut') {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

// Ajout d'un utilisateur
async function onAddUser() {
  if (newUser.value.nom && newUser.value.prenom && newUser.value.email && newUser.value.statut) {
    await addSUser(newUser.value as User);
    newUser.value = { nom: '', prenom: '', email: '', statut: '' };
  }
}

// Prépare la modification d'un utilisateur
function startEditingUser(user: User) {
  editingUser.value = { ...user };
}

// Annule la modification
function cancelEditingUser() {
  editingUser.value = null;
}

// Enregistre les modifications
async function onUpdateUser() {
  if (editingUser.value) {
    await updateUser(editingUser.value);
    editingUser.value = null;
  }
}

// Suppression d'un utilisateur
async function onDeleteUser(userId: string) {
  await deleteUser(userId, '');
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}

th {
  cursor: pointer;
  background-color: #f2f2f2;
}

button {
  margin-right: 0.5rem;
}

input {
  margin: 0.25rem 0;
  padding: 0.25rem;
}
</style>
