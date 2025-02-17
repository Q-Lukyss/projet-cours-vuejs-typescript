// src/entities/presence.entity.ts
export class Presence {
    constructor(
        public uid: string,
        public id_seance: string,
        public id_user: string,
        public is_present: boolean,
        public justificatifs?: string // facultatif
    ) {}

    // Convertit les données brutes en instance de Presence
    static fromFirestore(data: any, uid: string): Presence {
        return new Presence(
            uid,
            data.id_seance,
            data.id_user,
            data.is_present,
            data.justificatifs
        );
    }
}
