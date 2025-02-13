import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    documentId,
    doc,
    addDoc,
    updateDoc,
    deleteDoc
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

    // Récupère les cours pour un intervenant (filtre sur id_enseignant)
    async getCoursesForIntervenant(teacherId: string): Promise<Cours[]> {
        const q = query(this.collectionRef, where('id_enseignant', '==', teacherId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnap => Cours.fromFirestore(docSnap.data(), docSnap.id));
    }

    async addCours(cours: Cours): Promise<void> {
        await addDoc(this.collectionRef, {
            id_enseignant: cours.id_enseignant,
            nom: cours.nom,
            seances: cours.seances,   // initialement un tableau vide
            supports: cours.supports  // initialement un tableau vide
        });
    }

    async updateCours(cours: Cours): Promise<void> {
        const docRef = doc(this.db, 'Cours', cours.uid);
        await updateDoc(docRef, {
            id_enseignant: cours.id_enseignant,
            nom: cours.nom,
            seances: cours.seances,
            supports: cours.supports
        });
    }

    async deleteCours(coursId: string): Promise<void> {
        const docRef = doc(this.db, 'Cours', coursId);
        await deleteDoc(docRef);
    }
}
