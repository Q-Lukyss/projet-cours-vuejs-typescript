export class User {
    constructor(
        public uuid: string,
        public name: string,
        public email: string,
        public statut: string
    ) {}

    // Convertit des données brutes en instance de User
    static fromFirestore(data: any, uuid: string): User {
        return new User(uuid, data.name, data.email, data.statut);
    }
}
