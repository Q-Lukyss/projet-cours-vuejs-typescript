<template>
  <div class="p-6 bg-lightbeige min-h-screen text-darkblue">
    <section
        ref="observerSeancesRef"
        class="bg-white p-6 rounded shadow max-w-4xl mx-auto"
    >
      <h1 class="text-2xl font-bold mb-4">Calendrier des prochaines séances</h1>

      <!-- Skeleton de chargement -->
      <div v-if="loadingSeances" class="space-y-4">
        <!-- On répète quelques blocs en faux chargement -->
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <!-- Barre “titre” -->
          <div class="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
          <!-- Barres “contenu” -->
          <div class="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
          <div class="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
        </div>
      </div>

      <!-- Erreur -->
      <div v-else-if="errorSeances" class="text-red-600">
        {{ errorSeances }}
      </div>

      <!-- Contenu des séances -->
      <div v-else>
        <!-- Parcours des séances regroupées par date -->
        <div
            v-for="(seances, date) in groupedSeances"
            :key="date"
            class="mb-6"
        >
          <h2 class="text-xl font-semibold mb-2 text-violet">
            {{ date }}
          </h2>
          <ul class="space-y-2 ml-4 list-disc list-inside">
            <li
                v-for="seance in seances"
                :key="seance.uid"
                class="pl-2"
            >
              <div>
                <strong class="font-semibold">Lieu :</strong>
                {{ seance.lieu }}
                <span>
                  — De {{ formatTime(seance.date) }}
                  à {{ formatTime(seance.date_fin) }}
                </span>
              </div>
              <div>
                <strong class="font-semibold">Cours :</strong>
                {{ courseMap[seance.id_cours]?.nom || 'Inconnu' }}
              </div>
              <div>
                <strong class="font-semibold">Enseignant :</strong>
                {{ teacherMap[courseMap[seance.id_cours]?.id_enseignant] || 'Chargement...' }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSeanceStore } from '@/stores/seance.store';
import { useCoursStore } from '@/stores/cours.store';
import { useAuthStore } from '@/stores/auth';
import { UserService } from '@/services/user.service';

const userService = new UserService();

const seanceStore = useSeanceStore();
const coursStore = useCoursStore();
const authStore = useAuthStore();

const { upcomingSeances, loadingSeances, errorSeances } = storeToRefs(seanceStore);
const { courses } = storeToRefs(coursStore);
const { user } = storeToRefs(authStore);

const courseMap = computed(() => {
  const map: Record<string, any> = {};
  courses.value.forEach(cours => {
    map[cours.uid] = cours;
  });
  return map;
});

const teacherMap = reactive<{ [key: string]: string }>({});

// Fonction pour charger le nom d'un enseignant (via userService)
async function loadTeacherName(teacherId: string) {
  if (!teacherMap[teacherId]) {
    try {
      const userData = await userService.getUser(teacherId);
      if (userData && (userData.prenom || userData.nom)) {
        teacherMap[teacherId] = `${userData.prenom || ''} ${userData.nom || ''}`.trim();
      } else {
        teacherMap[teacherId] = 'Inconnu';
      }
    } catch (error) {
      teacherMap[teacherId] = 'Erreur';
      console.error('Erreur lors du chargement du nom enseignant :', error);
    }
  }
}

watch(
    courses,
    (newCourses) => {
      newCourses.forEach((cours: any) => {
        const teacherId = cours.id_enseignant;
        if (teacherId) {
          loadTeacherName(teacherId);
        }
      });
    },
    { immediate: true }
);

// Groupement des séances par date
const groupedSeances = computed(() => {
  const groups: { [key: string]: any[] } = {};
  upcomingSeances.value.forEach((seance) => {
    const dateKey = new Date(seance.date).toISOString().split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(seance);
  });
  return groups;
});

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const observerSeancesRef = ref(null);

onMounted(async () => {
  if (user.value && courses.value.length > 0) {
    const courseIds = courses.value.map((cours: any) => cours.uid);
    await seanceStore.fetchUpcomingSeancesForCourses(courseIds);
  }

  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target === observerSeancesRef.value) {
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (observerSeancesRef.value) {
    observer.observe(observerSeancesRef.value);
  }
});
</script>