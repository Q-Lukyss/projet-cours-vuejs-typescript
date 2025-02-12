// src/entities/presence.entity.ts
export class Presence {
    constructor(
        public id_presence: string,
        public id_seance: string,
        public id_user: string,
        public is_present: boolean,
        public justificatifs?: string // facultatif
    ) {}

    // Convertit les données brutes en instance de Presence
    static fromFirestore(data: any, id_presence: string): Presence {
        return new Presence(
            id_presence,
            data.id_seance,
            data.id_user,
            data.is_present,
            data.justificatifs
        );
    }
}
