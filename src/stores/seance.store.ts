// src/stores/seance.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SeanceEntity } from '@/entities/seance';
import { SeanceService } from '@/services/seance.service';

export const useSeanceStore = defineStore('seance', () => {
    const upcomingSeances = ref<SeanceEntity[]>([]);
    const loadingSeances = ref(false);
    const errorSeances = ref<string | null>(null);

    const seanceService = new SeanceService();

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


    return { upcomingSeances, loadingSeances, errorSeances, fetchUpcomingSeancesForCourses };
});
