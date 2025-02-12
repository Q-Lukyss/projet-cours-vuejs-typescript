// src/services/note.service.ts
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Note } from '@/entities/note';

export class NoteService {
    private db = getFirestore();

    private collectionRef = collection(this.db, 'Notes');

    async getNotesForCourse(courseId: string): Promise<Note[]> {
        const q = query(this.collectionRef, where('id_cours', '==', courseId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => Note.fromFirestore(docSnap.data(), docSnap.id));
    }

    // Récupère les notes pour un utilisateur donné (filtre sur id_user)
    async getNotesForUser(userId: string): Promise<Note[]> {
        const q = query(this.collectionRef, where('id_user', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => Note.fromFirestore(docSnap.data(), docSnap.id));
    }
}
