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

    async function addNews(newsItem: NewsEntity) {
        try {
            await newsService.addNews(newsItem);
            await fetchNews();
        } catch (err: any) {
            errorNews.value = err.message;
        }
    }

    async function updateNews(newsItem: NewsEntity) {
        try {
            await newsService.updateNews(newsItem);
            await fetchNews();
        } catch (err: any) {
            errorNews.value = err.message;
        }
    }

    async function deleteNews(newsId: string) {
        try {
            await newsService.deleteNews(newsId);
            await fetchNews();
        } catch (err: any) {
            errorNews.value = err.message;
        }
    }

    return { news, loadingNews, errorNews, fetchNews, addNews, updateNews, deleteNews };
});
