// src/entities/support.entity.ts
export class Support {
    constructor(
        public uid: string,
        public id_cours: string,
        public nom: string
    ) {}

    static fromFirestore(data: any, uid: string): Support {
        return new Support(
            uid,
            data.id_cours,
            data.nom
        );
    }
}
