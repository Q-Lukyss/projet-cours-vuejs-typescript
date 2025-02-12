// src/stores/cours.store.ts
import {defineStore} from 'pinia';
import {ref} from 'vue';
import {Cours} from '@/entities/cours';
import {Note} from '@/entities/note';
import {Support} from '@/entities/support';
import {CoursService} from '@/services/cours.service';
import {NoteService} from '@/services/note.service';
import {SupportService} from '@/services/support.service';
import {Formation} from '@/entities/formation';
import {FormationService} from '@/services/formation.service';

export const useCoursStore = defineStore('cours', () => {
    // Pour la formation
    const formation = ref<Formation | null>(null);
    const loadingFormation = ref(false);
    const errorFormation = ref<string | null>(null);

    // Pour les cours
    const courses = ref<Cours[]>([]);
    const loadingCourses = ref(false);
    const errorCourses = ref<string | null>(null);

    const coursService = new CoursService();
    const noteService = new NoteService();
    const supportService = new SupportService();
    const formationService = new FormationService();

    // Récupère la formation pour l'utilisateur
    async function fetchFormationForUser(userId: string) {
        loadingFormation.value = true;
        try {
            formation.value = await formationService.getFormationForUser(userId);
            loadingFormation.value = false;
        } catch (err: any) {
            errorFormation.value = err.message;
            loadingFormation.value = false;
        }
    }

    // Récupère les cours à partir de la formation chargée
    async function fetchCoursesForUserFormation() {
        if (formation.value) {
            try {
                loadingCourses.value = true;
                courses.value = await coursService.getCoursesByIds(formation.value.cours);
                loadingCourses.value = false;
            } catch (err: any) {
                errorCourses.value = err.message;
                loadingCourses.value = false;
            }
        } else {
            errorCourses.value = "Aucune formation trouvée pour cet utilisateur.";
        }
    }

    // Combiner les deux actions pour récupérer la formation et ensuite les cours
    async function fetchFormationAndCoursesForUser(userId: string) {
        await fetchFormationForUser(userId);
        if (formation.value) {
            await fetchCoursesForUserFormation();
        }
    }

    // Récupère les notes pour un cours donné
    async function fetchNotes(courseId: string): Promise<Note[]> {
        return await noteService.getNotesForCourse(courseId);
    }

    // Récupère les supports pour un cours donné
    async function fetchSupports(courseId: string): Promise<Support[]> {
        return await supportService.getSupportsForCourse(courseId);
    }

    return {
        formation,
        courses,
        loadingFormation,
        errorFormation,
        loadingCourses,
        errorCourses,
        fetchFormationForUser,
        fetchCoursesForUserFormation,
        fetchFormationAndCoursesForUser,
        fetchNotes,
        fetchSupports
    };
});
