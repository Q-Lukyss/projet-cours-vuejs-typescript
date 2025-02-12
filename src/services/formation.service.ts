// src/services/formation.service.ts
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Formation } from '@/entities/formation';

export class FormationService {
    private db = getFirestore();
    private collectionRef = collection(this.db, 'Formation');

    // Récupère la formation pour laquelle le champ 'eleves' contient userId.
    async getFormationForUser(userId: string): Promise<Formation | null> {
        const q = query(this.collectionRef, where('eleves', 'array-contains', userId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            // Si plusieurs formations sont trouvées, vous pouvez choisir de prendre la première (ou appliquer une logique spécifique)
            const docSnap = querySnapshot.docs[0];
            return Formation.fromFirestore(docSnap.data(), docSnap.id);
        }
        return null;
    }
}
