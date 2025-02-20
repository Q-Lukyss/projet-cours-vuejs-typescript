export class NewsEntity {
    constructor(
        public uid: string,
        public titre: string,
        public contenu: string,
        public date: Date,
        public is_active: boolean
    ) {}

    // Méthode utilitaire pour créer une instance à partir des données Firestore
    static fromFirestore(data: any, uid: string): NewsEntity {
        return new NewsEntity(
            uid,
            data.titre,
            data.contenu,
            data.date?.toDate ? data.date.toDate() : data.date,
            data.is_active,
        );
    }
}
