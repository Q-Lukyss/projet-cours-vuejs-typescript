import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    documentId
} from 'firebase/firestore';
import { Cours } from '@/entities/cours';

export class CoursService {
    private db = getFirestore();
    // Attention à la casse : la collection s'appelle "Cours"
    private collectionRef = collection(this.db, 'Cours');

    // Récupère tous les cours (méthode existante, par exemple)
    async getCourses(): Promise<Cours[]> {
        const querySnapshot = await getDocs(this.collectionRef);
        return querySnapshot.docs.map(docSnap => Cours.fromFirestore(docSnap.data(), docSnap.id));
    }

    // Récupère les cours dont l'ID est dans la liste passée en paramètre
    async getCoursesByIds(ids: string[]): Promise<Cours[]> {
        if (ids.length === 0) {
            return [];
        }
        const q = query(this.collectionRef, where(documentId(), 'in', ids));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnap => Cours.fromFirestore(docSnap.data(), docSnap.id));
    }

    // (Optionnel) Récupère les cours pour un enseignant en filtrant par id_enseignant
    async getCoursesForUser(userId: string): Promise<Cours[]> {
        // Méthode alternative si l'enseignant est le propriétaire du cours
        // return ... ;
        return []; // ici nous n'utiliserons pas cette méthode dans ce scénario
    }
}
