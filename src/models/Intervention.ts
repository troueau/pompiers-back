import mongoose from "mongoose";
import Moyen from "../models/Moyen";
import PointAttention from "../models/PointAttention";
import ZoneAction from "../models/ZoneAction";
import Action from "../models/Action";
import Trajectoire from "./Trajectoire";
import { CodeSinistreEnum, StatutInterventionEnum } from "./Enumerations";

const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *  schemas:
 *      Intervention:
 *          type: object
 *          required:
 *              - moyenListe
 *              - pointAttentionListe
 *              - zoneActionListe
 *              - actionListe
 *          properties:
 *              nom:
 *                  type: string
 *                  example: Bat 12D ISTIC, Beaulieu
 *                  description: Le nom de l'intervention
 *              position:
 *                  type: object
 *                  $ref: "#/components/schemas/Position"
 *                  description: Position de l'intervention
 *              codeSinistre:
 *                  type: string
 *                  $ref: "#/components/schemas/CodeSinistreEnum"
 *                  description: Le code sinistre de l'intervention
 *              moyenListe:
 *                  type: array
 *                  items:
 *                      type: string
 *                      $ref: "#/components/schemas/Moyen"
 *                  description: La liste des moyens de l'intervention
 *              pointAttentionListe:
 *                  type: array
 *                  items:
 *                      type: string
 *                      $ref: "#/components/schemas/PointAttention"
 *                  description: La liste des points d'attention de l'intervention
 *              zoneActionListe:
 *                  type: array
 *                  items:
 *                      type: string
 *                      $ref: "#/components/schemas/ZoneAction"
 *                  description: La liste des zones d'action de l'intervention
 *              actionListe:
 *                  type: array
 *                  items:
 *                      type: string
 *                      $ref: "#/components/schemas/Action"
 *                  description: L'intervention
 *              trajectoire:
 *                  type: object
 *                  $ref: "#/components/schemas/Trajectoire"
 *                  description: La trajectoire de l'intervention
 *              statut:
 *                  type: string
 *                  $ref: "#/components/schemas/StatutInterventionEnum"
 *                  description: Le statut du moyen
 */
const InterventionSchema = new Schema({
    nom: {
        type: String,
    },
    position: {
        type: {
            latitude: {
                type: Number,
                required: true,
            },
            longitude: {
                type: Number,
                required: true,
            },
        },
        required: false,
    },
    codeSinistre: {
        type: String,
        enum: CodeSinistreEnum,
    },
    moyenListe: [
        {
            type: Schema.Types.ObjectId,
            ref: Moyen,
            required: true,
        },
    ],
    pointAttentionListe: [
        {
            type: Schema.Types.ObjectId,
            ref: PointAttention,
            required: true,
        },
    ],
    zoneActionListe: [
        {
            type: Schema.Types.ObjectId,
            ref: ZoneAction,
            required: true,
        },
    ],
    actionListe: [
        {
            type: Schema.Types.ObjectId,
            ref: Action,
            required: true,
        },
    ],
    trajectoire: {
        type: Schema.Types.ObjectId,
        ref: Trajectoire,
    },
    statut: {
        type: String,
        enum: StatutInterventionEnum,
        default: StatutInterventionEnum.EN_COURS,
    },
});

export default mongoose.model("Intervention", InterventionSchema);
