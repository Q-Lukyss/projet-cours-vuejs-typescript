// src/stores/formation.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Formation } from '@/entities/formation';
import { FormationService } from '@/services/formation.service';

export const useFormationStore = defineStore('formation', () => {
    const formations = ref<Formation[]>([]);
    const loadingFormations = ref(false);
    const errorFormations = ref<string | null>(null);

    const formationService = new FormationService();

    async function fetchFormations() {
        loadingFormations.value = true;
        try {
            formations.value = await formationService.getFormations();
            loadingFormations.value = false;
        } catch (err: any) {
            errorFormations.value = err.message;
            loadingFormations.value = false;
        }
    }


    async function addFormation(newFormation: Formation) {
        try {
            await formationService.addFormation(newFormation);
            await fetchFormations();
        } catch (err: any) {
            errorFormations.value = err.message;
        }
    }

    async function updateFormation(updatedFormation: Formation) {
        try {
            await formationService.updateFormation(updatedFormation);
            await fetchFormations();
        } catch (err: any) {
            errorFormations.value = err.message;
        }
    }

    async function deleteFormation(formationId: string) {
        try {
            await formationService.deleteFormation(formationId);
            await fetchFormations();
        } catch (err: any) {
            errorFormations.value = err.message;
        }
    }

    return { formations, loadingFormations, errorFormations, fetchFormations, addFormation, updateFormation, deleteFormation };
});
