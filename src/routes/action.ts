/**
 * @swagger
 * tags:
 *  name: Action
 *  description: Permet de gérer les actions
 *
 */
import express from 'express';
const router = express.Router();
const ActionController = require("../controllers/actionController");

/**
 * @swagger
 *  /actions/intervention/{id}:
 *  post:
 *    summary: Permet d'ajouter une action à une intervention
 *    tags: [Action]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id de l'intervention
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Action'
 *    responses:
 *      200:
 *        description: Action ajouté correctement
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant l'ajout de l'action à l'intervention
 *
 */
router.post("/intervention/:id", ActionController.ajouterAction);

/**
 * @swagger
 *  /actions/{id}:
 *  put:
 *    summary: Permets de modifier une action
 *    tags: [Action]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id de l'action
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Action'
 *    responses:
 *      200:
 *        description: L'action modifié
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/Action'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la modification de l'action
 *
 */
router.put("/:id", ActionController.modifierAction);

/**
 * @swagger
 *  /actions/{id}:
 *  delete:
 *    summary: Supprime une action spécifié par l'id
 *    tags: [Action]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id de l'action
 *    responses:
 *      200:
 *        description: Suppression OK
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/Action'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la suppression du Action
 *
 */
router.delete("/:id", ActionController.supprimerAction);

/**
 * @swagger
 * /actions/{id}:
 *  get:
 *    summary: Retourne l'Action spécifié par l'id
 *    tags: [Action]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id de l'action
 *    responses:
 *      200:
 *        description: L'Action spécifié par l'id
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/Action'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la récupération de l'action
 *
 */
router.get("/:id", ActionController.getAction);

/**
 * @swagger
 * /actions/intervention/{id}:
 *  get:
 *    summary: Retourne toutes les actions d'une intervention
 *    tags: [Action]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id de l'intervention
 *    responses:
 *      200:
 *        description: Les actions de l'intervention
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Action'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *        description: Erreur durant la récupération des actions de l'intervention
 */
router.get("/intervention/:id", ActionController.getActionsByIntervention);

module.exports = router;
