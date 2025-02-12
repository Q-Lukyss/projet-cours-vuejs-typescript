// src/services/presence.service.ts
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { Presence } from '@/entities/presence';

export class PresenceService {
    private db = getFirestore();
    private collectionRef = collection(this.db, 'Presences');

    // Récupère les présences pour un utilisateur spécifique
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
