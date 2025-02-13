// src/stores/cours.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Cours } from '@/entities/cours';
import { CoursService } from '@/services/cours.service';
import { Formation } from '@/entities/formation';
import { FormationService } from '@/services/formation.service';

export const useCoursStore = defineStore('cours', () => {
    // Pour la formation liée (ex. formation dont fait partie l'utilisateur)
    const formation = ref<Formation | null>(null);
    const loadingFormation = ref(false);
    const errorFormation = ref<string | null>(null);

    // Pour les cours
    const courses = ref<Cours[]>([]);
    const loadingCourses = ref(false);
    const errorCourses = ref<string | null>(null);

    const coursService = new CoursService();
    const formationService = new FormationService();

    // Pour l'administration, charger toutes les formations via FormationService
    // (On garde fetchFormations dans FormationStore pour cela)

    // Charge les cours dont l'id_enseignant correspond à l'intervenant
    async function fetchCoursesForIntervenant(teacherId: string) {
        loadingCourses.value = true;
        try {
            courses.value = await coursService.getCoursesForIntervenant(teacherId);
            loadingCourses.value = false;
        } catch (err: any) {
            errorCourses.value = err.message;
            loadingCourses.value = false;
        }
    }

    // Charge les cours associés à la formation (formation.cours étant un tableau d'UID)
    async function fetchCoursesForFormation() {
        if (formation.value) {
            loadingCourses.value = true;
            try {
                courses.value = await coursService.getCoursesByIds(formation.value.cours);
                loadingCourses.value = false;
            } catch (err: any) {
                errorCourses.value = err.message;
                loadingCourses.value = false;
            }
        } else {
            errorCourses.value = "Aucune formation trouvée.";
        }
    }

    // Méthode combinée si besoin (ici pour un utilisateur non admin)
    async function fetchFormationAndCoursesForUser(userId: string) {
        loadingFormation.value = true;
        try {
            formation.value = await formationService.getFormationForUser(userId);
            loadingFormation.value = false;
            if (formation.value) {
                await fetchCoursesForFormation();
            }
        } catch (err: any) {
            errorFormation.value = err.message;
            loadingFormation.value = false;
        }
    }

    // Méthodes d'administration pour les cours
    async function addCours(newCours: Cours) {
        try {
            await coursService.addCours(newCours);
            await fetchCourses();
        } catch (err: any) {
            errorCourses.value = err.message;
        }
    }

    async function updateCours(updatedCours: Cours) {
        try {
            await coursService.updateCours(updatedCours);
            await fetchCourses();
        } catch (err: any) {
            errorCourses.value = err.message;
        }
    }

    async function deleteCours(coursId: string) {
        try {
            await coursService.deleteCours(coursId);
            await fetchCourses();
        } catch (err: any) {
            errorCourses.value = err.message;
        }
    }

    // Méthode pour charger tous les cours (utile pour l'administration)
    async function fetchCourses() {
        loadingCourses.value = true;
        try {
            courses.value = await coursService.getCourses();
            loadingCourses.value = false;
        } catch (err: any) {
            errorCourses.value = err.message;
            loadingCourses.value = false;
        }
    }

    // Méthodes pour récupérer les notes et supports (déjà existantes, à utiliser selon le besoin)
    async function fetchNotes(courseId: string): Promise<any[]> {
        return await coursService.getCoursesByIds([courseId]);
    }
    async function fetchSupports(courseId: string): Promise<any[]> {
        return await coursService.getCoursesByIds([courseId]);
    }
    async function fetchFormationForUser(userId: string) {
        return await formationService.getFormationForUser(userId);
    }

    return {
        formation,
        courses,
        loadingFormation,
        errorFormation,
        loadingCourses,
        errorCourses,
        fetchFormationForUser, // Si besoin
        fetchCoursesForFormation,
        fetchFormationAndCoursesForUser,
        fetchCoursesForIntervenant,
        addCours,
        updateCours,
        deleteCours,
        fetchCourses, // pour admin
        fetchNotes,
        fetchSupports
    };
});
