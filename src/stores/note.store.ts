// src/stores/note.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Note } from '@/entities/note';
import { NoteService } from '@/services/note.service';

export const useNoteStore = defineStore('note', () => {
    // Pour les notes globales (pour la moyenne générale)
    const globalNotes = ref<Note[]>([]);
    const loadingGlobalNotes = ref(false);
    const errorGlobalNotes = ref<string | null>(null);

    // Pour les notes d'un élève dans un cours
    const notesMap = ref<Record<string, Note[]>>({});
    const loadingStudentNotes = ref(false);
    const errorStudentNotes = ref<string | null>(null);

    const noteService = new NoteService();

    async function fetchNotesForUser(userId: string) {
        loadingGlobalNotes.value = true;
        try {
            globalNotes.value = await noteService.getNotesForUser(userId);
            loadingGlobalNotes.value = false;
            console.log("Notes globales :", globalNotes.value);
        } catch (err: any) {
            errorGlobalNotes.value = err.message;
            loadingGlobalNotes.value = false;
        }
    }

    async function fetchNotesForStudentAndCourse(studentId: string, courseId: string) {
        loadingStudentNotes.value = true;
        try {
            const fetchedNotes = await noteService.getNotesForStudentAndCourse(studentId, courseId);
            notesMap.value[`${studentId}_${courseId}`] = fetchedNotes;
            loadingStudentNotes.value = false;
        } catch (err: any) {
            errorStudentNotes.value = err.message;
            loadingStudentNotes.value = false;
        }
    }

    async function addNoteForStudent(note: Note) {
        try {
            await noteService.addNote(note);
            await fetchNotesForStudentAndCourse(note.id_user, note.id_cours);
        } catch (err: any) {
            errorStudentNotes.value = err.message;
        }
    }

    async function updateNote(note: Note) {
        try {
            await noteService.updateNote(note);
            await fetchNotesForStudentAndCourse(note.id_user, note.id_cours);
        } catch (err: any) {
            errorStudentNotes.value = err.message;
        }
    }

    async function deleteNote(noteId: string, studentId: string, courseId: string) {
        try {
            await noteService.deleteNote(noteId);
            await fetchNotesForStudentAndCourse(studentId, courseId);
        } catch (err: any) {
            errorStudentNotes.value = err.message;
        }
    }

    const averageGrade = computed(() => {
        if (globalNotes.value.length === 0) return 0;
        const sum = globalNotes.value.reduce((acc, note) => acc + note.note, 0);
        return sum / globalNotes.value.length;
    });

    return {
        globalNotes,
        loadingGlobalNotes,
        errorGlobalNotes,
        fetchNotesForUser,
        averageGrade,
        notesMap,
        loadingStudentNotes,
        errorStudentNotes,
        fetchNotesForStudentAndCourse,
        addNoteForStudent,
        updateNote,
        deleteNote
    };
});
