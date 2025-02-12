export class SeanceEntity {
    constructor(
        public uid: string,
        public date: Date,
        public date_fin: Date,
        public id_cours: string,
        public lieu: string,
        public presences: string[],
    ) {}

    // Méthode utilitaire pour créer une instance à partir des données Firestore
    static fromFirestore(data: any, uid: string): SeanceEntity {
        return new SeanceEntity(
            uid,
            data.date?.toDate ? data.date.toDate() : data.date,
            data.date_fin?.toDate ? data.date_fin.toDate() : data.date_fin,
            data.id_cours,
            data.lieu,
            data.presences || [],
        );
    }
}
