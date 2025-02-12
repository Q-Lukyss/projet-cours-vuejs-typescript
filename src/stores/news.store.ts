import { defineStore } from 'pinia';
import { ref } from 'vue';
import { NewsEntity } from '@/entities/news';
import { NewsService } from '@/services/news.service';

export const useNewsStore = defineStore('news', () => {
    const news = ref<NewsEntity[]>([]);
    const loadingNews = ref(false);
    const errorNews = ref<string | null>(null);

    const newsService = new NewsService();

    async function fetchNews() {
        loadingNews.value = true;
        try {
            news.value = await newsService.getNews();
            loadingNews.value = false;
        } catch (err: any) {
            errorNews.value = err.message;
            loadingNews.value = false;
        }
    }

    return { news, loadingNews, errorNews, fetchNews };
});
