// src/services/seance.service.ts
import { getFirestore, collection, query, where, getDocs, orderBy, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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

    async getSeancesForCourse(courseId: string): Promise<SeanceEntity[]> {
        const q = query(this.collectionRef, where('id_cours', '==', courseId), orderBy('date', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnap => SeanceEntity.fromFirestore(docSnap.data(), docSnap.id));
    }

    async addSeance(seance: SeanceEntity): Promise<void> {
        await addDoc(this.collectionRef, {
            date: seance.date,
            date_fin: seance.date_fin,
            id_cours: seance.id_cours,
            lieu: seance.lieu,
            presences: seance.presences
        });
    }

    async updateSeance(seance: SeanceEntity): Promise<void> {
        const docRef = doc(this.db, 'Seances', seance.uid);
        await updateDoc(docRef, {
            date: seance.date,
            date_fin: seance.date_fin,
            id_cours: seance.id_cours,
            lieu: seance.lieu,
            presences: seance.presences
        });
    }

    async deleteSeance(seanceId: string): Promise<void> {
        const docRef = doc(this.db, 'Seances', seanceId);
        await deleteDoc(docRef);
    }
}
