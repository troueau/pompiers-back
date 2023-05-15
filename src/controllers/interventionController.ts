import Intervention from "../models/Intervention";
import Moyen from "../models/Moyen";
import PointAttention from "../models/PointAttention";
import ZoneAction from "../models/ZoneAction";
import Action from "../models/Action";
import { ObjectId, isValidObjectId } from "mongoose";
const MoyenController = require("./moyenController");
import { exec } from "node:child_process";
import {
    EventElement,
    EventOperation,
    getEventCode,
} from "../realtime/realtimeEventEnum";
import {
    StatutInterventionEnum,
    StatutMoyenEnum,
} from "../models/Enumerations";
import moment from "moment-timezone";

exports.getInterventions = function (req: any, res: any) {
    Intervention.find({}, function (err: any, intervention: any) {
        if (err) {
            return res.status(500).json({ error: err });
        }
        return res.status(200).json(intervention);
    });
};

exports.getIntervention = function (req: any, res: any) {
    let id = req.params.id;
    // Validation de l'id
    if (!isValidObjectId(id)) {
        return res.status(422).send("Invalid id");
    }

    Intervention.findById(id)
        .then((intervention: any) => {
            if (!intervention) {
                res.status(404).json({ error: "L'intervention n'existe pas" });
            } else {
                intervention.populate(
                    [
                        "pointAttentionListe",
                        "moyenListe",
                        "zoneActionListe",
                        "actionListe",
                    ],
                    function (err: any, intervention: any) {
                        if (err) {
                            res.status(500).json({ error: err });
                        } else {
                            res.status(200).json(intervention);
                        }
                    },
                );
            }
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
};

exports.createIntervention = async function (req: any, res: any) {
    try {
        deleteId(req);
        req.body.moyenListe?.forEach((moyen: any) => {
            MoyenController.calculHeure(false, moyen);
        });
        // On insert des moyens s'il y en a
        if (req.body.moyenListe != undefined) {
            const moyenListe = await Moyen.insertMany(req.body.moyenListe);
            req.body.moyenListe = moyenListe.map((moyen: any) => moyen._id);
        }

        // On insert des point d'attention s'il y en a
        if (req.body.pointAttentionListe != undefined) {
            const pointAttentionListe = await PointAttention.insertMany(
                req.body.pointAttentionListe,
            );
            req.body.pointAttentionListe = pointAttentionListe.map(
                (pointAttention: any) => pointAttention._id,
            );
        }

        // On insert des zoneActions s'il y en a
        if (req.body.zoneActionListe != undefined) {
            const zoneActionListe = await ZoneAction.insertMany(
                req.body.zoneActionListe,
            );
            req.body.zoneActionListe = zoneActionListe.map(
                (zoneAction: any) => zoneAction._id,
            );
        }

        // On insert des actions s'il y en a
        if (req.body.actionListe != undefined) {
            const actionListe = await Action.insertMany(req.body.actionListe);
            req.body.actionListe = actionListe.map((action: any) => action._id);
        }

        // On insert l'intervention
        const intervention = await Intervention.create(req.body);
        const io = require("../realtime/socketIoServer").getIO();
        io.emit(
            getEventCode(EventOperation.CREATED, EventElement.INTERVENTION),
            intervention,
        );
        return res.status(201).json(intervention);
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};

exports.supprimerIntervention = async function (req: any, res: any) {
    let id = req.params.id;
    // Validation de l'id
    if (!isValidObjectId(id)) {
        return res.status(422).send("Invalid id");
    }

    Intervention.findByIdAndDelete(id)
        .then((intervention) => {
            if (!intervention) {
                return res.status(404).json({ error: "L'intervention n'existe pas" });
            } else {
                const io = require("../realtime/socketIoServer").getIO();
                io.emit(
                    getEventCode(
                        EventOperation.DELETED,
                        EventElement.INTERVENTION,
                        intervention._id.toString(),
                    ),
                );

                // On supprime les moyens liés à l'intervention
                Moyen.deleteMany({ _id: { $in: intervention.moyenListe } });

                // On supprime les point d'attention liés à l'intervention
                PointAttention.deleteMany({
                    _id: { $in: intervention.pointAttentionListe },
                });

                // On supprime les zoneActions liés à l'intervention
                ZoneAction.deleteMany({
                    _id: { $in: intervention.zoneActionListe },
                });

                // On supprime les actions liés à l'intervention
                Action.deleteMany({ _id: { $in: intervention.actionListe } });

                // On supprime le dossier avec les photos de l'intervention
                deleteInterventionDirectory(id);

                return res.status(200).json(intervention);

            }
        })
        .catch((err) => {
            return res.status(500).json({ error: err });
        });
};

async function deleteInterventionDirectory(idIntervention: string) {
    exec("rm -rf ./photos/" + idIntervention, { shell: "/bin/sh" },
        function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Dossier " + idIntervention + " supprimé.");
        },
    );
}

exports.updateIntervention = (req, res) => {
    let id = req.params.id;
    // Validation de l'id
    if (!isValidObjectId(id)) {
        return res.status(422).send("Invalid id");
    }

    // suppression de l'id du body s'il existe
    if (req.body._id !== undefined) {
        const { ["_id"]: id, ...bodySansId } = req.body;
        req.body = bodySansId;
    }

    const updatedIntervention = req.body;

    // Recherche de l'intervention à mettre à jour
    Intervention.findById(id)
        .exec()
        .then((intervention) => {
            if (!intervention) {
                return res
                    .status(404)
                    .json({ error: "Intervention non trouvée" });
            }

            // On liste les moyens à supprimer
            let moyenASupprimer = intervention.moyenListe.filter(
                (x) => !updatedIntervention.moyenListe.includes(x.valueOf()),
            );
            let pointAtttentionASupprimer =
                intervention.pointAttentionListe.filter(
                    (x) =>
                        !updatedIntervention.pointAttentionListe.includes(
                            x.valueOf(),
                        ),
                );
            let zoneActionListe = intervention.zoneActionListe.filter(
                (x) =>
                    !updatedIntervention.zoneActionListe.includes(x.valueOf()),
            );
            let actionASupprimer = intervention.actionListe.filter(
                (x) => !updatedIntervention.actionListe.includes(x.valueOf()),
            );

            Promise.all([
                Moyen.deleteMany({ _id: { $in: moyenASupprimer } }),
                PointAttention.deleteMany({
                    _id: { $in: pointAtttentionASupprimer },
                }),
                ZoneAction.deleteMany({ _id: { $in: zoneActionListe } }),
                Action.deleteMany({ _id: { $in: actionASupprimer } }),
                Intervention.findByIdAndUpdate(id, updatedIntervention, {
                    new: true,
                    returnDocument: "after",
                    runValidators: true,
                }),
            ])
                .then((results) => {
                    const io = require("../realtime/socketIoServer").getIO();
                    io.emit(
                        getEventCode(
                            EventOperation.MODIFIED,
                            EventElement.INTERVENTION,
                            results[4]._id.toString(),
                        ),
                        results[4],
                    );

                    if (results[4].statut == StatutInterventionEnum.TERMINEE) {
                        closeIntervention(results[4], res);
                    }

                    // On renvoi le résultat de la mise à jour. 4e élément du tableau car c'est le 4e appel de le tabelau d'appel des promesses
                    return res.status(200).json(results[4]);
                })
                .catch((err) => {
                    return res.status(500).json({ error: err });
                });
        })
        .catch((err) => res.status(500).json({ error: err }));
};

function deleteId(req: any): void {
    // suppression de l'id du body s'il existe
    if (req.body._id !== undefined) {
        const { ["_id"]: id, ...bodySansId } = req.body;
        req.body = bodySansId;
    }

    // suppression des id imbriqués
    if (req.body.moyenListe != undefined) {
        req.body.moyenListe.forEach((element: any) => {
            element._id = undefined;
        });
    }
    if (req.body.pointAttentionListe != undefined) {
        req.body.pointAttentionListe.forEach((element: any) => {
            element._id = undefined;
        });
    }
    if (req.body.zoneActionListe != undefined) {
        req.body.zoneActionListe.forEach((element: any) => {
            element._id = undefined;
        });
    }
    if (req.body.actionListe != undefined) {
        req.body.actionListe.forEach((element: any) => {
            element._id = undefined;
        });
    }
}

function verificationSousEnsemble(
    intervention: any,
    updatedIntervention: any,
): string {
    let error: string = "";

    const interventionmoyenListe = intervention.moyenListe?.map((x: ObjectId) =>
        x.valueOf(),
    );
    const interventionPointAttentionListe =
        intervention.pointAttentionListe?.map((x: ObjectId) => x.valueOf());
    const interventionZoneActionListe = intervention.zoneActionListe?.map(
        (x: ObjectId) => x.valueOf(),
    );
    const interventionActionListe = intervention.actionListe?.map(
        (x: ObjectId) => x.valueOf(),
    );

    const sousEnsemblemoyenListe = updatedIntervention.moyenListe?.every(
        (val: string[]) => interventionmoyenListe?.includes(val),
    );
    const sousEnsemblepointAttentionListe =
        updatedIntervention.pointAttentionListe?.every((val: string[]) =>
            interventionPointAttentionListe?.includes(val),
        );
    const sousEnsemblezoneActionListe =
        updatedIntervention.zoneActionListe?.every((val: string[]) =>
            interventionZoneActionListe?.includes(val),
        );
    const sousEnsembleactionListe = updatedIntervention.actionListe?.every(
        (val: string[]) => interventionActionListe?.includes(val),
    );

    if (
        !sousEnsemblemoyenListe ||
        !sousEnsemblepointAttentionListe ||
        !sousEnsemblezoneActionListe ||
        !sousEnsembleactionListe
    ) {
        // On crée le message d'erreur si les listes ne sont pas des sous-ensembles
        error =
            "Les liste suivantes ne sont pas des sous-ensembles des éléments originaux : ";
        if (!sousEnsemblemoyenListe) {
            error += "moyenListe ";
        }
        if (!sousEnsemblepointAttentionListe) {
            error += "pointAttentionListe ";
        }
        if (!sousEnsemblezoneActionListe) {
            error += "zoneActionListe ";
        }
        if (!sousEnsembleactionListe) {
            error += "actionListe ";
        }
    }
    return error;
}

function closeIntervention(intervention: any, res: any) {
    const currentDate = new Date(Date.now());

    intervention.moyenListe.forEach((moyen: any) => {
        Moyen.findByIdAndUpdate(moyen._id, {
            statut: StatutMoyenEnum.RETOUR,
            heureRetourDisponible: moment().tz("Europe/Paris").format("HHmm"),
        })
            .then((moyen) => {
                const io = require("../realtime/socketIoServer").getIO();
                io.to(intervention._id.toString()).emit(
                    getEventCode(
                        EventOperation.MODIFIED,
                        EventElement.MOYEN,
                        moyen._id.toString(),
                    ),
                    moyen,
                );
            })
            .catch((err) => {
                return res.status(500).json({ error: err });
            });
    });
}
