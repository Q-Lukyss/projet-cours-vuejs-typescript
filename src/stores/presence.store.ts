// src/stores/presence.store.ts
import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import {Presence} from '@/entities/presence';
import {PresenceService} from '@/services/presence.service';

export const usePresenceStore = defineStore('presence', () => {
    const presences = ref<Presence[]>([]);
    const loadingPresence = ref(false);
    const errorPresence = ref<string | null>(null);

    const presenceService = new PresenceService();

    // Action pour récupérer les présences d'un utilisateur
    async function fetchPresences(userId: string) {
        loadingPresence.value = true;
        try {
            presences.value = await presenceService.getPresencesForUser(userId);
            loadingPresence.value = false;
        } catch (err: any) {
            errorPresence.value = err.message;
            loadingPresence.value = false;
        }
    }

    // Nombre de présences (is_present === true)
    const nbPresences = computed(() => presences.value.filter(p => p.is_present).length);

    // Nombre d'absences (is_present === false)
    const nbAbsences = computed(() => presences.value.filter(p => !p.is_present).length);

    // Liste des absences à justifier : absence sans justificatifs (null, undefined ou chaîne vide)
    const absencesToJustify = computed(() =>
        presences.value.filter(p => !p.is_present && (!p.justificatifs || p.justificatifs.trim() === ''))
    );

    return { presences, loadingPresence, errorPresence, fetchPresences, nbPresences, nbAbsences, absencesToJustify };
});
