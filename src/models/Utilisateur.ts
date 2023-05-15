import mongoose from 'mongoose';
const { Schema, model } = mongoose;

/** 
 * @swagger
 * components:
 *  schemas:
 *      Utilisateur:
 *          type: object
 *          required:
 *              - nom
 *              - mdp
 *          properties:
 *              nom:
 *                  type: string
 *                  description: Le nom de l'utilisateur
 *              mdp:
 *                  type: string
 *                  description: Le hash du mot de passe de l'utilisateur
 *          example:
 *              nom: John Doe
 *              mdp: $2b$10$Wdj1lOudt3JXEc6TBI2C6.Wafuv33
 */
const utilisateurSchema = new Schema({
    nom: String,
    mdp: String
})

const Utilisateur = model('Utilisateur', utilisateurSchema);
export default Utilisateur;