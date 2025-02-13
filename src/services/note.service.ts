// src/services/note.service.ts
import { getFirestore, collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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

    // Récupère les notes pour un élève et un cours donné
    async getNotesForStudentAndCourse(studentId: string, courseId: string): Promise<Note[]> {
        const q = query(
            this.collectionRef,
            where('id_user', '==', studentId),
            where('id_cours', '==', courseId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnap => Note.fromFirestore(docSnap.data(), docSnap.id));
    }

    async addNote(note: Note): Promise<void> {
        await addDoc(this.collectionRef, {
            id_user: note.id_user,
            id_cours: note.id_cours,
            libelle: note.libelle,
            note: note.note
        });
    }

    async updateNote(note: Note): Promise<void> {
        const docRef = doc(this.db, 'Notes', note.uid);
        await updateDoc(docRef, {
            libelle: note.libelle,
            note: note.note
        });
    }

    async deleteNote(noteId: string): Promise<void> {
        const docRef = doc(this.db, 'Notes', noteId);
        await deleteDoc(docRef);
    }
}
