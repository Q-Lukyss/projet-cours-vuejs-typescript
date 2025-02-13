<template>
  <div>
    <h1>Support de Cours</h1>

    <!-- Affichage du dropdown pour les formations avec cours -->
    <div v-if="loadingFormations || loadingCourses">
      Chargement des formations...
    </div>
    <div v-else-if="errorFormations || errorCourses">
      <p v-if="errorFormations">{{ errorFormations }}</p>
      <p v-if="errorCourses">{{ errorCourses }}</p>
    </div>
    <div v-else>
      <div v-for="formationItem in formationsWithCourses" :key="formationItem.formation.uid" class="formation-group">
        <details>
          <summary>
            {{ formationItem.formation.nom }} ({{ formationItem.courses.length }} cours)
          </summary>
          <!-- Pour chaque cours de la formation -->
          <div v-for="course in formationItem.courses" :key="course.uid" class="course-group">
            <details @toggle="onCourseToggle(course.uid, $event)">
              <summary>
                {{ course.nom }}
              </summary>
              <!-- Afficher les supports pour le cours sélectionné -->
              <div v-if="selectedCourseId === course.uid">
                <div v-if="loadingSupports">Chargement des supports...</div>
                <div v-else-if="errorSupports">{{ errorSupports }}</div>
                <div v-else>
                  <ul>
                    <li v-for="support in supports" :key="support.uid">
                      <!-- Si en mode édition pour ce support, afficher un input -->
                      <span v-if="editingSupportId !== support.uid">{{ support.nom }}</span>
                      <input v-else v-model="editedSupportName" />
                      <button v-if="editingSupportId !== support.uid" @click="startEditing(support)">Modifier</button>
                      <button v-if="editingSupportId === support.uid" @click="saveSupport(support)">Enregistrer</button>
                      <button @click="deleteSupport(support.uid)">Supprimer</button>
                    </li>
                  </ul>
                  <!-- Formulaire pour ajouter un nouveau support -->
                  <div>
                    <input v-model="newSupportName" placeholder="Nouveau support" />
                    <button @click="addNewSupport(course.uid)">Ajouter</button>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </details>
      </div>
      <div v-if="formationsWithCourses.length === 0">
        Vous ne donnez aucun cours dans aucune formation.
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
import { useSupportStore } from '@/stores/support.store';

const authStore = useAuthStore();
const coursStore = useCoursStore();
const formationStore = useFormationStore();
const supportStore = useSupportStore();

const { user } = storeToRefs(authStore);
const { courses, loadingCourses, errorCourses } = storeToRefs(coursStore);
const { formations, loadingFormations, errorFormations } = storeToRefs(formationStore);
const { supports, loadingSupports, errorSupports } = storeToRefs(supportStore);

// Calculer les formations dans lesquelles l'intervenant donne au moins un cours
const formationsWithCourses = computed(() => {
  return formations.value
      .map(formation => {
        const formationCourses = courses.value.filter(course => formation.cours.includes(course.uid));
        return { formation, courses: formationCourses };
      })
      .filter(item => item.courses.length > 0);
});

// Pour gérer le support du cours sélectionné
const selectedCourseId = ref<string | null>(null);
const newSupportName = ref('');
const editingSupportId = ref<string | null>(null);
const editedSupportName = ref('');

// Lorsqu'un cours est ouvert, charger ses supports
async function onCourseToggle(courseId: string, event: Event) {
  const detailsEl = event.target as HTMLDetailsElement;
  if (detailsEl.open) {
    selectedCourseId.value = courseId;
    await supportStore.fetchSupportsForCourse(courseId);
  } else {
    if (selectedCourseId.value === courseId) {
      selectedCourseId.value = null;
    }
  }
}

// Pour démarrer l'édition d'un support
function startEditing(support: any) {
  editingSupportId.value = support.uid;
  editedSupportName.value = support.nom;
}

// Pour sauvegarder le support modifié
async function saveSupport(support: any) {
  if (editedSupportName.value.trim() !== '') {
    await supportStore.updateSupport({ uid: support.uid, id_cours: support.id_cours, nom: editedSupportName.value });
    editingSupportId.value = null;
    editedSupportName.value = '';
  }
}

// Pour supprimer un support
async function deleteSupport(supportId: string) {
  if (selectedCourseId.value) {
    await supportStore.deleteSupport(supportId, selectedCourseId.value);
  }
}

// Pour ajouter un nouveau support
async function addNewSupport(courseId: string) {
  if (newSupportName.value.trim() !== '') {
    await supportStore.addSupport({ uid: '', id_cours: courseId, nom: newSupportName.value });
    newSupportName.value = '';
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
</style>
