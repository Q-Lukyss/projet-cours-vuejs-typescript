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

const documentStore = useDocumentStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const { documents, loading, error } = storeToRefs(documentStore);

const observerDocumentsRef = ref(null);

onMounted(() => {
  if (user.value && user.value.uid) {
    documentStore.fetchDocumentsForUser(user.value.uid);
  }

  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target === observerDocumentsRef.value) {
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (observerDocumentsRef.value) {
    observer.observe(observerDocumentsRef.value);
  }
});
</script>