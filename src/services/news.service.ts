// src/services/news.service.ts
import {getFirestore, collection, query, orderBy, getDocs, where} from 'firebase/firestore';
import { NewsEntity } from '@/entities/news';

export class NewsService {
    private db = getFirestore();
    private collectionRef = collection(this.db, 'News');

    // Récupère les news triées par date décroissante (les plus récentes en premier)
    async getNews(): Promise<NewsEntity[]> {
        const q = query(this.collectionRef, where('is_active', '==', true), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => NewsEntity.fromFirestore(docSnap.data(), docSnap.id));
    }
}
