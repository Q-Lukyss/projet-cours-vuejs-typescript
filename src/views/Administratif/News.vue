<template>
  <div class="p-6 bg-lightbeige min-h-screen text-darkblue">
    <section
        ref="newsObserverRef"
        class="max-w-4xl mx-auto bg-white p-6 rounded shadow"
    >
      <h1 class="text-2xl font-bold mb-6">Gestion des News (Admin)</h1>

      <!-- Squelette de chargement
           (Si tu as un loading state, par exemple `loadingNews`) -->
      <!--
      <div v-if="loadingNews" class="space-y-3 mb-4">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div class="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
      -->

      <!-- Formulaire d'ajout d'une news -->
      <section class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Ajouter une News</h2>

        <div class="space-y-3">
          <input
              v-model="newNews.titre"
              placeholder="Titre"
              class="border border-gray-300 rounded px-3 py-2 w-full"
          />
          <textarea
              v-model="newNews.contenu"
              placeholder="Contenu"
              rows="4"
              class="border border-gray-300 rounded px-3 py-2 w-full"
          ></textarea>
          <input
              v-model="newNews.date"
              type="datetime-local"
              placeholder="Date de publication"
              class="border border-gray-300 rounded px-3 py-2 w-full"
          />
          <button
              @click="onAddNews"
              class="bg-lightviolet text-white rounded px-4 py-2 hover:bg-violet"
          >
            Ajouter News
          </button>
        </div>
      </section>

      <!-- Liste des news -->
      <section v-if="news && news.length" class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Liste des News</h2>

        <div
            v-for="item in news"
            :key="item.uid"
            class="border border-gray-200 rounded p-4 mb-4"
        >
          <h3 class="text-lg font-bold">{{ item.titre }}</h3>
          <p class="whitespace-pre-line">{{ item.contenu }}</p>
          <small class="text-gray-600 block mb-2">
            {{ formatDate(item.date) }}
          </small>
          <div class="space-x-2">
            <button
                @click="startEditingNews(item)"
                class="bg-darkblue text-white px-3 py-1 rounded hover:bg-gray-800 text-sm"
            >
              Modifier
            </button>
            <button
                @click="onDeleteNews(item.uid)"
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
            >
              Supprimer
            </button>
          </div>
        </div>
      </section>
      <div v-else>
        <p class="text-gray-700">
          Aucune news disponible.
        </p>
      </div>

      <!-- Formulaire de modification d'une news -->
      <section v-if="editingNews" class="border border-gray-300 p-4 mt-4 rounded">
        <h2 class="text-xl font-semibold mb-4">Modifier la News</h2>

        <div class="space-y-3">
          <input
              v-model="editingNews.titre"
              placeholder="Titre"
              class="border border-gray-300 rounded px-3 py-2 w-full"
          />
          <textarea
              v-model="editingNews.contenu"
              rows="4"
              placeholder="Contenu"
              class="border border-gray-300 rounded px-3 py-2 w-full"
          ></textarea>
          <input
              v-model="editingNews.dateString"
              type="datetime-local"
              placeholder="Date de publication"
              class="border border-gray-300 rounded px-3 py-2 w-full"
          />

          <div class="space-x-2">
            <button
                @click="onUpdateNews"
                class="bg-lightviolet text-white px-4 py-2 rounded hover:bg-violet text-sm"
            >
              Enregistrer
            </button>
            <button
                @click="cancelEditingNews"
                class="bg-gray-300 text-darkblue px-4 py-2 rounded hover:bg-gray-400 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </section>
    </section>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useNewsStore } from '@/stores/news.store';
import type { NewsEntity } from '@/entities/news';

// Récupération du store des news
const newsStore = useNewsStore();
const {
  news
  // Si tu as un loading state: loadingNews, errorNews, etc. (optionnel)
} = storeToRefs(newsStore);

// Formulaire d'ajout
const newNews = ref({
  titre: '',
  contenu: '',
  date: new Date(),
});

// News en cours d'édition
// const editingNews = ref<NewsEntity | null>(null);

interface EditableNewsEntity extends NewsEntity {
  dateString: string;
}
const editingNews = ref<EditableNewsEntity | null>(null);

// Chargement des news au montage
onMounted(async () => {
  await newsStore.fetchNews();
  setupObserver(); // Mise en place de l'IntersectionObserver (lazy loading)
});

// Formater la date
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString();
}

// Ajouter une news
async function onAddNews() {
  if (newNews.value.titre && newNews.value.contenu && newNews.value.date) {
    const newsToAdd: NewsEntity = {
      uid: '',
      titre: newNews.value.titre,
      contenu: newNews.value.contenu,
      date: new Date(newNews.value.date),
      is_active: true,
    };
    await newsStore.addNews(newsToAdd);
    newNews.value = { titre: '', contenu: '', date: new Date() };
    await newsStore.fetchNews();
  }
}

// Commencer la modification
function startEditingNews(item: NewsEntity) {
  // DateTime-local attend un format "YYYY-MM-DDTHH:mm"
  editingNews.value = {
    ...item,
    dateString: new Date(item.date).toISOString().slice(0, 16),
  };
}

// Annuler la modification
function cancelEditingNews() {
  editingNews.value = null;
}

// Enregistrer les modifications
async function onUpdateNews() {
  if (editingNews.value) {
    const updatedNews: NewsEntity = {
      ...editingNews.value,
      date: new Date(editingNews.value.dateString),
    };
    await newsStore.updateNews(updatedNews);
    editingNews.value = null;
    await newsStore.fetchNews();
  }
}

// Supprimer une news
async function onDeleteNews(newsId: string) {
  await newsStore.deleteNews(newsId);
  await newsStore.fetchNews();
}

// IntersectionObserver pour lazy loading
const newsObserverRef = ref(null);
function setupObserver() {
  const options = { root: null, rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target === newsObserverRef.value) {
        // Tu peux déclencher un chargement additionnel si besoin
        // e.g. newsStore.fetchMoreNews();
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (newsObserverRef.value) {
    observer.observe(newsObserverRef.value);
  }
}
</script>

<style scoped>
/* Tout le style principal est géré par Tailwind,
   tu peux ajouter ici des ajustements minimes si besoin. */
</style>
