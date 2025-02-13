// src/stores/seance.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SeanceEntity } from '@/entities/seance';
import { SeanceService } from '@/services/seance.service';

export const useSeanceStore = defineStore('seance', () => {
    const seances = ref<SeanceEntity[]>([]);
    const upcomingSeances = ref<SeanceEntity[]>([]);
    const loadingSeances = ref(false);
    const errorSeances = ref<string | null>(null);

    const seanceService = new SeanceService();

    async function fetchSeancesForCourse(courseId: string) {
        loadingSeances.value = true;
        try {
            seances.value = await seanceService.getSeancesForCourse(courseId);
            loadingSeances.value = false;
        } catch (err: any) {
            errorSeances.value = err.message;
            loadingSeances.value = false;
        }
    }

    async function fetchUpcomingSeancesForCourses(courseIds: string[]) {
        loadingSeances.value = true;
        try {
            upcomingSeances.value = await seanceService.getUpcomingSeancesForCourses(courseIds);
            loadingSeances.value = false;
        } catch (err: any) {
            errorSeances.value = err.message;
            loadingSeances.value = false;
        }
    }

    async function addSeance(seance: SeanceEntity) {
        try {
            await seanceService.addSeance(seance);
            await fetchSeancesForCourse(seance.id_cours);
        } catch (err: any) {
            errorSeances.value = err.message;
        }
    }

    async function updateSeance(seance: SeanceEntity) {
        try {
            await seanceService.updateSeance(seance);
            await fetchSeancesForCourse(seance.id_cours);
        } catch (err: any) {
            errorSeances.value = err.message;
        }
    }

    async function deleteSeance(seanceId: string, courseId: string) {
        try {
            await seanceService.deleteSeance(seanceId);
            await fetchSeancesForCourse(courseId);
        } catch (err: any) {
            errorSeances.value = err.message;
        }
    }

    return { seances, loadingSeances, errorSeances, upcomingSeances, fetchSeancesForCourse, addSeance, updateSeance, deleteSeance, fetchUpcomingSeancesForCourses };
});
