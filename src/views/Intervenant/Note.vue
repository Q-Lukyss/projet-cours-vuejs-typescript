<template>
  <div class="p-6 bg-lightbeige min-h-screen text-darkblue">
    <section
        ref="observerNotesRef"
        class="bg-white p-6 rounded shadow max-w-5xl mx-auto"
    >
      <h1 class="text-2xl font-bold mb-4">Gestion des Notes</h1>

      <!-- Skeleton de chargement formations / cours -->
      <div v-if="loadingFormations || loadingCourses" class="space-y-4">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div class="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div class="animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div class="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>

      <!-- Erreurs -->
      <div v-else-if="errorFormations || errorCourses" class="space-y-2 text-red-600">
        <p v-if="errorFormations">{{ errorFormations }}</p>
        <p v-if="errorCourses">{{ errorCourses }}</p>
      </div>

      <!-- Contenu principal -->
      <div v-else>
        <!-- Liste des formations -->
        <div
            v-for="formationItem in formationsWithCourses"
            :key="formationItem.formation.uid"
            class="mb-4 border border-gray-200 rounded p-4"
        >
          <details class="group mb-2">
            <summary class="cursor-pointer font-semibold text-lg outline-none">
              {{ formationItem.formation.nom }}
            </summary>

            <!-- Pour chaque cours -->
            <div
                v-for="course in formationItem.courses"
                :key="course.uid"
                class="ml-4 mt-2 border-l border-gray-200 pl-4"
            >
              <details class="group mb-2">
                <summary class="cursor-pointer font-medium text-base outline-none">
                  {{ course.nom }}
                </summary>

                <!-- Pour chaque élève -->
                <div
                    v-for="studentId in formationItem.formation.eleves"
                    :key="studentId"
                    class="ml-4 mt-2 border-l border-gray-200 pl-4"
                >
                  <details
                      @toggle="onStudentToggle(course.uid, studentId, $event)"
                      class="group mb-2"
                  >
                    <summary class="cursor-pointer text-base outline-none">
                      Élève : {{ getStudentName(studentId) || studentId }}
                    </summary>

                    <!-- Bloc de notes pour cet élève + cours -->
                    <div
                        v-if="selectedStudentKey === studentKey(studentId, course.uid)"
                        class="ml-4 mt-2"
                    >
                      <!-- Skeleton chargement des notes d'un élève -->
                      <div v-if="loadingStudentNotes" class="space-y-2 animate-pulse">
                        <div class="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                        <div class="h-4 bg-gray-300 rounded w-1/3"></div>
                      </div>
                      <div v-else-if="errorStudentNotes" class="text-red-600">
                        {{ errorStudentNotes }}
                      </div>
                      <div v-else>
                        <ul class="mb-2 space-y-2">
                          <li
                              v-for="note in notesMap[studentKey(studentId, course.uid)] || []"
                              :key="note.uid"
                              class="flex flex-col sm:flex-row sm:items-center gap-2"
                          >
                            <!-- Mode affichage -->
                            <span
                                v-if="editingNoteId !== note.uid"
                                class="flex-1"
                            >
                              {{ note.libelle }} : {{ note.note }}
                            </span>
                            <!-- Mode édition -->
                            <div v-else class="flex-1 flex flex-col sm:flex-row gap-2">
                              <input
                                  v-model="editedNoteData.libelle"
                                  class="border rounded px-2 py-1 w-40"
                                  placeholder="Libellé"
                              />
                              <input
                                  v-model.number="editedNoteData.note"
                                  type="number"
                                  class="border rounded px-2 py-1 w-20"
                                  placeholder="Note"
                              />
                            </div>

                            <!-- Boutons -->
                            <div class="space-x-2">
                              <button
                                  v-if="editingNoteId !== note.uid"
                                  @click="startEditing(note)"
                                  class="px-2 py-1 text-sm bg-lightviolet text-white rounded"
                              >
                                Modifier
                              </button>
                              <button
                                  v-if="editingNoteId === note.uid"
                                  @click="saveNote(note, studentId, course.uid)"
                                  class="px-2 py-1 text-sm bg-violet text-white rounded"
                              >
                                Enregistrer
                              </button>
                              <button
                                  @click="deleteNoteItem(note.uid, studentId, course.uid)"
                                  class="px-2 py-1 text-sm bg-red-500 text-white rounded"
                              >
                                Supprimer
                              </button>
                            </div>
                          </li>
                        </ul>

                        <!-- Formulaire pour ajouter une nouvelle note -->
                        <div class="flex items-center gap-2">
                          <input
                              v-model="newNoteData.libelle"
                              class="border rounded px-2 py-1 w-40"
                              placeholder="Libellé"
                          />
                          <input
                              v-model.number="newNoteData.note"
                              type="number"
                              class="border rounded px-2 py-1 w-20"
                              placeholder="Note"
                          />
                          <button
                              @click="addNewNote(course.uid, studentId)"
                              class="px-2 py-1 text-sm bg-darkblue text-white rounded"
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </details>
            </div>
          </details>
        </div>

        <!-- Aucune formation/cours -->
        <div v-if="formationsWithCourses.length === 0" class="text-gray-700">
          Vous n'enseignez aucun cours dans aucune formation.
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useCoursStore } from '@/stores/cours.store';
import { useFormationStore } from '@/stores/formation.store';
import { useNoteStore } from '@/stores/note.store';

