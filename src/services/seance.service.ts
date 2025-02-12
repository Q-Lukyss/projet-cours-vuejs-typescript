// src/services/seance.service.ts
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { SeanceEntity } from '@/entities/seance';

export class SeanceService {
    private db = getFirestore();
    // On suppose que la collection s'appelle "Seances" dans Firestore.
    private collectionRef = collection(this.db, 'Seances');

    async getUpcomingSeancesForCourses(courseIds: string[]): Promise<SeanceEntity[]> {
        if (courseIds.length === 0) return [];
        const today = new Date();
        const q = query(
            this.collectionRef,
            where('id_cours', 'in', courseIds),
            where('date', '>=', today),
            orderBy('date', 'asc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => SeanceEntity.fromFirestore(docSnap.data(), docSnap.id));
    }
}
