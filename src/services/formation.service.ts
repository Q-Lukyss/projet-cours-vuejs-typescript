// src/services/formation.service.ts
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
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
    // Nouvelle méthode pour récupérer toutes les formations
    async getFormations(): Promise<Formation[]> {
        const querySnapshot = await getDocs(this.collectionRef);
        return querySnapshot.docs.map(docSnap => Formation.fromFirestore(docSnap.data(), docSnap.id));
    }

    async addFormation(formation: Formation): Promise<void> {
        await addDoc(this.collectionRef, {
            annee: formation.annee,
            nom: formation.nom,
            cours: formation.cours,    // tableau d'UID de cours
            eleves: formation.eleves   // tableau d'UID d'élèves
        });
    }

    async updateFormation(formation: Formation): Promise<void> {
        const docRef = doc(this.db, 'Formation', formation.uid);
        await updateDoc(docRef, {
            annee: formation.annee,
            nom: formation.nom,
            cours: formation.cours,
            eleves: formation.eleves
        });
    }

    async deleteFormation(formationId: string): Promise<void> {
        const docRef = doc(this.db, 'Formation', formationId);
        await deleteDoc(docRef);
    }
}
