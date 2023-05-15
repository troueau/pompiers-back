import mongoose from "mongoose";
const Schema = mongoose.Schema;

import {
    CategorieComposanteEnum,
    TypePointAttentionEnum,
} from "./Enumerations";

const PointAttentionSchema = new Schema({
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
    type: {
        type: String,
        enum: TypePointAttentionEnum,
    },
    categorie: {
        type: String,
        enum: CategorieComposanteEnum,
    },
});

export default mongoose.model("PointAttention", PointAttentionSchema);
