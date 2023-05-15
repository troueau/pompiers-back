import PointAttention from "../models/PointAttention";
import Intervention from "../models/Intervention";
import {
    EventElement,
    EventOperation,
    getEventCode,
} from "../realtime/realtimeEventEnum";
import mongoose from "mongoose";

exports.ajouterPointAttention = async function (req: any, res: any) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        res.status(422).json({ error: "Paramètre id invalide" });
        return;
    }

    // suppression de l'id du body s'il existe
    if (req.body._id !== undefined) {
        const { ["_id"]: id, ...bodySansId } = req.body;
        req.body = bodySansId;
    }

    // Ajout
    Intervention.findById(_id)
        .then((intervention: any) => {
            if (!intervention) {
                res.status(404).json({ error: "L'intervention n'existe pas" });
            } else {
                PointAttention.create(req.body)
                    .then((pointAttention) => {
                        if (!pointAttention) {
                            res.status(500).json({
                                error: "Erreur à la création du pointAttention",
                            });
                        } else {
                            intervention.pointAttentionListe.push(
                                pointAttention._id,
                            );
                            intervention.save((err) => {
                                if (err) {
                                    res.status(500).json({ error: err });
                                }
                            });
                            const io =
                                require("../realtime/socketIoServer").getIO();
                            io.to(intervention._id.toString()).emit(
                                getEventCode(
                                    EventOperation.CREATED,
                                    EventElement.POINT_ATTENTION,
                                ),
                                pointAttention,
                            );
                            res.status(201).json(pointAttention);
                        }
                    })
                    .catch((err) => {
                        res.status(500).json({ error: err });
                    });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
};

exports.modifierPointAttention = async function (req: any, res: any) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        res.status(422).json({ error: "Paramètre id invalide" });
        return;
    }
    if (req.body._id !== undefined) {
        const { ["_id"]: id, ...bodySansId } = req.body;
        req.body = bodySansId;
    }

    // Enregistrement
    PointAttention.findByIdAndUpdate(_id, req.body, { new: true })
        .then((pointAttention) => {
            if (!pointAttention) {
                res.status(404).json({
                    error: "Erreur création du pointAttention",
                });
            } else {
                Intervention.findOne({
                    pointAttentionListe: { $in: [_id] },
                }).then((intervention: any) => {
                    const io = require("../realtime/socketIoServer").getIO();
                    io.to(intervention._id.toString()).emit(
                        getEventCode(
                            EventOperation.MODIFIED,
                            EventElement.POINT_ATTENTION,
                            pointAttention._id.toString(),
                        ),
                        pointAttention,
                    );
                });
                res.status(200).json(pointAttention);
            }
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
};

exports.supprimerPointAttention = async function (req: any, res: any) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // Suppression
    PointAttention.findByIdAndDelete({ _id: _id })
        .then((pointAttention) => {
            if (!pointAttention) {
                return res.status(404).json({
                    error: "Le pointAttention n'existe pas",
                });
            } else {
                Intervention.findOne({
                    pointAttentionListe: { $in: [_id] },
                }).then((intervention: any) => {
                    if (!intervention) {
                        return res.status(500).json({
                            error: "Pas d'intervention liée au pointAttention, pointAttention supprimé",
                        });
                    } else {
                        const io =
                            require("../realtime/socketIoServer").getIO();
                        io.to(intervention._id.toString()).emit(
                            getEventCode(
                                EventOperation.DELETED,
                                EventElement.POINT_ATTENTION,
                                pointAttention._id.toString(),
                            ),
                        );
                        intervention.pointAttentionListe =
                            intervention.pointAttentionListe.filter(function (
                                element,
                            ): boolean {
                                return (
                                    element._id.valueOf() !==
                                    pointAttention._id.valueOf()
                                );
                            });
                        intervention.save((err) => {
                            if (err) {
                                return res.status(500).json({ error: err });
                            } else {
                                return res.status(200).json("PointAttention supprimé");
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

exports.getPointAttention = async function (req: any, res: any) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // Recherche
    PointAttention.findById(_id)
        .then((pointAttention) => {
            if (!pointAttention) {
                return res.status(404).json({
                    error: "Le pointAttention n'existe pas",
                });
            } else {
                return res.status(200).json(pointAttention);
            }
        })
        .catch((err) => {
            return res.status(500).json(err);
        });
};
