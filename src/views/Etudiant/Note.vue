<template>
  <div>
    <h1>Liste des Cours avec Notes</h1>
    <div v-if="loadingFormation || loadingCourses">Chargement...</div>
    <div v-else-if="errorFormation || errorCourses">
      <p v-if="errorFormation">{{ errorFormation }}</p>
      <p v-if="errorCourses">{{ errorCourses }}</p>
    </div>
    <div v-else>
      <ul>
        <li v-for="cours in courses" :key="cours.uid">
          <!-- Cliquer sur le nom du cours pour basculer l'affichage des notes -->
          <div @click="toggleNotes(cours.uid)" style="cursor: pointer;">
            <strong>{{ cours.nom }}</strong>
          </div>
          <div v-if="expandedNotes[cours.uid]">
            <div v-if="loadingNotes[cours.uid]">Chargement des notes...</div>
            <div v-else>
              <ul>
                <li v-for="note in notesByCourse[cours.uid] || []" :key="note.uid">
                  {{ note.libelle }} : {{ note.note }}
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

// Extraire uniquement les états (state) du store
const { courses, loadingFormation, loadingCourses, errorFormation, errorCourses } = storeToRefs(coursStore);
const { user } = storeToRefs(authStore);

// Objets réactifs pour suivre l'affichage et le chargement des notes par cours
const expandedNotes = reactive<{ [courseId: string]: boolean }>({});
const loadingNotes = reactive<{ [courseId: string]: boolean }>({});
const notesByCourse = reactive<{ [courseId: string]: any[] }>({});

// Fonction de toggle pour les notes
async function toggleNotes(courseId: string) {
  if (expandedNotes[courseId]) {
    expandedNotes[courseId] = false;
  } else {
    expandedNotes[courseId] = true;
    if (!notesByCourse[courseId]) {
      loadingNotes[courseId] = true;
      const notes = await coursStore.fetchNotes(courseId);
      notesByCourse[courseId] = notes;
      loadingNotes[courseId] = false;
    }
  }
}

// Dès que l'utilisateur est disponible, on récupère la formation et les cours correspondants
watch(user, (newUser) => {
  if (newUser && newUser.uid) {
    coursStore.fetchFormationAndCoursesForUser(newUser.uid);
  }
}, { immediate: true });
</script>
