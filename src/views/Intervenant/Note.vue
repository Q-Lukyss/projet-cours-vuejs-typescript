<template>
  <div>
    <h1>Gestion des Notes</h1>
    <!-- Affichage des formations -->
    <div v-if="loadingFormations || loadingCourses">
      Chargement des formations et cours...
    </div>
    <div v-else-if="errorFormations || errorCourses">
      <p v-if="errorFormations">{{ errorFormations }}</p>
      <p v-if="errorCourses">{{ errorCourses }}</p>
    </div>
    <div v-else>
      <div v-for="formationItem in formationsWithCourses" :key="formationItem.formation.uid" class="formation-group">
        <details>
          <summary>
            {{ formationItem.formation.nom }}
          </summary>
          <!-- Pour chaque cours de la formation -->
          <div v-for="course in formationItem.courses" :key="course.uid" class="course-group">
            <details>
              <summary>{{ course.nom }}</summary>
              <!-- Pour chaque élève inscrit dans la formation -->
              <div v-for="studentId in formationItem.formation.eleves" :key="studentId" class="student-group">
                <details @toggle="onStudentToggle(course.uid, studentId, $event)">
                  <summary>
                    Élève : {{ getStudentName(studentId) || studentId }}
                  </summary>
                  <!-- Affichage des notes pour cet élève dans ce cours -->
                  <div v-if="selectedStudentKey === studentKey(studentId, course.uid)">
                    <div v-if="loadingStudentNotesNotes">Chargement des notes...</div>
                    <div v-else-if="errorStudentNotesNotes">{{ errorStudentNotesNotes }}</div>
                    <div v-else>
                      <ul>
                        <li v-for="note in notesMap[studentKey(studentId, course.uid)] || []" :key="note.uid">
                          <span v-if="editingNoteId !== note.uid">
                            {{ note.libelle }} : {{ note.note }}
                          </span>
                          <input v-else v-model="editedNoteData.libelle" placeholder="Libellé" />
                          <input v-else v-model.number="editedNoteData.note" type="number" placeholder="Note" />
                          <button v-if="editingNoteId !== note.uid" @click="startEditing(note)">Modifier</button>
                          <button v-if="editingNoteId === note.uid" @click="saveNote(note, studentId, course.uid)">Enregistrer</button>
                          <button @click="deleteNoteItem(note.uid, studentId, course.uid)">Supprimer</button>
                        </li>
                      </ul>
                      <!-- Formulaire pour ajouter une nouvelle note -->
                      <div>
                        <input v-model="newNoteData.libelle" placeholder="Libellé" />
                        <input v-model.number="newNoteData.note" type="number" placeholder="Note" />
                        <button @click="addNewNote(course.uid, studentId)">Ajouter</button>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </details>
          </div>
        </details>
      </div>
      <div v-if="formationsWithCourses.length === 0">
        Vous n'enseignez aucun cours dans aucune formation.
      </div>
    </div>
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
const { notesMap, loadingStudentNotesNotes, errorStudentNotesNotes } = storeToRefs(noteStore);

// Fonction utilitaire pour créer une clé unique pour un élève et un cours
function studentKey(studentId: string, courseId: string): string {
  return `${studentId}_${courseId}`;
}

// Pour le moment, getStudentName retourne l'ID (à améliorer si vous souhaitez récupérer le nom de l'élève via un service User)
function getStudentName(studentId: string): string | null {
  return studentId;
}

// Calculer les formations dans lesquelles l'intervenant donne au moins un cours
const formationsWithCourses = computed(() => {
  return formations.value
      .map(formation => {
        const formationCourses = courses.value.filter(course => formation.cours.includes(course.uid));
        return { formation, courses: formationCourses };
      })
      .filter(item => item.courses.length > 0);
});

// Variables pour la gestion de l'affichage des notes
const selectedStudentKey = ref<string | null>(null);
const newNoteData = ref({ libelle: '', note: 0 });
const editingNoteId = ref<string | null>(null);
const editedNoteData = ref({ libelle: '', note: 0 });

// Lorsqu'un dropdown d'élève s'ouvre, charger ses notes pour le cours
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

// Pour démarrer l'édition d'une note
function startEditing(note: any) {
  editingNoteId.value = note.uid;
  editedNoteData.value = { libelle: note.libelle, note: note.note };
}

// Pour sauvegarder une note modifiée
async function saveNote(note: any, studentId: string, courseId: string) {
  if (editedNoteData.value.libelle.trim() !== '') {
    await noteStore.updateNote({
      uid: note.uid,
      id_user: studentId,
      id_cours: courseId,
      libelle: editedNoteData.value.libelle,
      note: editedNoteData.value.note
    });
    editingNoteId.value = null;
    editedNoteData.value = { libelle: '', note: 0 };
  }
}

// Pour supprimer une note
async function deleteNoteItem(noteId: string, studentId: string, courseId: string) {
  await noteStore.deleteNote(noteId, studentId, courseId);
}

// Pour ajouter une nouvelle note
async function addNewNote(courseId: string, studentId: string) {
  if (newNoteData.value.libelle.trim() !== '') {
    await noteStore.addNoteForStudent({
      uid: '', // Laissez Firestore générer l'ID
      id_user: studentId,
      id_cours: courseId,
      libelle: newNoteData.value.libelle,
      note: newNoteData.value.note
    });
    newNoteData.value = { libelle: '', note: 0 };
  }
}

onMounted(async () => {
  if (user.value && user.value.uid) {
    // Charger toutes les formations
    await formationStore.fetchFormations();
    // Charger les cours de l'intervenant
    await coursStore.fetchCoursesForIntervenant(user.value.uid);
  }
});
</script>

<style scoped>
.formation-group {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.course-group {
  margin-left: 1rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #eee;
}
.student-group {
  margin-left: 2rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
