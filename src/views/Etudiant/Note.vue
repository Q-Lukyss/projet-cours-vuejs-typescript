<template>
  <div class="p-6 bg-lightbeige min-h-screen text-darkblue">
    <section
        ref="observerCoursRef"
        class="bg-white p-6 rounded shadow max-w-4xl mx-auto"
    >
      <h1 class="text-2xl font-bold mb-4">Liste des Cours avec Notes</h1>

      <!-- Skeleton de chargement formation / cours -->
      <div v-if="loadingFormation || loadingCourses" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        </div>
      </div>

      <!-- Erreur formation / cours -->
      <div v-else-if="errorFormation || errorCourses">
        <p v-if="errorFormation" class="text-red-600">{{ errorFormation }}</p>
        <p v-if="errorCourses" class="text-red-600">{{ errorCourses }}</p>
      </div>

      <!-- Liste des cours -->
      <div v-else>
        <ul class="space-y-4">
          <li
              v-for="cours in courses"
              :key="cours.uid"
              class="border-b border-gray-200 pb-4"
          >
            <!-- Nom du cours (cliquable pour toggle) -->
            <div
                @click="toggleNotes(cours.uid)"
                class="cursor-pointer flex items-center justify-between"
            >
              <strong class="text-lg text-violet font-semibold">
                {{ cours.nom }}
              </strong>
              <!-- Icône ou petit indicateur (ex: flèche, +/−, etc.) -->
              <svg
                  v-if="expandedNotes[cours.uid]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5 text-darkblue"
              >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5 text-darkblue"
              >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>

            <!-- Notes (affichées si expandedNotes[cours.uid] est true) -->
            <transition name="fade" mode="out-in">
              <div v-if="expandedNotes[cours.uid]" class="mt-2">
                <!-- Skeleton chargement des notes -->
                <div v-if="loadingNotes[cours.uid]" class="space-y-2 animate-pulse">
                  <div class="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div class="h-4 bg-gray-300 rounded w-1/3"></div>
                </div>

                <!-- Liste des notes -->
                <div v-else>
                  <ul class="mt-1 space-y-1 list-disc list-inside ml-4">
                    <li
                        v-for="note in notesByCourse[cours.uid] || []"
                        :key="note.uid"
                        class="text-sm"
                    >
                      <span class="font-semibold">{{ note.libelle }}:</span>
                      <span>{{ note.note }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </transition>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCoursStore } from '@/stores/cours.store';
import { useAuthStore } from '@/stores/auth';
import { useNoteStore } from '@/stores/note.store';

const coursStore = useCoursStore();
const authStore = useAuthStore();
const noteStore = useNoteStore();

const {
  courses,
  loadingFormation,
  loadingCourses,
  errorFormation,
  errorCourses,
} = storeToRefs(coursStore);
const { user } = storeToRefs(authStore);

const expandedNotes = reactive<{ [courseId: string]: boolean }>({});
const loadingNotes = reactive<{ [courseId: string]: boolean }>({});
const notesByCourse = reactive<{ [courseId: string]: any[] }>({});

async function toggleNotes(courseId: string) {
  if (expandedNotes[courseId]) {
    // Si déjà ouvert, on referme
    expandedNotes[courseId] = false;
  } else {
    // Si fermé, on ouvre
    expandedNotes[courseId] = true;
    // Clé pour le store de notes
    const key = `${user.value!.uid}_${courseId}`;
    // Si les notes ne sont pas chargées, on les récupère
    if (!notesByCourse[courseId]) {
      loadingNotes[courseId] = true;
      await noteStore.fetchNotesForStudentAndCourse(user.value!.uid, courseId);
      notesByCourse[courseId] = noteStore.notesMap[key] || [];
      loadingNotes[courseId] = false;
    }
  }
}

// Observer pour lazy loading
const observerCoursRef = ref(null);

onMounted(() => {
  if (user.value && user.value.uid) {
    coursStore.fetchFormationAndCoursesForUser(user.value.uid);
  }

  // lazy loading
  const options = { root: null, rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target === observerCoursRef.value) {
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (observerCoursRef.value) {
    observer.observe(observerCoursRef.value);
  }
});

watch(
    user,
    (newUser) => {
      if (newUser && newUser.uid) {
        coursStore.fetchFormationAndCoursesForUser(newUser.uid);
      }
    },
    { immediate: true }
);
</script>
