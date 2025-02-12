// src/stores/note.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Note } from '@/entities/note';
import { NoteService } from '@/services/note.service';

export const useNoteStore = defineStore('note', () => {
    const notes = ref<Note[]>([]);
    const loadingNotes = ref(false);
    const errorNotes = ref<string | null>(null);

    const noteService = new NoteService();

    // Action pour charger les notes de l'utilisateur connecté
    async function fetchNotesForUser(userId: string) {
        loadingNotes.value = true;
        try {
            notes.value = await noteService.getNotesForUser(userId);
            loadingNotes.value = false;
            console.log(notes.value);
        } catch (err: any) {
            errorNotes.value = err.message;
            loadingNotes.value = false;
        }
    }

    // Calcul de la moyenne générale de toutes les notes
    const averageGrade = computed(() => {
        if (notes.value.length === 0) return 0;
        const sum = notes.value.reduce((acc, note) => acc + note.note, 0);
        return sum / notes.value.length;
    });

    return { notes, loadingNotes, errorNotes, fetchNotesForUser, averageGrade };
});
