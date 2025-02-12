<template>
  <div>
    <h1>Mes Documents</h1>
    <div v-if="loading">Chargement...</div>
    <div v-else-if="error">{{ error }}</div>
    <ul v-else>
      <li v-for="doc in documents" :key="doc.uid">
        <strong>{{ doc.nom }}</strong>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useDocumentStore } from '@/stores/document.store';
import { useAuthStore } from '@/stores/auth';

const documentStore = useDocumentStore();
const authStore = useAuthStore();

const { documents, loading, error } = storeToRefs(documentStore);
const { user } = storeToRefs(authStore);

onMounted(() => {
  if (user.value && user.value.uid) {
    documentStore.fetchDocumentsForUser(user.value.uid);
  }
});
</script>
