// src/stores/support.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Support } from '@/entities/support';
import { SupportService } from '@/services/support.service';

export const useSupportStore = defineStore('support', () => {
    const supports = ref<Support[]>([]);
    const loadingSupports = ref(false);
    const errorSupports = ref<string | null>(null);

    const supportService = new SupportService();

    async function fetchSupportsForCourse(courseId: string) {
        loadingSupports.value = true;
        try {
            supports.value = await supportService.getSupportsForCourse(courseId);
            loadingSupports.value = false;
        } catch (err: any) {
            errorSupports.value = err.message;
            loadingSupports.value = false;
        }
    }

    async function addSupport(support: Support) {
        try {
            await supportService.addSupport(support);
            // Rafraîchir la liste pour le cours concerné
            await fetchSupportsForCourse(support.id_cours);
        } catch (err: any) {
            errorSupports.value = err.message;
        }
    }

    async function updateSupport(support: Support) {
        try {
            await supportService.updateSupport(support);
            await fetchSupportsForCourse(support.id_cours);
        } catch (err: any) {
            errorSupports.value = err.message;
        }
    }

    async function deleteSupport(supportId: string, courseId: string) {
        try {
            await supportService.deleteSupport(supportId);
            await fetchSupportsForCourse(courseId);
        } catch (err: any) {
            errorSupports.value = err.message;
        }
    }

    return { supports, loadingSupports, errorSupports, fetchSupportsForCourse, addSupport, updateSupport, deleteSupport };
});
