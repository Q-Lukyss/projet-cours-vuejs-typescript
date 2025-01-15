  export type Document = {
    id?: string;
    nom: string;
    contenu: string;
    id_user: string; // ID de l'utilisateur ayant créé le document
  };