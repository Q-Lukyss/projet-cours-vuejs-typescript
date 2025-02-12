export class Formation {
    constructor(
        public uid: string,
        public annee: string,
        public nom: string,
        public cours: string[],    // liste d'IDs de cours
        public eleves: string[]    // liste d'UID d'utilisateurs
    ) {}

    static fromFirestore(data: any, uid: string): Formation {
        return new Formation(
            uid,
            data.annee,
            data.nom,
            data.cours || [],
            data.eleves || []
        );
    }
}
