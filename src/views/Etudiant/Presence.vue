<template>
  <div class="p-6 bg-lightbeige min-h-screen text-darkblue">
    <section
        ref="observerPresenceRef"
        class="bg-white p-6 rounded shadow max-w-3xl mx-auto"
    >
      <h1 class="text-2xl font-bold mb-4">Présences</h1>

      <!-- Skeleton de chargement -->
      <div v-if="loadingPresence" class="space-y-3">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div class="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Erreur -->
      <div v-else-if="errorPresence" class="text-red-600">
        {{ errorPresence }}
      </div>

      <!-- Contenu principal -->
      <div v-else>
        <p class="mb-2">
          Nombre de présences :
          <span class="font-semibold">{{ nbPresences }}</span>
        </p>
        <p class="mb-4">
          Nombre d'absences :
          <span class="font-semibold">{{ nbAbsences }}</span>
        </p>

        <!-- Bloc “Absences à justifier” -->
        <div v-if="absencesToJustify.length > 0">
          <h2 class="text-xl font-semibold mb-2">Absences à justifier</h2>
          <ul class="list-disc list-inside space-y-2">
            <li
                v-for="absence in absencesToJustify"
                :key="absence.uid"
                class="ml-4"
            >
              <strong class="mr-1">Séance :</strong>
              {{ absence.id_seance }}
              <span v-if="absence.justificatifs" class="ml-2">
                — Justificatifs : {{ absence.justificatifs }}
              </span>
              <span v-else class="ml-2 text-gray-600">
                — Aucune justification fournie
              </span>
            </li>
          </ul>
        </div>
        <!-- Pas d'absence à justifier -->
        <div v-else>
          <p class="text-gray-700">
            Toutes vos absences ont été justifiées ou vous n'avez aucune absence.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { usePresenceStore } from '@/stores/presence.store';
import { useAuthStore } from '@/stores/auth';

const presenceStore = usePresenceStore();
const authStore = useAuthStore();

// Extraction des propriétés réactives du store Presence
const {
  loadingPresence,
  errorPresence,
  nbPresences,
  nbAbsences,
  absencesToJustify,
} = storeToRefs(presenceStore);

// Extraction de la propriété user
const { user } = storeToRefs(authStore);

// Fonction de fetch
const fetchPresencesForUser = () => {
  if (user.value?.uid) {
    presenceStore.fetchPresencesForUser(user.value.uid);
  }
};

// Au montage
onMounted(() => {
  if (user.value?.uid) {
    fetchPresencesForUser();
  } else {
    // Si pas d'utilisateur, on pourrait par ex. forcer un logout
    authStore.logout();
  }
});

// IntersectionObserver (lazy loading)
const observerPresenceRef = ref(null);

onMounted(() => {
  const options = { root: null, rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target === observerPresenceRef.value) {
        // On pourrait déclencher un chargement additionnel ici si besoin
        // presenceStore.fetchSomethingElse();
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (observerPresenceRef.value) {
    observer.observe(observerPresenceRef.value);
  }
});
</script>

<style scoped>
/* Ajustements éventuels */
</style>
