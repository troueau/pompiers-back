/**
 * @swagger
 * tags:
 *  name: Utilisateur
 *  description: L'utilisateur de l'application
 *  
 */
import express from 'express';
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');

/**
 * @swagger
 * /connect:
 *  get:
 *    summary: Connecte l'utilisateur à l'application et renvoie un boolean
 *    tags: [Utilisateur]
 *    parameters:
 *      - in: query
 *        name: nom
 *        schema:
 *          type: string
 *        required: true
 *        description: Le nom de l'utilisateur
 *      - in: query
 *        name: mdp
 *        schema:
 *          type: string
 *        required: true
 *        description: Le mot de passe de l'utilisateur
 *    responses:
 *      200:
 *          description: Le connection de l'utilisateur est valide
 *      401:
 *          description: La connection de l'utilisateur n'est pas valide
 *      500:
 *          description: Erreur lors de la connexion de l'utilisateur
 * 
 */
router.get('/', utilisateurController.login);

module.exports = router;