// src/services/user.service.ts
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    addDoc,
} from 'firebase/firestore';
import { User } from '@/entities/user';

export class UserService {
    private db = getFirestore();
    private collectionRef = collection(this.db, 'Users');

    // Récupère un user par son uuid
    async getUser(uuid: string): Promise<User | null> {
        try {
            const docRef = doc(this.db, 'Users', uuid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return User.fromFirestore(docSnap.data(), docSnap.id);
            }
            return null;
        } catch (error) {
            console.error("Erreur lors de la récupération du user :", error);
            throw error;
        }
    }

    // Crée ou met à jour un user dans Firestore
    async createOrUpdateUser(user: User): Promise<void> {
        try {
            await setDoc(doc(this.db, 'Users', user.uid), {
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                status: user.statut,
            });
        } catch (error) {
            console.error("Erreur lors de la création/mise à jour du user :", error);
            throw error;
        }
    }

    // Récupère la liste des utilisateurs
    async getUsers(): Promise<User[]> {
        try {
            const querySnapshot = await getDocs(this.collectionRef);
            return querySnapshot.docs.map(docSnap => User.fromFirestore(docSnap.data(), docSnap.id));
        } catch (error) {
            console.error("Erreur lors de la récupération des users :", error);
            throw error;
        }
    }

    // Ajoute un nouveau user
    async addUser(user: User): Promise<void> {
        // Laisser Firestore générer l'ID
        await addDoc(this.collectionRef, {
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            status: user.statut,
        });
    }

    // Met à jour un user existant
    async updateUser(user: User): Promise<void> {
        const docRef = doc(this.db, 'Users', user.uid);
        await updateDoc(docRef, {
            nom: user.nom,
            prenom: user.prenom,
        });
    }

    // Supprime un user
    async deleteUser(userId: string): Promise<void> {
        const docRef = doc(this.db, 'Users', userId);
        await deleteDoc(docRef);
    }
}
