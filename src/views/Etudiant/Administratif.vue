<template>
  <div class="p-6 bg-lightbeige min-h-screen text-darkblue">
    <!-- Section “Mes Documents” -->
    <section
        ref="observerDocumentsRef"
        class="bg-white p-6 rounded shadow max-w-3xl mx-auto"
    >
      <h1 class="text-2xl font-bold mb-6">Mes Documents</h1>

      <!-- Skeletons de chargement -->
      <div v-if="loading" class="space-y-4">
        <div v-for="n in 3" :key="n" class="animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        </div>
      </div>

      <!-- Erreur -->
      <div v-else-if="error" class="text-red-600">
        {{ error }}
      </div>

      <!-- Liste des documents -->
      <ul v-else class="list-inside list-disc space-y-2">
        <li
            v-for="doc in documents"
            :key="doc.uid"
            class="flex items-center gap-2"
        >
          <strong class="font-semibold text-darkblue">
            {{ doc.nom }}
          </strong>
          <!-- Exemple: icône ou autre info sur le doc -->
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useDocumentStore } from '@/stores/document.store';
import { useAuthStore } from '@/stores/auth';

// Stores
const documentStore = useDocumentStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// Données du store “document”
const { documents, loading, error } = storeToRefs(documentStore);

// Référence pour le lazy loading (IntersectionObserver)
const observerDocumentsRef = ref(null);

onMounted(() => {
  // Charger les documents pour l’utilisateur
  if (user.value && user.value.uid) {
    documentStore.fetchDocumentsForUser(user.value.uid);
  }

  // Exemple de lazy loading : on observe si la section “Mes Documents” apparaît à l’écran
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1, // déclenché quand 10% de l’élément est visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target === observerDocumentsRef.value) {
        // Ici tu pourrais charger des infos supplémentaires,
        // comme d’autres détails de document, etc.
        // documentStore.fetchAdditionalDocumentData();

        // On arrête l’observation pour éviter de re-déclencher
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (observerDocumentsRef.value) {
    observer.observe(observerDocumentsRef.value);
  }
});
</script>

<style scoped>
/* Styles additionnels si besoin, sinon tout se gère dans Tailwind */
</style>
