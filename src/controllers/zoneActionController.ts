import ZoneAction from "../models/ZoneAction";
import Intervention from "../models/Intervention";
import {EventElement, EventOperation, getEventCode,} from "../realtime/realtimeEventEnum";
import mongoose from "mongoose";

exports.ajouterZoneAction = async function(req: any, res: any) {
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
                ZoneAction.create(req.body)
                    .then((zoneAction: any) => {
                        if (!zoneAction) {
                            return res.status(500).json({
                                error: "Erreur à la création du zoneAction",
                            });
                        } else {
                            intervention.zoneActionListe.push(zoneAction._id);
                            intervention.save((err) => {
                                if (err) {
                                    return res.status(500).json({ error: err });
                                }
                            });
                            const io = require("../realtime/socketIoServer").getIO();
                            io.to(intervention._id.toString()).emit(
                                getEventCode(
                                    EventOperation.CREATED,
                                    EventElement.ZONE_ACTION,
                                ),
                                zoneAction,
                            );
                            return res.status(201).json(zoneAction);
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

exports.modifierZoneAction = async function(req: any, res: any) {
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
    ZoneAction.findByIdAndUpdate(_id, req.body, { new: true })
        .then((zoneAction) => {
            if (!zoneAction) {
                return res.status(404).json({
                    error: "Erreur création du zoneAction",
                });
            } else {
                Intervention.findOne({
                    zoneActionListe: { $in: [_id] },
                }).then((intervention: any) => {
                    const io = require("../realtime/socketIoServer").getIO();
                    io.to(intervention._id.toString()).emit(
                        getEventCode(
                            EventOperation.MODIFIED,
                            EventElement.ZONE_ACTION,
                            zoneAction._id.toString(),
                        ),
                        zoneAction,
                    );
                });
                return res.status(200).json(zoneAction);
            }
        })
        .catch((err) => {
            return res.status(500).json({ error: err });
        });
};

exports.supprimerZoneAction = async function(req: any, res: any) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // Suppression
    ZoneAction.findByIdAndDelete({ _id: _id })
        .then((zoneAction) => {
            if (!zoneAction) {
                return res.status(404).json({ error: "La zoneAction n'existe pas" });
            } else {
                Intervention.findOne({
                    zoneActionListe: { $in: [_id] },
                }).then((intervention: any) => {
                    if (!intervention) {
                        return res.status(500).json({
                            error: "Pas d'intervention liée au zoneAction, zoneAction supprimé",
                        });
                    } else {
                        const io = require("../realtime/socketIoServer").getIO();
                        io.to(intervention._id.toString()).emit(
                            getEventCode(
                                EventOperation.DELETED,
                                EventElement.ZONE_ACTION,
                                zoneAction._id.toString(),
                            ),
                        );
                        intervention.zoneActionListe =
                            intervention.zoneActionListe.filter(
                                function (element):boolean {
                                    return element._id.valueOf() !== zoneAction._id.valueOf();
                                }
                            );
                        intervention.save((err) => {
                            if (err) {
                                return res.status(500).json({ error: err });
                            } else {
                                return res.status(200).json("ZoneAction supprimé");
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

exports.getZoneAction = async function(req: any, res: any) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // Recherche
    ZoneAction.findById(_id)
        .then((zoneAction) => {
            if (!zoneAction) {
                return res.status(404).json({ error: "La zoneAction n'existe pas" });
            } else {
                return res.status(200).json(zoneAction);
            }
        })
        .catch((err) => {
            return res.status(500).json(err);
        });
};
