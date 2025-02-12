// src/services/support.service.ts
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Support } from '@/entities/support';

export class SupportService {
    private db = getFirestore();
    // La collection pour les supports, par exemple "Support"
    private collectionRef = collection(this.db, 'Supports');

    async getSupportsForCourse(courseId: string): Promise<Support[]> {
        const q = query(this.collectionRef, where('id_cours', '==', courseId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => Support.fromFirestore(docSnap.data(), docSnap.id));
    }
}
