/**
 * @swagger
 * tags:
 *  name: PointAttention
 *  description: Permet de gérer les pointattentions
 *
 */
import express from 'express';
const router = express.Router();
const PointAttentionController = require("../controllers/pointAttentionController");

/**
 * @swagger
 *  /pointattentions/intervention/{id}:
 *  post:
 *    summary: Permet d'ajouter un pointattention à une intervention
 *    tags: [PointAttention]
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
 *             $ref: '#/components/schemas/PointAttention'
 *    responses:
 *      200:
 *        description: PointAttention ajouté correctement
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant l'ajout du pointattention à l'intervention
 *
 */
router.post("/intervention/:id", PointAttentionController.ajouterPointAttention);

/**
 * @swagger
 *  /pointattentions/{id}:
 *  put:
 *    summary: Permets de modifier un pointattention
 *    tags: [PointAttention]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id du pointattention
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PointAttention'
 *    responses:
 *      200:
 *        description: Le pointattention modifié
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/PointAttention'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la modification du pointattention
 *
 */
router.put("/:id", PointAttentionController.modifierPointAttention);

/**
 * @swagger
 *  /pointattentions/{id}:
 *  delete:
 *    summary: Retourne le PointAttention spécifié par l'id
 *    tags: [PointAttention]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id du pointattention
 *    responses:
 *      200:
 *        description: Suppression OK
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/PointAttention'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la suppression du PointAttention
 *
 */
router.delete("/:id", PointAttentionController.supprimerPointAttention);

/**
 * @swagger
 * /pointattentions/{id}:
 *  get:
 *    summary: Retourne le PointAttention spécifié par l'id
 *    tags: [PointAttention]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id du pointattention
 *    responses:
 *      200:
 *        description: Le PointAttention spécifié par l'id
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/PointAttention'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la récupération du pointattention
 *
 */
router.get("/:id", PointAttentionController.getPointAttention);

module.exports = router;
