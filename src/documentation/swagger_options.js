module.exports = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Documentation back-end nodeJS/Express de notre application \"Pompier\"",
            version: "0.1.0",
            description: "This is a simple CRUD API application made with Express and documented with Swagger",
        },
        servers: [
            {
                url: "http://localhost:8085",
            },
            {
                url: "http://148.60.11.163/",
            },
        ],
        components: {
            schemas: {
                PointAttention: {
                    properties: {
                        _id: {
                            type: "string"
                        },
                        position: {
                            type: "object",
                            required: true,
                            $ref: "#/components/schemas/Position"
                        },
                        label: {
                            type: "string"
                        },
                        commentaire: {
                            type: "string"
                        },
                        type: {
                            type: "string",
                            required: true,
                            $ref: "#/components/schemas/TypePointAttentionEnum"
                        },
                        categorie: {
                            type: "string",
                            required: true,
                            $ref: "#/components/schemas/CategorieComposanteEnum"
                        }
                    }
                },
                ZoneAction: {
                    properties: {
                        _id: {
                            type: "string"
                        },
                        position: {
                            type: "object",
                            required: true,
                            $ref: "#/components/schemas/Position"
                        },
                        label: {
                            type: "string"
                        },
                        commentaire: {
                            type: "string"
                        },
                        categorie: {
                            type: "string",
                            required: true,
                            $ref: "#/components/schemas/CategorieComposanteEnum"
                        },
                        taille: {
                            type: "number",
                            default: 1
                        }
                    }
                },
                Action: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string"
                        },
                        chemin: {
                            type: "array",
                            required: true,
                            items: {
                                type: "object",
                                $ref: '#/components/schemas/Position'
                            }
                        },
                        label: {
                            type: "string"
                        },
                        commentaire: {
                            type: "string"
                        },
                        typeAction: {
                            type: "string",
                            required: true,
                            $ref: "#/components/schemas/TypeActionEnum"
                        },
                        statut: {
                            type: "string",
                            required: true,
                            $ref: "#/components/schemas/StatutActionEnum"
                        },
                        categorie: {
                            type: "string",
                            required: true,
                            $ref: "#/components/schemas/CategorieComposanteEnum"
                        }
                    }
                },
                CategorieMoyenEnum: {
                    type: "string",
                    enum: [
                        "SAPEURS_POMPIERS",
                        "NON_SAPEUR_POMPIERS",
                        "AERIEN"
                    ]
                },
                TypeVehiculeEnum: {
                    type: "string",
                    enum: [
                        "VSAV",
                        "FPT",
                        "VLCG",
                        "EMPTY"
                    ]
                },
                StatutMoyenEnum: {
                    type: "string",
                    enum: [
                        "DEMANDE",
                        "DISPONIBLE",
                        "PREVU",
                        "ARRIVE",
                        "ACTIF",
                        "RETOUR"
                    ]
                },
                StatutInterventionEnum: {
                    type: "string",
                    enum: [
                        "EN_COURS",
                        "TERMINEE",
                    ]
                },
                TypeActionEnum: {
                    type: "string",
                    enum: [
                        "OFFENSIVE",
                        "RECONNAISSANCE",
                        "DEFENSIVE"
                    ]
                },
                StatutActionEnum: {
                    type: "string",
                    enum: [
                        "PREVUE",
                        "EN_COURS"
                    ]
                },
                CodeSinistreEnum: {
                    type: "string",
                    enum: [
                        "SAP",
                        "INC"
                    ]
                },
                TypePointAttentionEnum: {
                    type: "string",
                    enum: [
                        "CIBLE",
                        "DANGER",
                        "SINISTRE"
                    ]
                },
                CategorieComposanteEnum: {
                    type: "string",
                    enum: [
                        "PAR_DEFAUT",
                        "HUMAINE",
                        "INCENDIE",
                        "RISQUE_PARTICULIER",
                        "EAU",
                        "COMMANDEMENT"
                    ]
                },
                TypeTrajectoireEnum: {
                    type: "string",
                    enum: [
                        "ALLER_RETOUR",
                        "RONDE",
                        "BALAYAGE",
                        "CIBLE",
                        "PHOTO"
                    ]
                }
            }
        }
    },
    apis: ["./src/routes/*", "./src/models/*.ts"],
  };

  