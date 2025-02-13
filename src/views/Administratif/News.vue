<template>
  <div>
    <h1>Gestion des News (Admin)</h1>

    <!-- Formulaire d'ajout d'une news -->
    <section>
      <h2>Ajouter une News</h2>
      <input v-model="newNews.title" placeholder="Titre" />
      <textarea v-model="newNews.content" placeholder="Contenu"></textarea>
      <input v-model="newNews.date" type="datetime-local" placeholder="Date de publication" />
      <button @click="onAddNews">Ajouter News</button>
    </section>

    <!-- Liste des news -->
    <section v-if="news && news.length">
      <h2>Liste des News</h2>
      <div v-for="item in news" :key="item.uid" class="news-item">
        <h3>{{ item.title }}</h3>
        <p>{{ item.content }}</p>
        <small>{{ formatDate(item.date) }}</small>
        <div class="actions">
          <button @click="startEditingNews(item)">Modifier</button>
          <button @click="onDeleteNews(item.uid)">Supprimer</button>
        </div>
      </div>
    </section>
    <div v-else>
      <p>Aucune news disponible.</p>
    </div>

    <!-- Formulaire de modification d'une news -->
    <section v-if="editingNews">
      <h2>Modifier la News</h2>
      <input v-model="editingNews.title" placeholder="Titre" />
      <textarea v-model="editingNews.content" placeholder="Contenu"></textarea>
      <input v-model="editingNews.date" type="datetime-local" placeholder="Date de publication" />
      <button @click="onUpdateNews">Enregistrer</button>
      <button @click="cancelEditingNews">Annuler</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNewsStore } from '@/stores/news.store';
import type { NewsEntity } from '@/entities/news';

const newsStore = useNewsStore();
const { news, fetchNews, addNews, updateNews, deleteNews } = newsStore;

// Formulaire d'ajout
const newNews = ref({
  title: '',
  content: '',
  date: ''
});

// News en cours d'édition
const editingNews = ref<NewsEntity | null>(null);

onMounted(async () => {
  await fetchNews();
});

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString();
}

async function onAddNews() {
  if (newNews.value.title && newNews.value.content && newNews.value.date) {
    // Création d'une nouvelle news. L'ID (uid) pourra être généré par Firestore.
    const newsToAdd: NewsEntity = {
      uid: '',
      title: newNews.value.title,
      content: newNews.value.content,
      date: new Date(newNews.value.date),
      is_active: true
    };
    await addNews(newsToAdd);
    newNews.value = { title: '', content: '', date: '' };
    await fetchNews();
  }
}

function startEditingNews(item: NewsEntity) {
  // Pour l'input datetime-local, le format attendu est "YYYY-MM-DDTHH:mm"
  editingNews.value = { ...item, date: new Date(item.date).toISOString().slice(0,16) };
}

function cancelEditingNews() {
  editingNews.value = null;
}

async function onUpdateNews() {
  if (editingNews.value) {
    const updatedNews: NewsEntity = {
      ...editingNews.value,
      date: new Date(editingNews.value.date)
    };
    await updateNews(updatedNews);
    editingNews.value = null;
    await fetchNews();
  }
}

async function onDeleteNews(newsId: string) {
  await deleteNews(newsId);
  await fetchNews();
}
</script>

<style scoped>
.news-item {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
}
.actions {
  margin-top: 0.5rem;
}
input,
textarea {
  display: block;
  margin-bottom: 0.5rem;
  width: 100%;
  padding: 0.5rem;
}
button {
  margin-right: 0.5rem;
}
</style>
