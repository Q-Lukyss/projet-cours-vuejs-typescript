<template>
  <div class="p-6 bg-lightbeige min-h-screen text-darkblue">
    <section
        ref="observerSupportRef"
        class="bg-white p-6 rounded shadow max-w-4xl mx-auto"
    >
      <h1 class="text-2xl font-bold mb-4">Support de Cours</h1>

      <!-- Skeleton de chargement formations / cours -->
      <div v-if="loadingFormations || loadingCourses" class="space-y-4">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div class="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Erreurs formations / cours -->
      <div v-else-if="errorFormations || errorCourses" class="text-red-600 space-y-2">
        <p v-if="errorFormations">{{ errorFormations }}</p>
        <p v-if="errorCourses">{{ errorCourses }}</p>
      </div>

      <!-- Contenu principal -->
      <div v-else>
        <!-- Liste des formations + cours -->
        <div
            v-for="formationItem in formationsWithCourses"
            :key="formationItem.formation.uid"
            class="border border-gray-200 rounded p-4 mb-4"
        >
          <details class="group mb-2">
            <summary class="cursor-pointer font-semibold text-lg outline-none">
              {{ formationItem.formation.nom }}
              <span class="text-sm text-gray-600 ml-2">
                ({{ formationItem.courses.length }} cours)
              </span>
            </summary>

            <!-- Pour chaque cours de la formation -->
            <div
                v-for="course in formationItem.courses"
                :key="course.uid"
                class="ml-4 mt-2 border-l border-gray-200 pl-4"
            >
              <details @toggle="onCourseToggle(course.uid, $event)" class="group mb-2">
                <summary class="cursor-pointer text-base font-medium outline-none">
                  {{ course.nom }}
                </summary>

                <!-- Affiche les supports si ce cours est sélectionné -->
                <div
                    v-if="selectedCourseId === course.uid"
                    class="ml-4 mt-2"
                >
                  <!-- Skeleton de chargement des supports -->
                  <div v-if="loadingSupports" class="space-y-2 animate-pulse">
                    <div class="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div class="h-4 bg-gray-300 rounded w-1/3"></div>
                  </div>

                  <!-- Erreur dans le chargement des supports -->
                  <div v-else-if="errorSupports" class="text-red-600">
                    {{ errorSupports }}
                  </div>

                  <!-- Liste des supports -->
                  <div v-else>
                    <ul class="space-y-2 mb-2">
                      <li
                          v-for="support in supports"
                          :key="support.uid"
                          class="flex flex-col sm:flex-row sm:items-center gap-2"
                      >
                        <!-- Mode affichage -->
                        <span
                            v-if="editingSupportId !== support.uid"
                            class="flex-1"
                        >
                          {{ support.nom }}
                        </span>

                        <!-- Mode édition -->
                        <input
                            v-else
                            v-model="editedSupportName"
                            class="border rounded px-2 py-1 flex-1 w-40"
                        />

                        <!-- Boutons -->
                        <div class="space-x-2">
                          <button
                              v-if="editingSupportId !== support.uid"
                              @click="startEditing(support)"
                              class="px-2 py-1 text-sm bg-lightviolet text-white rounded"
                          >
                            Modifier
                          </button>
                          <button
                              v-if="editingSupportId === support.uid"
                              @click="saveSupport(support)"
                              class="px-2 py-1 text-sm bg-violet text-white rounded"
                          >
                            Enregistrer
                          </button>
                          <button
                              @click="deleteSupportItem(support.uid)"
                              class="px-2 py-1 text-sm bg-red-500 text-white rounded"
                          >
                            Supprimer
                          </button>
                        </div>
                      </li>
                    </ul>

                    <!-- Formulaire pour ajouter un nouveau support -->
                    <div class="flex items-center gap-2">
                      <input
                          v-model="newSupportName"
                          placeholder="Nouveau support"
                          class="border rounded px-2 py-1 w-40"
                      />
                      <button
                          @click="addNewSupport(course.uid)"
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

        <!-- Si aucune formation/cours -->
        <div v-if="formationsWithCourses.length === 0" class="text-gray-700">
          Vous ne donnez aucun cours dans aucune formation.
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
      .map((formation) => {
        const formationCourses = courses.value.filter((course) =>
            formation.cours.includes(course.uid)
        );
        return { formation, courses: formationCourses };
      })
      .filter((item) => item.courses.length > 0);
});

const selectedCourseId = ref<string | null>(null);
const newSupportName = ref('');
const editingSupportId = ref<string | null>(null);
const editedSupportName = ref('');

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

function startEditing(support: any) {
  editingSupportId.value = support.uid;
  editedSupportName.value = support.nom;
}

async function saveSupport(support: any) {
  if (editedSupportName.value.trim() !== '') {
    await supportStore.updateSupport({
      uid: support.uid,
      id_cours: support.id_cours,
      nom: editedSupportName.value,
    });
    editingSupportId.value = null;
    editedSupportName.value = '';
  }
}

async function deleteSupportItem(supportId: string) {
  if (selectedCourseId.value) {
    await supportStore.deleteSupport(supportId, selectedCourseId.value);
  }
}

async function addNewSupport(courseId: string) {
  if (newSupportName.value.trim() !== '') {
    await supportStore.addSupport({
      uid: '', // Firestore ou autre générera l'ID
      id_cours: courseId,
      nom: newSupportName.value,
    });
    newSupportName.value = '';
  }
}

onMounted(async () => {
  if (user.value && user.value.uid) {
    await formationStore.fetchFormations();
    await coursStore.fetchCoursesForIntervenant(user.value.uid);
  }
});

const observerSupportRef = ref(null);
onMounted(() => {
  const options = { root: null, rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target === observerSupportRef.value) {
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (observerSupportRef.value) {
    observer.observe(observerSupportRef.value);
  }
});
</script>

<style scoped>
details {
  outline: none;
}
summary::-webkit-details-marker {
  display: none; /* Cache le symbole déroulant par défaut (Chrome/Safari) */
}
summary:focus {
  outline: none;
}
</style>
