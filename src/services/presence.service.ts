// src/services/presence.service.ts
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc
} from 'firebase/firestore';
import { Presence } from '@/entities/presence';

export class PresenceService {
    private db = getFirestore();
    private collectionRef = collection(this.db, 'Presences');

    // Récupère toutes les présences (toutes absences et présences)
    async getAllPresences(): Promise<Presence[]> {
        try {
            const q = query(this.collectionRef);
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(docSnap => Presence.fromFirestore(docSnap.data(), docSnap.id));
        } catch (error) {
            console.error("Erreur lors de la récupération des présences :", error);
            throw error;
        }
    }

    // Met à jour une présence (ex. pour ajouter un justificatif)
    async updatePresence(presence: Presence): Promise<void> {
        try {
            const docRef = doc(this.db, 'Presences', presence.uid);
            await updateDoc(docRef, {
                justificatifs: presence.justificatifs
            });
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la présence :", error);
            throw error;
        }
    }

    // Méthode existante pour récupérer les présences pour un utilisateur (non utilisée ici)
    async getPresencesForUser(userId: string): Promise<Presence[]> {
        try {
            console.log("userId query:", userId);
            const presencesQuery = query(this.collectionRef, where('id_user', '==', userId));
            const querySnapshot = await getDocs(presencesQuery);
            console.log("Nombre de documents retournés:", querySnapshot.size);
            querySnapshot.forEach(docSnap => {
                console.log("Document trouvé:", docSnap.id, docSnap.data());
            });
            return querySnapshot.docs.map(docSnap => Presence.fromFirestore(docSnap.data(), docSnap.id));
        } catch (error) {
            console.error("Erreur lors de la récupération des présences :", error);
            throw error;
        }
    }
}
