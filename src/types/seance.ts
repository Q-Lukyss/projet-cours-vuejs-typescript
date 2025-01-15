  export type Seance = {
    id?: string;
    date: string; // Format ISO
    lieu: string;
    id_cours: string; // ID du cours associé
    presences: string[]; // Liste des IDs des présences
  };