/**
 * @swagger
 * tags:
 *  name: Intervention
 *  description: Permet de gérer les interventions
 *
 */
import express from "express";
const router = express.Router();
const interventionController = require("../controllers/interventionController");

/**
 * @swagger
 * /interventions:
 *  get:
 *    summary: Retourne toutes les interventions
 *    tags: [Intervention]
 *    responses:
 *      200:
 *        description: La liste de toutes les interventions
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/intervention'
 *      500:
 *          description: Erreur durant la récupération des interventions
 *
 */
router.get("/", interventionController.getInterventions);

/**
 * @swagger
 * /interventions/{id}:
 *  get:
 *    summary: Retourne l'intervention spécifié par l'id
 *    tags: [Intervention]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id de l'intervention
 *    responses:
 *      200:
 *          description: L'intervention spécifié par l'id
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref:'#/components/schemas/intervention'
 *      404:
 *          description: L'intervention n'a pas été trouvé
 *      422:
 *         description: L'id de l'intervention n'est pas valide
 *      500:
 *          description: Erreur durant la récupération de l'intervention
 *
 */
router.get("/:id", interventionController.getIntervention);

/**
 * @swagger
 * /interventions:
 *  post:
 *    summary: Permet d'ajouter une nouvelle intervention
 *    tags: [Intervention]
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Intervention'
 *    responses:
 *      201:
 *        description: L'intervention a bien été ajouté
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/Intervention'
 *      500:
 *          description: Erreur durant l'ajout de l'intervention
 *
 */
router.post("/", interventionController.createIntervention);

/**
 * @swagger
 * /interventions/{id}:
 *  delete:
 *    summary: Permet de supprimer une intervention
 *    tags: [Intervention]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id de l'intervention
 *    responses:
 *      200:
 *        description: L'intervention a bien été supprimée
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/Intervention'
 *      422:
 *        description: L'id de l'intervention n'est pas valide
 *      500:
 *          description: Erreur durant la suppression de l'intervention
 *
 */
router.delete("/:id", interventionController.supprimerIntervention);

/**
 * @swagger
 * /interventions/{id}:
 *  put:
 *    summary: Permet de mettre à jour une intervention, attention les tableaux devront être des sous ensembles de l'existant (pas possible d'ajouter de nouveau moyen, pointAtention, zoneAction et action)
 *    tags: [Intervention]
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
 *             $ref: '#/components/schemas/Intervention'
 *    responses:
 *      200:
 *        description: L'intervention a bien été modifié
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/Intervention'
 *      404:
 *        description: L'intervention n'existe pas
 *      422:
 *        description: L'id de l'intervention ou le contenu de la requête n'est pas valide
 *      500:
 *          description: Erreur durant la mise à jour de l'intervention
 *
 */
router.put("/:id", interventionController.updateIntervention);

module.exports = router;
