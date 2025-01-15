 export type Presence = {
    id?: string;
    id_user: string; // ID de l'utilisateur
    id_seance: string; // ID de la séance
    is_present: boolean;
    justificatif?: {
      id_justificatif: string;
      piece: string; // URL vers la pièce jointe
      motif: string; // Motif de l'absence
    };
  };