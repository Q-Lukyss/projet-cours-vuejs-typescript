<template>
  <div>
    <h1>Liste des Cours avec Supports</h1>
    <div v-if="loadingFormation || loadingCourses">Chargement...</div>
    <div v-else-if="errorFormation || errorCourses">
      <p v-if="errorFormation">{{ errorFormation }}</p>
      <p v-if="errorCourses">{{ errorCourses }}</p>
    </div>
    <div v-else>
      <ul>
        <li v-for="cours in courses" :key="cours.uid">
          <!-- Cliquer sur le nom du cours pour basculer l'affichage des supports -->
          <div @click="toggleSupports(cours.uid)" style="cursor: pointer;">
            <strong>{{ cours.nom }}</strong>
          </div>
          <div v-if="expandedSupports[cours.uid]">
            <div v-if="loadingSupports[cours.uid]">Chargement des supports...</div>
            <div v-else>
              <ul>
                <li v-for="support in supportsByCourse[cours.uid] || []" :key="support.uid">
                  {{ support.nom }}
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCoursStore } from '@/stores/cours.store';
import { useAuthStore } from '@/stores/auth';

const coursStore = useCoursStore();
const authStore = useAuthStore();

const { courses, loadingFormation, loadingCourses, errorFormation, errorCourses } = storeToRefs(coursStore);
const { user } = storeToRefs(authStore);

const expandedSupports = reactive<{ [courseId: string]: boolean }>({});
const loadingSupports = reactive<{ [courseId: string]: boolean }>({});
const supportsByCourse = reactive<{ [courseId: string]: any[] }>({});

async function toggleSupports(courseId: string) {
  if (expandedSupports[courseId]) {
    expandedSupports[courseId] = false;
  } else {
    expandedSupports[courseId] = true;
    if (!supportsByCourse[courseId]) {
      loadingSupports[courseId] = true;
      const supports = await coursStore.fetchSupports(courseId);
      supportsByCourse[courseId] = supports;
      loadingSupports[courseId] = false;
    }
  }
}

watch(user, (newUser) => {
  if (newUser && newUser.uid) {
    coursStore.fetchFormationAndCoursesForUser(newUser.uid);
  }
}, { immediate: true });
</script>
