// src/entities/note.entity.ts
export class Note {
    constructor(
        public uid: string,
        public id_cours: string,
        public id_user: string,
        public libelle: string,
        public note: number
    ) {}

    static fromFirestore(data: any, uid: string): Note {
        return new Note(
            uid,
            data.id_cours,
            data.id_user,
            data.libelle,
            data.note
        );
    }
}