const authStore = useAuthStore();
const coursStore = useCoursStore();
const formationStore = useFormationStore();
const noteStore = useNoteStore();

const { user } = storeToRefs(authStore);
const { courses, loadingCourses, errorCourses } = storeToRefs(coursStore);
const { formations, loadingFormations, errorFormations } = storeToRefs(formationStore);
const {
  notesMap,
  loadingStudentNotes,
  errorStudentNotes,
} = storeToRefs(noteStore);

// Fonction utilitaire pour créer une clé unique élève-cours
function studentKey(studentId: string, courseId: string): string {
  return `${studentId}_${courseId}`;
}

function getStudentName(studentId: string): string | null {
  return studentId;
}

// Calculer les formations dans lesquelles l'intervenant donne au moins un cours
const formationsWithCourses = computed(() => {
  return formations.value
      .map((formation) => {
        const formationCourses = courses.value.filter((course) =>
            formation.cours.includes(course.uid)
        );
        return { formation, courses: formationCourses };
      })
      .filter((item) => item.courses.length > 0);
});

const selectedStudentKey = ref<string | null>(null);
const newNoteData = ref({ libelle: '', note: 0 });
const editingNoteId = ref<string | null>(null);
const editedNoteData = ref({ libelle: '', note: 0 });

async function onStudentToggle(courseId: string, studentId: string, event: Event) {
  const detailsEl = event.target as HTMLDetailsElement;
  if (detailsEl.open) {
    selectedStudentKey.value = studentKey(studentId, courseId);
    await noteStore.fetchNotesForStudentAndCourse(studentId, courseId);
  } else {
    if (selectedStudentKey.value === studentKey(studentId, courseId)) {
      selectedStudentKey.value = null;
    }
  }
}

function startEditing(note: any) {
  editingNoteId.value = note.uid;
  editedNoteData.value = { libelle: note.libelle, note: note.note };
}

async function saveNote(note: any, studentId: string, courseId: string) {
  if (editedNoteData.value.libelle.trim() !== '') {
    await noteStore.updateNote({
      uid: note.uid,
      id_user: studentId,
      id_cours: courseId,
      libelle: editedNoteData.value.libelle,
      note: editedNoteData.value.note,
    });
    editingNoteId.value = null;
    editedNoteData.value = { libelle: '', note: 0 };
  }
}

async function deleteNoteItem(noteId: string, studentId: string, courseId: string) {
  await noteStore.deleteNote(noteId, studentId, courseId);
}

async function addNewNote(courseId: string, studentId: string) {
  if (newNoteData.value.libelle.trim() !== '') {
    await noteStore.addNoteForStudent({
      uid: '',
      id_user: studentId,
      id_cours: courseId,
      libelle: newNoteData.value.libelle,
      note: newNoteData.value.note,
    });
    newNoteData.value = { libelle: '', note: 0 };
  }
}

onMounted(async () => {
  if (user.value && user.value.uid) {
    await formationStore.fetchFormations();
    await coursStore.fetchCoursesForIntervenant(user.value.uid);
  }
});

const observerNotesRef = ref(null);

onMounted(() => {
  const options = { root: null, rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target === observerNotesRef.value) {
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (observerNotesRef.value) {
    observer.observe(observerNotesRef.value);
  }
});
</script>

<style scoped>
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
