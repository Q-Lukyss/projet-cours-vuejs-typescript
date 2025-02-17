export class User {
    constructor(
        public uid: string,
        public nom: string,
        public prenom: string,
        public email: string,
        public statut: string
    ) {}

    // Convertit des données brutes en instance de User
    static fromFirestore(data: any, uuid: string): User {
        return new User(
            uuid,
            data.nom,
            data.prenom,
            data.email,
            data.statut);
    }
}
