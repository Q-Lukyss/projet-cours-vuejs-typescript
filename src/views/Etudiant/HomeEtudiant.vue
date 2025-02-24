<template>
  <div class="p-6 bg-lightbeige min-h-screen text-darkblue">
    <!-- EXEMPLE DE SECTION AVEC SQUELETTES ET CLASSES TAILWIND -->
    <section class="bg-darkblue text-lightbeige p-6 mb-6 rounded shadow">
      <h2 class="text-2xl font-semibold mb-4">News</h2>

      <!-- Skeletons de chargement -->
      <div v-if="loadingNews" class="space-y-4">
        <!-- On répète 3 “news” en faux chargement -->
        <div
            v-for="n in 3"
            :key="n"
            class="animate-pulse bg-white bg-opacity-10 p-4 rounded"
        >
          <!-- Barres “squelettes” -->
          <div class="h-4 bg-lightbeige bg-opacity-50 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-lightbeige bg-opacity-50 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Erreur -->
      <div v-else-if="errorNews" class="text-red-300">
        {{ errorNews }}
      </div>

      <!-- Contenu News -->
      <div v-else>
        <div
            v-for="newsItem in news"
            :key="newsItem.uid"
            class="bg-lightviolet bg-opacity-10 text-white p-4 rounded mb-2 shadow"
        >
          <h3 class="font-bold text-lg text-beige">{{ newsItem.titre }}</h3>
          <p class="text-sm">{{ newsItem.contenu }}</p>
        </div>
      </div>
    </section>

    <!-- MOYENNE GÉNÉRALE -->
    <section
        ref="observerMoyenneRef"
        class="bg-white text-darkblue p-6 mb-6 rounded shadow"
    >
      <h2 class="text-2xl font-semibold mb-4">Moyenne générale</h2>

      <div v-if="loadingGlobalNotes" class="animate-pulse space-y-2">
        <!-- Skeleton bars -->
        <div class="h-4 bg-gray-300 rounded w-3/4"></div>
        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
      <div v-else-if="errorGlobalNotes" class="text-red-600">
        {{ errorGlobalNotes }}
      </div>
      <div v-else>
        <p class="text-xl font-bold">
          {{ averageGrade.toFixed(2) }}
        </p>
      </div>
    </section>

    <!-- PRÉSENCES / ABSENCES (avec lazy loading) -->
    <section
        ref="observerPresenceRef"
        class="bg-white text-darkblue p-6 mb-6 rounded shadow"
    >
      <h2 class="text-2xl font-semibold mb-4">Présences / Absences</h2>

      <div v-if="loadingPresence" class="animate-pulse space-y-2">
        <div class="h-4 bg-gray-300 rounded w-3/4"></div>
        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
      <div v-else-if="errorPresence" class="text-red-600">
        {{ errorPresence }}
      </div>
      <div v-else>
        <p>Présences : <span class="font-semibold">{{ nbPresences }}</span></p>
        <p>Absences : <span class="font-semibold">{{ nbAbsences }}</span></p>
      </div>
    </section>

    <!-- COURS DU PROCHAIN JOUR DE SÉANCE -->
    <section
        class="bg-white text-darkblue p-6 mb-6 rounded shadow"
    >
      <h2 class="text-2xl font-semibold mb-4">Cours du prochain jour de séance</h2>

      <div v-if="loadingSeances" class="animate-pulse space-y-2">
        <div class="h-4 bg-gray-300 rounded w-3/4"></div>
        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
      <div v-else-if="errorSeances" class="text-red-600">
        {{ errorSeances }}
      </div>
      <div v-else>
        <p v-if="nextCourseDayKey" class="mb-2">
          Séances pour le <span class="font-semibold">{{ nextCourseDayKey }}</span> :
        </p>
        <ul>
          <li
              v-for="seance in nextCourseDaySeances"
              :key="seance.uid"
              class="mb-2"
          >
            <strong>
              {{ courseMap[seance.id_cours]?.nom || 'Inconnu' }}
            </strong>
            <span>
              à {{ seance.lieu }}, de {{ formatTime(seance.date) }}
              à {{ formatTime(seance.date_fin) }}
            </span>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useNoteStore } from '@/stores/note.store';
import { usePresenceStore } from '@/stores/presence.store';
import { useSeanceStore } from '@/stores/seance.store';
import { useCoursStore } from '@/stores/cours.store';
import { useNewsStore } from '@/stores/news.store';

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

// Map pour retrouver rapidement les infos d'un cours
const courseMap = computed(() => {
  const map: Record<string, any> = {};
  courses.value.forEach((cours) => {
    map[cours.uid] = cours;
  });
  return map;
});

const nextCourseDayKey = computed(() => {
  if (upcomingSeances.value.length === 0) return null;
  const sorted = [...upcomingSeances.value].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return new Date(sorted[0].date).toISOString().split('T')[0];
});

const nextCourseDaySeances = computed(() => {
  if (!nextCourseDayKey.value) return [];
  return upcomingSeances.value.filter((seance) => {
    const seanceDay = new Date(seance.date).toISOString().split('T')[0];
    return seanceDay === nextCourseDayKey.value;
  });
});

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const observerMoyenneRef = ref(null);
const observerPresenceRef = ref(null);

onMounted(async () => {
  if (user.value && user.value.uid) {
    // Charger les news immédiatement
    await newsStore.fetchNews();

    // Charger notes et présences
    await noteStore.fetchNotesForUser(user.value.uid);
    await presenceStore.fetchPresencesForUser(user.value.uid);

    // await coursStore.fetchFormationForUser(user.value.uid);
    await coursStore.fetchFormationAndCoursesForUser(user.value.uid);
    // await coursStore.fetchCoursesForFormation();

    console.log(courses)

    if (courses.value.length > 0) {
      const courseIds = courses.value.map((cours) => cours.uid);
      await seanceStore.fetchUpcomingSeancesForCourses(courseIds);
    }
  }

  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target === observerMoyenneRef.value) {
        observer.unobserve(entry.target);
      }
      if (entry.isIntersecting && entry.target === observerPresenceRef.value) {
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (observerMoyenneRef.value) observer.observe(observerMoyenneRef.value);
  if (observerPresenceRef.value) observer.observe(observerPresenceRef.value);
});
</script>
