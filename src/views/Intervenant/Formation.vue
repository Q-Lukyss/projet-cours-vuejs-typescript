<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useCoursStore } from '@/stores/cours.store';
import { useFormationStore } from '@/stores/formation.store';

const authStore = useAuthStore();
const coursStore = useCoursStore();
const formationStore = useFormationStore();

const { user } = storeToRefs(authStore);
const { courses, loadingCourses, errorCourses } = storeToRefs(coursStore);
const { formations, loadingFormations, errorFormations } = storeToRefs(formationStore);

// Calculer les formations dans lesquelles l'intervenant donne au moins un cours
// Pour chaque formation, on vérifie si la liste des cours de la formation (formation.cours)
// contient au moins un cours issu des cours de l'intervenant
const formationsWithCourses = computed(() => {
  return formations.value
      .map((formation) => {
        // Filtrer les cours de l'intervenant dont l'uid est dans la formation.cours
        const formationCourses = courses.value.filter((course) =>
            formation.cours.includes(course.uid)
        );
        return { formation, courses: formationCourses };
      })
      .filter((item) => item.courses.length > 0);
});

// Au montage, on récupère les formations et les cours de l'intervenant
onMounted(async () => {
  if (user.value && user.value.uid) {
    await formationStore.fetchFormations();
    await coursStore.fetchCoursesForIntervenant(user.value.uid);
  }
});

// IntersectionObserver (lazy loading) si besoin
const observerFormationsRef = ref(null);
onMounted(() => {
  const options = { root: null, rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target === observerFormationsRef.value) {
        // Possibilité de déclencher un chargement additionnel
        // formationStore.fetchSomethingElse();
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (observerFormationsRef.value) {
    observer.observe(observerFormationsRef.value);
  }
});
</script>

<template>
  <div class="p-6 bg-lightbeige min-h-screen text-darkblue">
    <section
        ref="observerFormationsRef"
        class="bg-white p-6 rounded shadow max-w-4xl mx-auto"
    >
      <h1 class="text-2xl font-bold mb-4">Mes Formations</h1>

      <!-- Skeleton de chargement -->
      <div v-if="loadingFormations || loadingCourses" class="space-y-4">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div class="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Erreurs -->
      <div v-else-if="errorFormations || errorCourses" class="text-red-600 space-y-2">
        <p v-if="errorFormations">{{ errorFormations }}</p>
        <p v-if="errorCourses">{{ errorCourses }}</p>
      </div>

      <!-- Liste des formations + cours -->
      <div v-else>
        <!-- S'il y a des formations avec des cours -->
        <div
            v-for="item in formationsWithCourses"
            :key="item.formation.uid"
            class="mb-4 border border-gray-200 rounded p-4"
        >
          <details class="group">
            <summary class="cursor-pointer font-semibold text-lg mb-2 outline-none">
              {{ item.formation.nom }}
              <span class="text-sm text-gray-600 ml-2">
                ({{ item.courses.length }} cours)
              </span>
            </summary>
            <ul class="list-disc list-inside ml-4 space-y-1 mt-2">
              <li
                  v-for="course in item.courses"
                  :key="course.uid"
                  class="text-sm"
              >
                {{ course.nom }}
              </li>
            </ul>
          </details>
        </div>

        <!-- S'il n'y a aucune formation avec cours -->
        <div v-if="formationsWithCourses.length === 0" class="text-gray-700">
          Vous ne donnez aucun cours dans aucune formation.
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* On peut aussi personnaliser l'aspect <details>/<summary> si besoin */
details {
  outline: none;
}
summary::-webkit-details-marker {
  display: none;
}
summary:focus {
  outline: none;
}
</style>
