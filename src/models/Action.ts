import mongoose from "mongoose";
import { CategorieComposanteEnum, StatutActionEnum, TypeActionEnum } from "./Enumerations";

const Schema = mongoose.Schema;

const ActionSchema = new Schema({
    chemin: [
        {
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
            required: true,
        },
    ],
    label: {
        type: String,
    },
    commentaire: {
        type: String,
    },
    typeAction: {
        type: String,
        enum: TypeActionEnum,
    },
    statut: {
        type: String,
        enum: StatutActionEnum,
    },
    categorie: {
        type: String,
        enum: CategorieComposanteEnum,
    },
});

export default mongoose.model("Action", ActionSchema);
