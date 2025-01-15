  export type Cours = {
    id?: string;
    nom: string;
    enseignant: string;
    supports: string[]; // Liste des IDs des supports de cours
    seances: string[]; // Liste des IDs des séances
  };