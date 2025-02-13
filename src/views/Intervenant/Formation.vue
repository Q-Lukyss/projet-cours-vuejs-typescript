<template>
  <div>
    <h1>Mes Formations</h1>
    <div v-if="loadingFormations || loadingCourses">
      Chargement...
    </div>
    <div v-else-if="errorFormations || errorCourses">
      <p v-if="errorFormations">{{ errorFormations }}</p>
      <p v-if="errorCourses">{{ errorCourses }}</p>
    </div>
    <div v-else>
      <div v-for="item in formationsWithCourses" :key="item.formation.uid">
        <details>
          <summary>
            {{ item.formation.nom }} ({{ item.courses.length }} cours)
          </summary>
          <ul>
            <li v-for="course in item.courses" :key="course.uid">
              {{ course.nom }}
            </li>
          </ul>
        </details>
      </div>
      <div v-if="formationsWithCourses.length === 0">
        Vous ne donnez aucun cours dans aucune formation.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
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

// Calculer les formations dans lesquelles l'intervenant donne au moins un cours.
// Pour chaque formation, on vérifie si la liste des cours de la formation (formation.cours) contient
// au moins un cours issu des cours de l'intervenant (courses.value)
const formationsWithCourses = computed(() => {
  return formations.value
      .map(formation => {
        // Filtrer les cours de l'intervenant dont l'uid est dans la formation.cours
        const formationCourses = courses.value.filter(course => formation.cours.includes(course.uid));
        return { formation, courses: formationCourses };
      })
      .filter(item => item.courses.length > 0);
});

onMounted(async () => {
  if (user.value && user.value.uid) {
    // Charger les formations existantes
    await formationStore.fetchFormations();
    // Charger les cours donnés par l'intervenant (utiliser fetchCoursesForIntervenant)
    await coursStore.fetchCoursesForIntervenant(user.value.uid);
  }
});
</script>

<style scoped>
details {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

summary {
  cursor: pointer;
  font-weight: bold;
}
</style>
