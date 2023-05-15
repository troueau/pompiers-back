import Action from "../models/Action";
import Intervention from "../models/Intervention";
import {EventElement, EventOperation, getEventCode,} from "../realtime/realtimeEventEnum";
import {Request, Response} from "express";
import mongoose from "mongoose";

exports.ajouterAction = async function(req: Request, res: Response) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }
    if (req.body._id !== undefined) {
        const { ["_id"]: id, ...bodySansId } = req.body;
        req.body = bodySansId;
    }

    // Ajout
    Intervention.findById(_id)
        .then((intervention: any) => {
            if (!intervention) {
                return res.status(404).json({ error: "L'intervention n'existe pas" });
            } else {
                Action.create(req.body)
                    .then((action) => {
                        if (!action) {
                            return res.status(500).json({
                                error: "Erreur à la création de l'action",
                            });
                        } else {
                            intervention.actionListe.push(action._id);
                            intervention.save((err) => {
                                if (err) {
                                    return res.status(500).json({ error: err });
                                }
                            });
                            const io = require("../realtime/socketIoServer").getIO();
                            io.to(intervention._id.toString()).emit(
                                getEventCode(
                                    EventOperation.CREATED,
                                    EventElement.ACTION,
                                ),
                                action,
                            );
                            return res.status(201).json(action);
                        }
                    })
                    .catch((err) => {
                        return res.status(500).json({ error: err });
                    });
            }
        })
        .catch((err) => {
            return res.status(500).json({ error: err });
        });
};

exports.modifierAction = async function(req: Request, res: Response) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }
    if (req.body._id !== undefined) {
        const { ["_id"]: id, ...bodySansId } = req.body;
        req.body = bodySansId;
    }

    // Enregistrement
    Action.findByIdAndUpdate(_id, req.body, { new: true })
        .then((action) => {
            if (!action) {
                return res.status(404).json({ error: "Erreur création de l'action" });
            } else {
                Intervention.findOne({
                    actionListe: { $in: [_id] },
                }).then((intervention: any) => {
                    const io = require("../realtime/socketIoServer").getIO();
                    io.to(intervention._id.toString()).emit(
                        getEventCode(
                            EventOperation.MODIFIED,
                            EventElement.ACTION,
                            action._id.toString(),
                        ),
                        action,
                    );
                });
                return res.status(200).json(action);
            }
        })
        .catch((err) => {
            return res.status(500).json({ error: err });
        });
};

exports.supprimerAction = async function(req: Request, res: Response) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // Suppression
    Action.findByIdAndDelete({ _id: _id })
        .then((action: any) => {
            if (!action) {
                return res.status(404).json({ error: "L'action n'existe pas" });
            } else {
                Intervention.findOne({
                    actionListe: { $in: [_id] },
                }).then((intervention: any) => {
                    if (!intervention) {
                        return res.status(500).json({
                            error: "Pas d'intervention liée à l'action, action supprimé",
                        });
                    } else {
                        const io =
                            require("../realtime/socketIoServer").getIO();
                        io.to(intervention._id.toString()).emit(
                            getEventCode(
                                EventOperation.DELETED,
                                EventElement.ACTION,
                                action._id.toString(),
                            ),
                        );
                        intervention.actionListe =
                            intervention.actionListe.filter(
                                function (element): boolean {
                                    return element._id.valueOf() !== action._id.valueOf();
                                }
                            );
                        intervention.save((err) => {
                            if (err) {
                                return res.status(500).json({ error: err });
                            } else {
                                return res.status(200).json("Action supprimée");
                            }
                        });
                    }
                });
            }
        })
        .catch((err) => {
            return res.status(500).json({ error: err });
        });
};

exports.getAction = async function(req: Request, res: Response) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
        return;
    }

    // Recherche
    Action.findById(_id)
        .then((action) => {
            if (!action) {
                return res.status(404).json({ error: "L'action n'existe pas" });
            } else {
                return res.status(200).json(action);
            }
        })
        .catch((err) => {
            return res.status(500).json(err);
        });
};

exports.getActionsByIntervention = async function(req: Request, res: Response) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // Recherche
    Intervention.findById(_id)
        .populate("actionListe")
        .then((intervention) => {
            if (!intervention) {
                return res.status(404).json({ error: "L'intervention n'existe pas" });
            } else {
                return res.status(200).json(intervention.actionListe);
            }
        })
        .catch((err) => {
            return res.status(500).json({
                message: "Erreur lors de la récupération des actions de l'intervention",
                erreur: err,
            });
        });
};
