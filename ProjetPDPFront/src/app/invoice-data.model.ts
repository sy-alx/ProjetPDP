export interface InvoiceData {
    emetteur: {
      NomEntreprise: string;
      NumeroSiret: string;
      NumeroTVA: string;
      CodePays: string;
    };
    correspondant: {
      NomEntreprise: string;
      NumeroSiret: string;
      NumeroTVA: string;
      CodePays: string;
    };
    facture: {
      CodeDevise: string;
      NumeroFacture: string | null;
      TotalHT: string | null;
      TotalTVA: string | null;
      TotalTTC: string | null;
      RestantAPayer: string | null;
    };
    status: string;

}
  