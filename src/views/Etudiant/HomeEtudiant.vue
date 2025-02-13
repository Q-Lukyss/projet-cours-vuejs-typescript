<template>
  <div>
    <!-- Bandeau News -->
    <section>
      <h2>News</h2>
      <div v-if="loadingNews">Chargement des news...</div>
      <div v-else-if="errorNews">{{ errorNews }}</div>
      <div v-else>
        <div v-for="newsItem in news" :key="newsItem.uid" class="news-item">
          <h3>{{ newsItem.titre }}</h3>
          <p>{{ newsItem.contenu }}</p>
        </div>
      </div>
    </section>

    <h1>Home Étudiant</h1>

    <!-- Moyenne générale -->
    <section>
      <h2>Moyenne générale</h2>
      <div v-if="loadingGlobalNotes">Chargement des notes...</div>
      <div v-else-if="errorGlobalNotes">{{ errorGlobalNotes }}</div>
      <div v-else>
        <p>{{ averageGrade.toFixed(2) }}</p>
      </div>
    </section>

    <!-- Présence / Absence -->
    <section>
      <h2>Présences / Absences</h2>
      <div v-if="loadingPresence">Chargement des présences...</div>
      <div v-else-if="errorPresence">{{ errorPresence }}</div>
      <div v-else>
        <p>Présences : {{ nbPresences }}</p>
        <p>Absences : {{ nbAbsences }}</p>
      </div>
    </section>

    <!-- Cours du prochain jour de séance -->
    <section>
      <h2>Cours du prochain jour de séance</h2>
      <div v-if="loadingSeances">Chargement des séances...</div>
      <div v-else-if="errorSeances">{{ errorSeances }}</div>
      <div v-else>
        <p v-if="nextCourseDayKey">Séances pour le {{ nextCourseDayKey }} :</p>
        <ul>
          <li v-for="seance in nextCourseDaySeances" :key="seance.uid">
            <strong>{{ courseMap[seance.id_cours]?.nom || 'Inconnu' }}</strong>
            <span> à {{ seance.lieu }}, de {{ formatTime(seance.date) }} à {{ formatTime(seance.date_fin) }}</span>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useNoteStore } from '@/stores/note.store';
import { usePresenceStore } from '@/stores/presence.store';
import { useSeanceStore } from '@/stores/seance.store';
import { useCoursStore } from '@/stores/cours.store';
import {useNewsStore} from "@/stores/news.store.ts";

const authStore = useAuthStore();
const noteStore = useNoteStore();
const presenceStore = usePresenceStore();
const seanceStore = useSeanceStore();
const coursStore = useCoursStore();
const newsStore = useNewsStore();

const { user } = storeToRefs(authStore);
const { averageGrade, loadingGlobalNotes, errorGlobalNotes } = storeToRefs(noteStore);
const { nbPresences, nbAbsences, loadingPresence, errorPresence } = storeToRefs(presenceStore);
const { upcomingSeances, loadingSeances, errorSeances } = storeToRefs(seanceStore);
const { courses } = storeToRefs(coursStore);
const { news, loadingNews, errorNews } = storeToRefs(newsStore);

// Map pour retrouver rapidement les infos d'un cours à partir de son uid
const courseMap = computed(() => {
  const map: Record<string, any> = {};
  courses.value.forEach(cours => {
    map[cours.uid] = cours;
  });
  return map;
});

// Calculer le "jour" (format YYYY-MM-DD) du prochain cours parmi toutes les séances à venir
const nextCourseDayKey = computed(() => {
  if (upcomingSeances.value.length === 0) return null;
  // On trie les séances par date ascendante
  const sorted = [...upcomingSeances.value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return new Date(sorted[0].date).toISOString().split('T')[0];
});

// Filtrer pour ne garder que les séances qui correspondent au prochain jour de cours
const nextCourseDaySeances = computed(() => {
  if (!nextCourseDayKey.value) return [];
  return upcomingSeances.value.filter(seance => {
    const seanceDay = new Date(seance.date).toISOString().split('T')[0];
    return seanceDay === nextCourseDayKey.value;
  });
});

// Fonction pour formater les heures
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

onMounted(async () => {
  if (user.value && user.value.uid) {
    // Charger les news
    await newsStore.fetchNews();
    console.log('News : ' + news.value );

    // Charger les notes et présences pour l'utilisateur connecté
    await noteStore.fetchNotesForUser(user.value.uid);
    await presenceStore.fetchPresences(user.value.uid);

    // Charger les cours pour l'utilisateur (par exemple via la formation)
    await coursStore.fetchFormationForUser(user.value.uid);

    console.log('Cours chargés :', JSON.stringify(courses.value));

    // Si des cours sont chargés, récupérer toutes les séances à venir
    if (courses.value.length > 0) {
      const courseIds = courses.value.map(cours => cours.uid);
      await seanceStore.fetchUpcomingSeancesForCourses(courseIds);
      console.log("Toutes les séances à venir :", JSON.stringify(upcomingSeances.value));
      console.log("Prochain jour de séance :", nextCourseDayKey.value);
      console.log("Séances du prochain jour :", JSON.stringify(nextCourseDaySeances.value));
    } else {
      console.log("Aucun cours n'a été chargé.");
    }
  }
});
</script>

<style scoped>
section {
  margin-bottom: 2rem;
}
</style>
