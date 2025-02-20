import {
    getFirestore,
    collection,
    query,
    orderBy,
    getDocs,
    where,
    addDoc,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { NewsEntity } from '@/entities/news';

export class NewsService {
    private db = getFirestore();
    private collectionRef = collection(this.db, 'News');

    // Récupère les news triées par date décroissante (les plus récentes en premier)
    async getNews(): Promise<NewsEntity[]> {
        const q = query(
            this.collectionRef,
            where('is_active', '==', true),
            orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap =>
            NewsEntity.fromFirestore(docSnap.data(), docSnap.id)
        );
    }

    // Ajoute une nouvelle news
    async addNews(news: NewsEntity): Promise<void> {
        await addDoc(this.collectionRef, {
            titre: news.titre,
            contenu: news.contenu,
            date: news.date,
            is_active: news.is_active,
        });
    }

    // Met à jour une news existante
    async updateNews(news: NewsEntity): Promise<void> {
        const docRef = doc(this.db, 'News', news.uid);
        await updateDoc(docRef, {
            titre: news.titre,
            contenu: news.contenu,
            date: news.date,
            is_active: news.is_active,
        });
    }

    // Supprime une news
    async deleteNews(newsId: string): Promise<void> {
        const docRef = doc(this.db, 'News', newsId);
        await deleteDoc(docRef);
    }
}
