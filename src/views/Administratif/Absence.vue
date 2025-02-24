<template>
  <div class="p-6 bg-lightbeige min-h-screen text-darkblue">
    <!-- Section principale, observée pour lazy loading -->
    <section
        ref="absenceObserverRef"
        class="bg-white shadow rounded max-w-4xl mx-auto p-6"
    >
      <h1 class="text-2xl font-bold mb-4">
        Gestion des Absences à Justifier (Admin)
      </h1>

      <!-- Skeleton de chargement -->
      <div v-if="loadingPresence" class="space-y-3">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div class="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Erreur -->
      <div v-else-if="errorPresence" class="text-red-600 mb-4">
        {{ errorPresence }}
      </div>

      <!-- Tableau des absences à justifier -->
      <div v-else-if="absencesToJustify.length">
        <table class="w-full border border-gray-200 divide-y divide-gray-200">
          <thead class="bg-gray-100">
          <tr>
            <th class="py-2 px-4 text-left text-sm font-semibold text-darkblue uppercase">
              Utilisateur
            </th>
            <th class="py-2 px-4 text-left text-sm font-semibold text-darkblue uppercase">
              Justificatif
            </th>
            <th class="py-2 px-4 text-left text-sm font-semibold text-darkblue uppercase">
              Actions
            </th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
          <tr
              v-for="absence in absencesToJustify"
              :key="absence.uid"
          >
            <td class="py-2 px-4 text-sm">
              {{ absence.id_user }}
            </td>
            <td class="py-2 px-4 text-sm">
              <input
                  v-model="absence.justificatifs"
                  placeholder="Ajouter justificatif"
                  class="border border-gray-300 rounded px-2 py-1 w-full"
              />
            </td>
            <td class="py-2 px-4 text-sm">
              <button
                  @click="onJustify(absence)"
                  class="bg-lightviolet text-white px-3 py-1 rounded hover:bg-violet"
              >
                Justifier
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Pas d'absences à justifier -->
      <div v-else>
        <p class="text-gray-700">
          Aucune absence à justifier.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { usePresenceStore } from '@/stores/presence.store';

// Récupération du store Presence
const presenceStore = usePresenceStore();
const {
  absencesToJustify,
  loadingPresence,
  errorPresence,
} = storeToRefs(presenceStore);

// Référence pour l’Intersection Observer (lazy loading)
const absenceObserverRef = ref(null);

onMounted(async () => {
  await presenceStore.fetchPresences();

  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target === absenceObserverRef.value) {
        // Charger d’autres données si nécessaire...
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (absenceObserverRef.value) {
    observer.observe(absenceObserverRef.value);
  }
});

async function onJustify(absence: any) {
  if (absence.justificatifs && absence.justificatifs.trim() !== '') {
    await presenceStore.updatePresence(absence);
  } else {
    alert('Veuillez renseigner le justificatif.');
  }
}
</script>
