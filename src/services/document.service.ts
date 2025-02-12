// src/services/document.service.ts
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { DocumentEntity } from '@/entities/document';

export class DocumentService {
    private db = getFirestore();
    // Assurez-vous que le nom de la collection correspond bien à celle dans Firestore (ici "Documents")
    private collectionRef = collection(this.db, 'Documents');

    // Récupère les documents pour un utilisateur donné (filtrage sur le champ id_user)
    async getDocumentsForUser(userId: string): Promise<DocumentEntity[]> {
        const q = query(this.collectionRef, where('id_user', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => DocumentEntity.fromFirestore(docSnap.data(), docSnap.id));
    }
}
