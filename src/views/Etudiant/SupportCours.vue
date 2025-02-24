<template>
  <div class="p-6 bg-lightbeige min-h-screen text-darkblue">
    <section
        ref="observerSupportsRef"
        class="bg-white p-6 rounded shadow max-w-4xl mx-auto"
    >
      <h1 class="text-2xl font-bold mb-4">Liste des Cours avec Supports</h1>

      <!-- Skeleton de chargement formation / cours -->
      <div v-if="loadingFormation || loadingCourses" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        </div>
      </div>

      <!-- Erreurs éventuelles -->
      <div v-else-if="errorFormation || errorCourses">
        <p v-if="errorFormation" class="text-red-600">
          {{ errorFormation }}
        </p>
        <p v-if="errorCourses" class="text-red-600">
          {{ errorCourses }}
        </p>
      </div>

      <!-- Liste des cours -->
      <div v-else>
        <ul class="space-y-4">
          <li
              v-for="cours in courses"
              :key="cours.uid"
              class="border-b border-gray-200 pb-4"
          >
            <!-- Titre du cours (cliquable pour basculer l'affichage des supports) -->
            <div
                @click="toggleSupports(cours.uid)"
                class="cursor-pointer flex items-center justify-between"
            >
              <strong class="text-lg text-violet font-semibold">
                {{ cours.nom }}
              </strong>
              <!-- Icône pour indiquer l’état (ouvert/fermé) -->
              <svg
                  v-if="expandedSupports[cours.uid]"
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

            <!-- Liste des supports (affichée si expandedSupports[cours.uid] est true) -->
            <transition name="fade" mode="out-in">
              <div v-if="expandedSupports[cours.uid]" class="mt-2">
                <!-- Skeleton chargement des supports -->
                <div
                    v-if="loadingSupports[cours.uid]"
                    class="space-y-2 animate-pulse"
                >
                  <div class="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div class="h-4 bg-gray-300 rounded w-1/3"></div>
                </div>

                <!-- Liste des supports -->
                <div v-else>
                  <ul class="mt-1 space-y-1 list-disc list-inside ml-4">
                    <li
                        v-for="support in supportsByCourse[cours.uid] || []"
                        :key="support.uid"
                        class="text-sm"
                    >
                      {{ support.nom }}
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
import {onMounted, reactive, ref, watch} from 'vue';
import {storeToRefs} from 'pinia';
import {useCoursStore} from '@/stores/cours.store';
import {useAuthStore} from '@/stores/auth';

const coursStore = useCoursStore();
const authStore = useAuthStore();

const {
  courses,
  loadingFormation,
  loadingCourses,
  errorFormation,
  errorCourses,
} = storeToRefs(coursStore);
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
      supportsByCourse[courseId] = await coursStore.fetchSupports(courseId);
      loadingSupports[courseId] = false;
    }
  }
}

// lazy loading
const observerSupportsRef = ref(null);

onMounted(() => {
  // Charger formation + cours pour l'utilisateur (s'il est déjà loggué)
  if (user.value && user.value.uid) {
    coursStore.fetchFormationAndCoursesForUser(user.value.uid);
  }

  // lazy loading
  const options = { root: null, rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target === observerSupportsRef.value) {
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (observerSupportsRef.value) {
    observer.observe(observerSupportsRef.value);
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
