import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *  schemas:
 *      Position:
 *          type: object
 *          required:
 *              - latitude
 *              - longitude
 *          properties:
 *              latitude:
 *                  type: number
 *                  description: La latitude de la position
 *              longitude:
 *                  type: number
 *                  description: La longitude de la position
 *          example:
 *              latitude: 48.115006
 *              longitude: -1.638568
 */
const PositionSchema = new Schema({
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
});

export default mongoose.model("Position", PositionSchema);
