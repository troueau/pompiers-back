import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *  schemas:
 *      Trajectoire:
 *          type: object
 *          required:
 *              - points
 *              - type
 *          properties:
 *              points:
 *                  type: array
 *                  items:
 *                      type: object
 *                      required: true
 *                      $ref: "#/components/schemas/Position"
 *                  required: true
 *                  description: Points de la trajectoire du drone (minimum 2 points)
 *              type:
 *                  type: string
 *                  required: true
 *                  $ref: "#/components/schemas/TypeTrajectoireEnum"
 *                  description: Type de trajectoire du drone
 *          example:
 *              points: [
 *                   {
 *                       latitude: 48.1192189,
 *                       longitude: -1.6394668
 *                   },
 *                   {
 *                       latitude: 48.118973,
 *                       longitude: -1.639215
 *                   }
 *              ]
 *              type: RONDE
 */
const TrajectoireSchema = new Schema({
  points: [
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
  type: {
    type: String,
    enum: ["ALLER_RETOUR", "RONDE", "BALAYAGE", "CIBLE", "PHOTO"],
  },
});

export default mongoose.model("Trajectoire", TrajectoireSchema);
