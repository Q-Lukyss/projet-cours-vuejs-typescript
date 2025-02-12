// src/entities/cours.entity.ts
export class Cours {
    constructor(
        public uid: string,
        public id_enseignant: string,
        public nom: string,
        public seances: string[],    // liste d'IDs de séances
        public supports: string[]    // liste d'IDs de supports (cette liste peut être redondante si vous gérez les supports via une collection dédiée)
    ) {}

    static fromFirestore(data: any, uid: string): Cours {
        return new Cours(
            uid,
            data.id_enseignant,
            data.nom,
            data.seances || [],
            data.supports || []
        );
    }
}
