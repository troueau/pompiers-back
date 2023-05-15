import mongoose from "mongoose";
const Schema = mongoose.Schema;
import {
    CategorieComposanteEnum,
    CategorieMoyenEnum,
    StatutMoyenEnum,
    TypeVehiculeEnum,
} from "./Enumerations";

/**
 * @swagger
 * components:
 *  schemas:
 *      Moyen:
 *          type: object
 *          required:
 *              - categorieMoyen
 *              - typeVehicule
 *              - categorieComposante
 *              - statut
 *              - position
 *          properties:
 *              categorieMoyen:
 *                  type: string
 *                  $ref: "#/components/schemas/CategorieMoyenEnum"
 *                  description: La catégorie du moyen
 *              typeVehicule:
 *                  type: string
 *                  $ref: "#/components/schemas/TypeVehiculeEnum"
 *                  description: Le type de véhicule du moyen
 *              categorieComposante:
 *                  type: string
 *                  $ref: "#/components/schemas/CategorieComposanteEnum"
 *                  description: La catégorie de la composante du moyen
 *              statut:
 *                  type: string
 *                  $ref: "#/components/schemas/StatutMoyenEnum"
 *                  description: Le statut du moyen
 *              position:
 *                  type: object
 *                  $ref: "#/components/schemas/Position"
 *                  description: Position de l'intervention
 *              label:
 *                  type: string
 *                  description: Le label du moyen
 *              heureDemande:
 *                  type: string
 *                  pattern: '^\d{3,4}'
 *                  description: L'heure de demande du moyen
 *              heurePrevu:
 *                  type: string
 *                  pattern: '^\d{3,4}'
 *                  description: L'heure prévue du moyen
 *              heureAuCRM:
 *                  type: string
 *                  pattern: '^\d{3,4}'
 *                  description: L'heure au CRM du moyen
 *              heureEngage:
 *                  type: string
 *                  pattern: '^\d{3,4}'
 *                  description: L'heure d'engagement du moyen
 *              heureRetourDisponible:
 *                  type: string
 *                  pattern: '^\d{3,4}'
 *                  description: L'heure de retour disponible du moyen
 */
const MoyenSchema = new Schema({
    categorieMoyen: {
        type: String,
        enum: CategorieMoyenEnum,
    },
    typeVehicule: {
        type: String,
        enum: TypeVehiculeEnum,
    },
    categorieComposante: {
        type: String,
        enum: CategorieComposanteEnum,
    },
    statut: {
        type: String,
        enum: StatutMoyenEnum,
    },
    position: {
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
    },
    label: String,
    heureDemande: {
        type: String,
        default: "",
    },
    heurePrevu: {
        type: String,
        default: "",
    },
    heureAuCRM: {
        type: String,
        default: "",
    },
    heureEngage: {
        type: String,
        default: "",
    },
    heureRetourDisponible: {
        type: String,
        default: "",
    },
});

export default mongoose.model("Moyen", MoyenSchema);
