export class DocumentEntity {
    constructor(
        public uid: string,
        public id_user: string,
        public nom: string
    ) {}

    // Méthode utilitaire pour créer une instance à partir des données Firestore
    static fromFirestore(data: any, uid: string): DocumentEntity {
        return new DocumentEntity(
            uid,
            data.id_user,
            data.nom
        );
    }
}
