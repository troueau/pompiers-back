/**
 * @swagger
 * tags:
 *  name: Moyen
 *  description: Permet de gérer les moyens
 *
 */
import express from 'express';
const router = express.Router();
const MoyenController = require("../controllers/moyenController");

/**
 * @swagger
 *  /moyens/intervention/{id}:
 *  post:
 *    summary: Permet d'ajouter un moyen à une intervention
 *    tags: [Moyen]
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
 *             $ref: '#/components/schemas/Moyen'
 *    responses:
 *      200:
 *        description: Moyen ajouté correctement
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant l'ajout du moyen à l'intervention
 *
 */
router.post("/intervention/:id", MoyenController.ajouterMoyen);

/**
 * @swagger
 *  /moyens/{id}:
 *  put:
 *    summary: Permets de modifier un moyen
 *    tags: [Moyen]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id du moyen
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Moyen'
 *    responses:
 *      200:
 *        description: Le moyen modifié
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/Moyen'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la modification du moyen
 *
 */
router.put("/:id", MoyenController.modifierMoyen);

/**
 * @swagger
 *  /moyens/{id}:
 *  delete:
 *    summary: Retourne le Moyen spécifié par l'id
 *    tags: [Moyen]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id du moyen
 *    responses:
 *      200:
 *        description: Suppression OK
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/Moyen'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la suppression du Moyen
 *
 */
router.delete("/:id", MoyenController.supprimerMoyen);

/**
 * @swagger
 * /moyens/{id}:
 *  get:
 *    summary: Retourne le Moyen spécifié par l'id
 *    tags: [Moyen]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id du moyen
 *    responses:
 *      200:
 *        description: Le Moyen spécifié par l'id
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/Moyen'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la récupération du moyen
 *
 */
router.get("/:id", MoyenController.getMoyen);


/**
 * @swagger
 * /moyens:
 *  get:
 *    summary: Retourne le Moyen spécifié par l'id
 *    tags: [Moyen]
 *    parameters:
 *     - in: query
 *       name: typeVehicule
 *       schema:
 *          type: string
 *       description: Le type de vehicule
 *     - in: query
 *       name: categorieComposante
 *       schema:
 *          type: string
 *       description: La categorie de composant
 *     - in: query
 *       name: categorieMoyen
 *       schema:
 *          type: string
 *       description: La categorie de moyen
 *     - in: query
 *       name: statut
 *       schema:
 *          type: string
 *       description: Le statut du moyen
 *     - in: query
 *       name: intervention
 *       schema:
 *          type: boolean
 *       description: Si à vrai retourne l'intervention liée au moyen
 *    responses:
 *      200:
 *        description: Le Moyen spécifié par l'id
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/Moyen'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la récupération du moyen
 *
 */
router.get("/", MoyenController.getMoyens);


/**
 * @swagger
 * /moyens/interventions/{id}:
 *  get:
 *    summary: Retourne les Moyens liée à une intervention spécifié par l'id
 *    tags: [Moyen]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id du moyen
 *     - in: query
 *       name: typeVehicule
 *       schema:
 *          type: string
 *       description: Le type de vehicule
 *     - in: query
 *       name: categorieComposante
 *       schema:
 *          type: string
 *       description: La categorie de composant
 *     - in: query
 *       name: categorieMoyen
 *       schema:
 *          type: string
 *       description: La categorie de moyen
  *     - in: query
 *       name: statut
 *       schema:
 *          type: string
 *       description: Le statut du moyen
 *    responses:
 *      200:
 *        description: Le Moyen spécifié par l'id
 *        content:
 *          application/json:
 *            schema:
 *                $ref:'#/components/schemas/Moyen'
 *      404:
 *        description: Object non trouvé
 *      422:
 *        description: Paramètre invalide
 *      500:
 *          description: Erreur durant la récupération du moyen
 *
 */
router.get("/interventions/:id", MoyenController.getMoyensByInterventions);

module.exports = router;
