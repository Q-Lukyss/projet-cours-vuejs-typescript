<template>
  <div>
    <h1>Calendrier des prochaines séances</h1>
    <div v-if="loadingSeances">Chargement...</div>
    <div v-else-if="errorSeances">{{ errorSeances }}</div>
    <div v-else>
      <!-- Parcours des séances regroupées par date -->
      <div v-for="(seances, date) in groupedSeances" :key="date" class="date-group">
        <h2>{{ date }}</h2>
        <ul>
          <li v-for="seance in seances" :key="seance.uid">
            <div>
              <strong>Lieu :</strong> {{ seance.lieu }}
              <span>- De {{ formatTime(seance.date) }} à {{ formatTime(seance.date_fin) }}</span>
            </div>
            <div>
              <strong>Cours :</strong> {{ courseMap[seance.id_cours]?.nom || 'Inconnu' }}
            </div>
            <div>
              <strong>Enseignant :</strong>
              {{ teacherMap[courseMap[seance.id_cours]?.id_enseignant] || 'Chargement...' }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSeanceStore } from '@/stores/seance.store';
import { useCoursStore } from '@/stores/cours.store';
import { useAuthStore } from '@/stores/auth';
import { UserService } from '@/services/user.service';

const userService = new UserService();

// Récupération des stores existants
const seanceStore = useSeanceStore();
const coursStore = useCoursStore();
const authStore = useAuthStore();

const { upcomingSeances, loadingSeances, errorSeances } = storeToRefs(seanceStore);
const { courses } = storeToRefs(coursStore);
const { user } = storeToRefs(authStore);

// Création d'une map pour retrouver rapidement les infos d'un cours à partir de son uid
const courseMap = computed(() => {
  const map: Record<string, any> = {};
  courses.value.forEach(cours => {
    map[cours.uid] = cours;
  });
  return map;
});

// Création d'une map réactive pour stocker le nom des enseignants par leur uid
const teacherMap = reactive<{ [key: string]: string }>({});

// Fonction asynchrone pour charger le nom d'un enseignant par son uid, sinon déjà chargé
async function loadTeacherName(teacherId: string) {
  if (!teacherMap[teacherId]) {
    try {
      const userData = await userService.getUser(teacherId);
      console.log("Chargement de l'enseignant", teacherId, userData);
      if (userData && (userData.prenom || userData.nom)) {
        teacherMap[teacherId] = `${userData.prenom || ''} ${userData.nom || ''}`.trim();
      } else {
        teacherMap[teacherId] = "Inconnu";
      }
    } catch (error) {
      teacherMap[teacherId] = "Erreur";
      console.error("Erreur lors du chargement du nom de l'enseignant :", error);
    }
  }
}

// Dès que le store des cours change, pour chaque cours, charger le nom de l'enseignant
watch(courses, (newCourses) => {
  newCourses.forEach((cours: any) => {
    const teacherId = cours.id_enseignant;
    if (teacherId) {
      loadTeacherName(teacherId);
    }
  });
}, { immediate: true });

// Regroupement des séances par date (format YYYY-MM-DD)
const groupedSeances = computed(() => {
  const groups: { [key: string]: any[] } = {};
  upcomingSeances.value.forEach(seance => {
    const dateKey = new Date(seance.date).toISOString().split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(seance);
  });
  return groups;
});

// Fonction pour formater l'heure
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Au montage, on charge les séances à venir pour les cours suivis
onMounted(async () => {
  if (user.value && courses.value.length > 0) {
    const courseIds = courses.value.map((cours: any) => cours.uid);
    await seanceStore.fetchUpcomingSeancesForCourses(courseIds);
  }
});
</script>

<style scoped>
.date-group {
  margin-bottom: 1.5rem;
}
.date-group h2 {
  margin-bottom: 0.5rem;
}
</style>
