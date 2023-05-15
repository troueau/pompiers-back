export enum TypeVehiculeEnum {
    VSAV = "VSAV",
    FPT = "FPT",
    VLCG = "VLCG",
    EMPTY = "EMPTY",
}

export enum CategorieComposanteEnum {
    PAR_DEFAUT = "PAR_DEFAUT",
    HUMAINE = "HUMAINE",
    INCENDIE = "INCENDIE",
    RISQUE_PARTICULIER = "RISQUE_PARTICULIER",
    EAU = "EAU",
    COMMANDEMENT = "COMMANDEMENT",
}

export enum StatutMoyenEnum {
    DEMANDE = "DEMANDE",
    DISPONIBLE = "DISPONIBLE",
    PREVU = "PREVU",
    ARRIVE = "ARRIVE",
    ACTIF = "ACTIF",
    RETOUR = "RETOUR",
}

export enum TypePointAttentionEnum {
    CIBLE = "CIBLE",
    DANGER = "DANGER",
    SINISTRE = "SINISTRE",
}

export enum TypeTrajectoireEnum {
    ALLER_RETOUR = "ALLER_RETOUR",
    RONDE = "RONDE",
    BALAYAGE = "BALAYAGE",
}

export enum CodeSinistreEnum {
    SAP = "SAP",
    INC = "INC",
}

export enum CategorieMoyenEnum {
    SAPEURS_POMPIERS = "SAPEURS_POMPIERS",
    NON_SAPEUR_POMPIERS = "NON_SAPEUR_POMPIERS",
    AERIEN = "AERIEN",
}

export enum TypeActionEnum {
    OFFENSIVE = "OFFENSIVE",
    RECONNAISSANCE = "RECONNAISSANCE",
    DEFENSIVE = "DEFENSIVE",
}

export enum StatutActionEnum {
    PREVUE = "PREVUE",
    EN_COURS = "EN_COURS",
}

export enum StatutInterventionEnum {
    EN_COURS = "EN_COURS",
    TERMINEE = "TERMINEE",
}
