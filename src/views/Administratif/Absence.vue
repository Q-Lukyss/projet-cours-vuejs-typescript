<template>
  <div>
    <h1>Gestion des Absences à Justifier (Admin)</h1>

    <section v-if="loadingPresence">
      <p>Chargement des absences...</p>
    </section>

    <section v-if="!loadingPresence && absencesToJustify.length">
      <table>
        <thead>
        <tr>
          <th>Utilisateur</th>
          <th>Date</th>
          <th>Justificatif</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="absence in absencesToJustify" :key="absence.uid">
          <td>{{ absence.id_user }}</td>
          <td>{{ formatDate(absence.date) }}</td>
          <td>
            <!-- On utilise un input local pour saisir le justificatif -->
            <input v-model="absence.justificatifs" placeholder="Ajouter justificatif" />
          </td>
          <td>
            <button @click="onJustify(absence)">Justifier</button>
          </td>
        </tr>
        </tbody>
      </table>
    </section>

    <section v-else-if="!loadingPresence && absencesToJustify.length === 0">
      <p>Aucune absence à justifier.</p>
    </section>

    <section v-if="errorPresence">
      <p class="error">{{ errorPresence }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { usePresenceStore } from '@/stores/presence.store';

const presenceStore = usePresenceStore();
const { absencesToJustify, fetchPresences, updatePresence, loadingPresence, errorPresence } = presenceStore;

onMounted(async () => {
  await fetchPresences();
});

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString();
}

async function onJustify(absence: any) {
  // Vérifier que le justificatif est renseigné
  if (absence.justificatifs && absence.justificatifs.trim() !== '') {
    await updatePresence(absence);
  } else {
    alert("Veuillez renseigner le justificatif.");
  }
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
  background-color: #f2f2f2;
}
input {
  width: 100%;
  padding: 0.3rem;
  box-sizing: border-box;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>
