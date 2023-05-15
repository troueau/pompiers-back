/**
 * @swagger
 * tags:
 *  name: ZoneAction
 *  description: Permet de gérer les zoneactions
 *
 */
import express from 'express';
const router = express.Router();
const ZoneActionController = require("../controllers/zoneActionController");

/**
 * @swagger
 *  /zoneactions/intervention/{id}:
 *  post:
 *    summary: Permet d'ajouter un zoneaction à une intervention
 *    tags: [ZoneAction]
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
 *             $ref: '#/components/schemas/ZoneAction'
 *    responses:
 *      200:
 *        description: ZoneAction ajouté correctement
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant l'ajout du zoneaction à l'intervention
 *
 */
router.post("/intervention/:id", ZoneActionController.ajouterZoneAction);

/**
 * @swagger
 *  /zoneactions/{id}:
 *  put:
 *    summary: Permets de modifier un zoneaction
 *    tags: [ZoneAction]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id du zoneaction
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ZoneAction'
 *    responses:
 *      200:
 *        description: Le zoneaction modifié
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/ZoneAction'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la modification du zoneaction
 *
 */
router.put("/:id", ZoneActionController.modifierZoneAction);

/**
 * @swagger
 *  /zoneactions/{id}:
 *  delete:
 *    summary: Retourne le ZoneAction spécifié par l'id
 *    tags: [ZoneAction]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id du zoneaction
 *    responses:
 *      200:
 *        description: Suppression OK
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/ZoneAction'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la suppression du ZoneAction
 *
 */
router.delete("/:id", ZoneActionController.supprimerZoneAction);

/**
 * @swagger
 * /zoneactions/{id}:
 *  get:
 *    summary: Retourne le ZoneAction spécifié par l'id
 *    tags: [ZoneAction]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id du zoneaction
 *    responses:
 *      200:
 *        description: Le ZoneAction spécifié par l'id
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/ZoneAction'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la récupération du zoneaction
 *
 */
router.get("/:id", ZoneActionController.getZoneAction);

module.exports = router;
