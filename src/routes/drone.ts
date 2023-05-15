/**
 * @swagger
 * tags:
 *  name: Drone
 *  description: Le Drone de l'application
 *
 */
import express from "express";
const router = express.Router();
const droneController = require("../controllers/droneController");

/**
 * @swagger
 * /drone/trajectoire/intervention/{id}:
 *  post:
 *    summary: Envoie des points correspondant à la trajectoire du drone et appel le drone pour executer le type de trajectoire. Associe la trajectoire à l'intervention correspondante
 *    tags: [Drone]
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
 *             $ref: '#/components/schemas/Trajectoire'
 *       description: Le type de trajectoire et les points de la trajectoire (minimum 2 points)
 *    responses:
 *      201:
 *          description: La trajectoire a bien été envoyée au drone et associée à l'intervention
 *      400:
 *          description: Le type de trajectoire n'est pas valide / est inconnu
 *      404:
 *          description: L'intervention n'a pas été trouvée
 *      422:
 *          description: Paramètre invalide
 *      500:
 *          description: Erreur lors de l'envoie de la trajectoire au drone - Erreur lors de l'association de la trajectoire à l'intervention
 *      501:
 *          description: Endpoint non implémenté côté drone
 *
 */
router.post("/trajectoire/intervention/:id", droneController.postTrajectoire);

/**
 * @swagger
 * /drone/trajectoire/intervention/{id}:
 *  delete:
 *    summary: Supprime la trajectoire associée à l'intervention
 *    tags: [Drone]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id de l'intervention
 *    responses:
 *      200:
 *         description: La trajectoire a bien été supprimée de l'intervention
 *      404:
 *         description: L'intervention / la trajectoire n'a pas été trouvée
 *      500:
 *         description: Erreur lors de la suppression de la trajectoire de l'intervention
 *
 */
router.delete("/trajectoire/intervention/:id", droneController.deleteTrajectoire);

/**
 * @swagger
 * /drone/trajectoire/intervention/{id}:
 *  get:
 *    summary: Récupère la trajectoire associée à l'intervention
 *    tags: [Drone]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id de l'intervention
 *    responses:
 *      200:
 *          description: La trajectoire a bien été récupérée
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Trajectoire'
 *      404:
 *          description: L'intervention / la trajectoire n'a pas été trouvée
 *      422:
 *          description: Paramètre invalide
 *      500:
 *          description: Erreur lors de la récupération de l'intervention
 * 
 */
router.get("/trajectoire/intervention/:id", droneController.getTrajectoire);

/**
 * @swagger
 * /drone/gotoBase:
 *  post:
 *    summary: Appelle le drone pour qu'il retourne à sa base
 *    tags: [Drone]
 *    responses:
 *      201:
 *          description: La requete a bien été envoyée au drone
 *      500:
 *          description: Erreur lors de l'envoie de la requete au drone
 *
 */
router.post("/gotoBase", droneController.gotoBase);

/**
 * @swagger
 * /drone/goto/intervention/{id}:
 *  post:
 *    summary: Envoie d'une position au drone pour qu'il s'y rende, et associe la position à l'intervention correspondante
 *    tags: [Drone]
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
 *             $ref: '#/components/schemas/Position'
 *       description: La position a envoyer au drone
 *    responses:
 *      201:
 *          description: La requete a bien été envoyée au drone
 *      404:
 *          description: L'intervention n'a pas été trouvée
 *      422:
 *          description: Paramètre invalide
 *      500:
 *          description: Erreur lors de l'envoie de la requete au drone / Erreur lors de l'association de la position à l'intervention
 *
 */
router.post("/goto/intervention/:id", droneController.goto);

/**
 * @swagger
 * /drone/cancelTask:
 *  post:
 *    summary: Envoie une requete au drone pour qu'il annule sa tâche actuelle
 *    tags: [Drone]
 *    responses:
 *      201:
 *          description: La requete a bien été envoyée au drone
 *      500:
 *          description: Erreur lors de l'envoie de la requete au drone
 */
router.post("/cancelTask", droneController.cancelTask);

/**
 * @swagger
 * /drone/trajectoirePhotos/intervention/{id}:
 *  post:
 *    summary: Envoie une requete au drone pour qu'il prenne des photos aux points de la trajectoire associée à l'intervention
 *    tags: [Drone]
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
 *             $ref: '#/components/schemas/Trajectoire'
 *       description: Le type de trajectoire et les points de la trajectoire (TYPE = PHOTO)
 *    responses:
 *      201:
 *          description: La requete a bien été envoyée au drone et les photos sont en cours de traitement
 *      400:
 *          description: La trajectoire n'est pas le bon
 *      422:
 *          description: Paramètre invalide
 *      404:
 *          description: L'intervention n'a pas été trouvée
 *      500:
 *          description: Erreur lors de l'envoie de la requete au drone
 *   
 */
router.post("/trajectoirePhotos/intervention/:id", droneController.postPhotosTrajectoire);

/**
 * @swagger
 * /drone/trajectoirePhotos/intervention/{id}:
 *  get:
 *    summary: Récupère les photos du drone associées à l'intervention
 *    tags: [Drone]
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *          type: string
 *       required: true
 *       description: L'id de l'intervention
 *    responses:
 *      200:
 *          description: Les photos ont bien été récupérées
 *      404:
 *          description: L'intervention n'a pas été trouvée
 *      422:
 *          description: Paramètre invalide
 *      500:
 *          description: Erreur lors de la récupération des photos
 * 
 */
router.get("/trajectoirePhotos/intervention/:id", droneController.getPhotosTrajectoire);

module.exports = router;
