// src/stores/presence.store.ts
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { Presence } from '@/entities/presence';
import { PresenceService } from '@/services/presence.service';

export const usePresenceStore = defineStore('presence', () => {
    const presences = ref<Presence[]>([]);
    const loadingPresence = ref(false);
    const errorPresence = ref<string | null>(null);

    const presenceService = new PresenceService();

    // Récupère toutes les présences (pour l'administration)
    async function fetchPresences() {
        loadingPresence.value = true;
        try {
            presences.value = await presenceService.getAllPresences();
            loadingPresence.value = false;
        } catch (err: any) {
            errorPresence.value = err.message;
            loadingPresence.value = false;
        }
    }

    // Met à jour une présence (ex. ajouter un justificatif)
    async function updatePresence(presence: Presence) {
        try {
            await presenceService.updatePresence(presence);
            await fetchPresences();
        } catch (err: any) {
            errorPresence.value = err.message;
        }
    }

    // Nombre d'absences (is_present === false)
    const nbAbsences = computed(() => presences.value.filter(p => !p.is_present).length);

    // Liste des absences à justifier : absence sans justificatifs (null, undefined ou chaîne vide)
    const absencesToJustify = computed(() =>
        presences.value.filter(p => !p.is_present && (!p.justificatifs || p.justificatifs.trim() === ''))
    );

    return { presences, loadingPresence, errorPresence, fetchPresences, updatePresence, nbAbsences, absencesToJustify };
});
