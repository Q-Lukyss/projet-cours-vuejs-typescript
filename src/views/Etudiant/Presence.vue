<template>
  <div>
    <h1>Présences</h1>
    <div v-if="loading">Chargement...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <p>Nombre de présences : {{ nbPresences }}</p>
      <p>Nombre d'absences : {{ nbAbsences }}</p>
      <div v-if="absencesToJustify.length > 0">
        <h2>Absences à justifier</h2>
        <ul>
          <li v-for="absence in absencesToJustify" :key="absence.id_presence">
            <strong>Séance :</strong> {{ absence.id_seance }}
            <span v-if="absence.justificatifs">
              - Justificatifs : {{ absence.justificatifs }}
            </span>
            <span v-else>
              - Aucune justification fournie
            </span>
          </li>
        </ul>
      </div>
      <div v-else>
        <p>Toutes vos absences ont été justifiées ou vous n'avez aucune absence.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { usePresenceStore } from '@/stores/presence.store';
import { useAuthStore } from '@/stores/auth';

const presenceStore = usePresenceStore();
const authStore = useAuthStore();

// Extraire les propriétés réactives du store Presence
const { loading, error, nbPresences, nbAbsences, absencesToJustify } = storeToRefs(presenceStore);
// Extraire la propriété user du auth store
const { user } = storeToRefs(authStore);

const fetchPresencesForUser = () => {
  if (user.value?.uid) {
    presenceStore.fetchPresences(user.value.uid);
  }
};

onMounted(() => {
  // Si l'utilisateur est déjà authentifié, on récupère ses présences
  if (user.value?.uid) {
    fetchPresencesForUser();
  } else {
    // Sinon, on surveille la propriété user pour lancer le fetch dès qu'elle est définie
    watch(user, (newUser) => {
      if (newUser?.uid) {
        fetchPresencesForUser();
      }
    });
  }
});
</script>

<style scoped>
/* Vos styles ici */
</style>
