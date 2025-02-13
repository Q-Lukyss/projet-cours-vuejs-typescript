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
import { useNoteStore } from '@/stores/note.store';

const coursStore = useCoursStore();
const authStore = useAuthStore();
const noteStore = useNoteStore();

// Extraire les états du cours et de l'utilisateur
const { courses, loadingFormation, loadingCourses, errorFormation, errorCourses } = storeToRefs(coursStore);
const { user } = storeToRefs(authStore);

// Objets réactifs pour suivre l'affichage et le chargement des notes par cours
const expandedNotes = reactive<{ [courseId: string]: boolean }>({});
const loadingNotes = reactive<{ [courseId: string]: boolean }>({});
const notesByCourse = reactive<{ [courseId: string]: any[] }>({});

// Fonction de toggle pour les notes en utilisant le noteStore
async function toggleNotes(courseId: string) {
  if (expandedNotes[courseId]) {
    expandedNotes[courseId] = false;
  } else {
    expandedNotes[courseId] = true;
    const key = `${user.value!.uid}_${courseId}`;
    // Si les notes n'ont pas encore été récupérées, on les charge depuis le noteStore
    if (!notesByCourse[courseId]) {
      loadingNotes[courseId] = true;
      await noteStore.fetchNotesForStudentAndCourse(user.value!.uid, courseId);
      // On met à jour notre objet local avec les notes récupérées dans le noteStore
      notesByCourse[courseId] = noteStore.notesMap[key] || [];
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
