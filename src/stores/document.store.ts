// src/stores/document.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DocumentEntity } from '@/entities/document';
import { DocumentService } from '@/services/document.service';

export const useDocumentStore = defineStore('document', () => {
    const documents = ref<DocumentEntity[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const documentService = new DocumentService();

    // Action pour récupérer les documents de l'utilisateur connecté
    async function fetchDocumentsForUser(userId: string) {
        loading.value = true;
        try {
            documents.value = await documentService.getDocumentsForUser(userId);
            loading.value = false;
        } catch (err: any) {
            error.value = err.message;
            loading.value = false;
        }
    }

    return { documents, loading, error, fetchDocumentsForUser };
});
