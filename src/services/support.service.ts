// src/services/support.service.ts
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
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

    // Ajoute un nouveau support
    async addSupport(support: Support): Promise<void> {
        // Laisser Firestore générer l'ID
        await addDoc(this.collectionRef, {
            id_cours: support.id_cours,
            nom: support.nom
        });
    }

    // Met à jour un support existant
    async updateSupport(support: Support): Promise<void> {
        const docRef = doc(this.db, 'Supports', support.uid);
        await updateDoc(docRef, {
            nom: support.nom
        });
    }

    // Supprime un support
    async deleteSupport(supportId: string): Promise<void> {
        const docRef = doc(this.db, 'Supports', supportId);
        await deleteDoc(docRef);
    }
}
