export class JustificatifEntity {
    constructor(
        public uid: string,
        public is_admin_valid: boolean,
        public motif: string,
        public piece: string
    ) {}

    // Méthode utilitaire pour créer une instance à partir des données Firestore
    static fromFirestore(data: any, uid: string): JustificatifEntity {
        return new JustificatifEntity(
            uid,
            data.is_admin_valid,
            data.motif,
            data.piece
        );
    }
}
