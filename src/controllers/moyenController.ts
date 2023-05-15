import Moyen from "../models/Moyen";
import Intervention from "../models/Intervention";
import {EventElement, EventOperation, getEventCode,} from "../realtime/realtimeEventEnum";
import mongoose, {isValidObjectId} from "mongoose";
import {StatutMoyenEnum} from "../models/Enumerations";

import moment from "moment-timezone";

const pipeline = [
    {
        $lookup: {
            from: "interventions",
            localField: "_id",
            foreignField: "moyenListe",
            as: "intervention",
        },
    },
];

exports.ajouterMoyen = async function (req: any, res: any) {
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
                calculHeure(false, req.body);

                Moyen.create(req.body)
                    .then((moyen) => {
                        if (!moyen) {
                            return res.status(500).json({
                                error: "Erreur à la création du moyen",
                            });
                        } else {
                            intervention.moyenListe.push(moyen._id);
                            intervention.save((err) => {
                                if (err) {
                                    return res.status(500).json({ error: err });
                                }
                            });
                            const io =
                                require("../realtime/socketIoServer").getIO();
                            io.to(intervention._id.toString()).emit(
                                getEventCode(
                                    EventOperation.CREATED,
                                    EventElement.MOYEN,
                                ),
                                moyen,
                            );
                            return res.status(201).json(moyen);
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

exports.modifierMoyen = async function (req: any, res: any) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }
    if (req.body._id !== undefined) {
        const { ["_id"]: id, ...bodySansId } = req.body;
        req.body = bodySansId;
    }
    calculHeure(true, req.body);
    // Enregistrement
    Moyen.findByIdAndUpdate(_id, req.body, { new: true })
        .then((moyen) => {
            if (!moyen) {
                return res.status(404).json({ error: "Erreur création du moyen" });
            } else {
                Intervention.findOne({
                    moyenListe: { $in: [_id] },
                }).then((intervention: any) => {
                    const io = require("../realtime/socketIoServer").getIO();
                    io.to(intervention._id.toString()).emit(
                        getEventCode(
                            EventOperation.MODIFIED,
                            EventElement.MOYEN,
                            moyen._id.toString(),
                        ),
                        moyen,
                    );
                });
                return res.status(200).json(moyen);
            }
        })
        .catch((err) => {
            return res.status(500).json({ error: err });
        });
};

exports.supprimerMoyen = async function (req: any, res: any) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // Suppression
    Moyen.findByIdAndDelete({ _id: _id })
        .then((moyen) => {
            if (!moyen) {
                return res.status(404).json({ error: "Le moyen n'existe pas" });
            } else {
                Intervention.findOne({
                    moyenListe: { $in: [_id] },
                }).then((intervention: any) => {
                    if (!intervention) {
                        return res.status(500).json({
                            error: "Pas d'intervention liée au moyen, moyen supprimé",
                        });
                    } else {
                        const io =
                            require("../realtime/socketIoServer").getIO();
                        io.to(intervention._id.toString()).emit(
                            getEventCode(
                                EventOperation.DELETED,
                                EventElement.MOYEN,
                                moyen._id.toString(),
                            ),
                        );
                        intervention.moyenListe = intervention.moyenListe.filter(
                            function (element):boolean {
                                return element._id.valueOf() !== moyen._id.valueOf();
                            }
                        );
                        intervention.save((err: any) => {
                            if (err) {
                                return res.status(500).json({ error: err });
                            } else {
                                return res.status(200).json({
                                    message: "Moyen supprimé",
                                });
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

exports.getMoyen = async function (req: any, res: any) {
    const _id = req.params.id;
    // Validation
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // Recherche
    Moyen.findById(_id)
        .then((moyen) => {
            if (!moyen) {
                return res.status(404).json({ error: "Le moyen n'existe pas" });
            } else {
                return res.status(200).json(moyen);
            }
        })
        .catch((err) => {
            return res.status(500).json(err);
        });
};

exports.getMoyens = async function (req: any, res: any) {
    let filter: any = getFilterMoyen(req.query);
    let pipe = req.query.intervention?.toLowerCase() === "true" ? pipeline : [];
    Moyen.aggregate(pipe)
        .match(filter)
        .then((moyens) => {
            if (!moyens) {
                return res.status(404).json({ error: "Aucun moyen trouvé" });
            } else {
                return res.status(200).json(moyens);
            }
        })
        .catch((err) => {
            return res.status(500).json(err);
        });
};

exports.getMoyensByInterventions = async function (req: any, res: any) {
    let id = req.params.id;
    // Validation de l'id
    if (!isValidObjectId(id)) {
        return res.status(422).send("Invalid id");
    }

    Intervention.findById(id)
        .then((intervention: any) => {
            if (!intervention) {
                return res.status(404).json({ error: "L'intervention n'existe pas" });
            } else {
                intervention.populate(
                    {
                        path: "moyenListe",
                        match: getFilterMoyen(req.query),
                    },
                    function (err: any, intervention: any) {
                        if (err) {
                            return res.status(500).json({ error: err });
                        } else {
                            return res.status(200).json(intervention.moyenListe);
                        }
                    },
                );
            }
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
};

function getFilterMoyen(query) {
    let filter: any = {};
    if (query.statut) {
        filter.statut = query.statut?.toUpperCase();
    }
    if (query.categorieMoyen) {
        filter.categorieMoyen = query.categorieMoyen?.toUpperCase();
    }
    if (query.typeVehicule) {
        filter.typeVehicule = query.typeVehicule?.toUpperCase();
    }
    if (query.categorieComposante) {
        filter.categorieComposante = query.categorieComposante?.toUpperCase();
    }
    return filter;
}

function calculHeure(isUpdated, moyen) {
    const currentDate = new Date(Date.now());

    if (moyen.heuDemande?.length != 4 && moyen.statut == StatutMoyenEnum.DEMANDE) {
        moyen.heureDemande = toHeureMilitaire(currentDate);
    } else if (moyen.heureDemande?.length != 4  && !isUpdated && moyen.statut == StatutMoyenEnum.DISPONIBLE) {
        moyen.heureDemande = toHeureMilitaire(currentDate);
    } else if (moyen.statut == StatutMoyenEnum.DISPONIBLE && moyen.position) {
        moyen.statut = StatutMoyenEnum.PREVU;
    }

    if (moyen.heurePrevu?.length != 4  && moyen.statut == StatutMoyenEnum.PREVU) {
        const delayedDate = new Date(Date.now() + 10 * 60000);
        moyen.heurePrevu = toHeureMilitaire(delayedDate);
    } else if (moyen.heureAuCRM?.length != 4 && moyen.statut == StatutMoyenEnum.ARRIVE) {
        moyen.heureAuCRM = toHeureMilitaire(currentDate);
    } else if (moyen.heureEngage?.length != 4 && moyen.statut == StatutMoyenEnum.ACTIF) {
        moyen.heureEngage = toHeureMilitaire(currentDate);
    } else if (moyen.heureRetourDisponible?.length != 4 && moyen.statut == StatutMoyenEnum.RETOUR) {
        moyen.heureRetourDisponible = toHeureMilitaire(currentDate);
    }
}

function toHeureMilitaire(date) {
    return moment(date).tz("Europe/Paris").format("HHmm");
}


exports.calculHeure = calculHeure;