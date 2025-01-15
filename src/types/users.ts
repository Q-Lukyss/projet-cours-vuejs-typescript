export type User = {
    id?: string; // Optionnel, car Firestore génère l'ID
    nom: string;
    prenom: string;
    email: string;
    password?: string; // Optionnel si on utilise Firebase Auth
    formations: string[]; // Liste des IDs des formations suivies
    documents: string[]; // Liste des IDs des documents créés
  };
  