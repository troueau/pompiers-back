import mongoose from "mongoose";
import { CategorieComposanteEnum } from "./Enumerations";

const Schema = mongoose.Schema;

const ZoneActionSchema = new Schema({
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
    label: {
        type: String,
    },
    commentaire: {
        type: String,
    },
    categorie: {
        type: String,
        enum: CategorieComposanteEnum,
    },
    taille: {
        type: Number,
        default: 1,
    }
});

export default mongoose.model("ZoneAction", ZoneActionSchema);
