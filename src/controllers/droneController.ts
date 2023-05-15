import axios from "axios";
import Intervention from "../models/Intervention";
import Trajectoire from "../models/Trajectoire";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { exec } from "node:child_process";
import { getMatchingPositionIndex } from "../utils/approx";
import fs from "fs";
import path from "path";
import {EventElement, EventOperation, getEventCode} from "../realtime/realtimeEventEnum";

const API_DRONE_URL = "http://148.60.11.229/";

const IMAGES_DIR = "../../photos/";

interface datas {
    longitude: number;
    latitude: number;
    relative_altitude: number;
}

exports.postTrajectoire = async function (req: Request, res: Response) {
    let points: any[] = req.body.points; // points de la trajectoire

    const _id = req.params.id;
    // Validation de l'id de l'intervention
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // on vérifie que plus qu'un point est présent
    if (points.length < 2) {
        return res.status(400).json({
            message: "Le nombre de points doit être supérieur ou égal à 2",
        });
    }

    // suppression de l'id dans le body (au cas ou)
    if (req.body._id !== undefined) {
        const { ["_id"]: id, ...bodySansId } = req.body;
        req.body = bodySansId;
    }

    let endpoint: String;
    let type: String = req.body.type; // type de trajectoire
    switch (
        type // on détermine l'endpoint à appeler en fonction du type de trajectoire
    ) {
        case "RONDE":
            endpoint = "followLoop";
            break;
        case "ALLER_RETOUR":
            endpoint = "followSegment";
            break;
        case "BALAYAGE":
            endpoint = "areaCoverage";
            break;
        default:
            return res
                .status(400)
                .json({ message: "Type de trajectoire inconnu" });
    }

    let repDatas: datas[] = [];
    // on transforme les points recus en structure datas qui va pouvoir être envoyée au drone
    for (let i = 0; i < points.length; i++) {
        repDatas.push({
            longitude: points[i].longitude,
            latitude: points[i].latitude,
            relative_altitude: 4.2,
        });
    }

    // on enregistre la trajectoire de l'intervention dans la base de données
    Intervention.findById(_id)
        .then((intervention) => {
            if (!intervention) {
                return res
                    .status(404)
                    .json({ error: "L'intervention n'existe pas" });
            } else {
                Trajectoire.create(req.body)
                    .then(async (trajectoire) => {
                        if (!trajectoire) {
                            return res.status(500).json({
                                error: "Erreur à la création de la trajectoire",
                            });
                        } else {
                            // on lie la trajectoire à l'intervention
                            intervention.trajectoire = trajectoire._id;
                            intervention.save((err) => {
                                // on sauvegarde l'intervention
                                if (err) {
                                    res.status(500).json({ error: err });
                                }
                            });
                            console.log(
                                "Trajectoire créée à l'intervention " + _id,
                            );

                            // on se connecte au drone et on attend la réponse
                            let reponseConnect = await connect();
                            if (reponseConnect != undefined) {
                                // si la réponse n'est pas undefined, c'est qu'il y a eu une erreur
                                return res.status(500).json({
                                    message:
                                        "Erreur lors de la connexion au drone",
                                    error: reponseConnect,
                                });
                            }

                            // on vérifie que le drone est bien dans les air avant d'envoyer la trajectoire
                            let reponseIsTakeOff: any;
                            try {
                                reponseIsTakeOff = await axios.get(
                                    API_DRONE_URL + "isTakeOff",
                                );
                            } catch (err) {
                                return res.status(500).json({
                                    message:
                                        "Erreur lors de la récupération du status du drone",
                                    error: err,
                                });
                            }

                            // parse de la réponse en objet puis en string pour pouvoir accéder à la valeur de isTakeOff
                            const dataToString = JSON.stringify(
                                reponseIsTakeOff.data,
                            );
                            const dataToObj = JSON.parse(dataToString);
                            const droneDansLesAirs = dataToObj.data.isTakeOff;
                            if (!droneDansLesAirs) {
                                let reponseTakeOff = await takeOff();
                                if (reponseTakeOff != undefined) {
                                    // si la réponse n'est pas undefined, c'est qu'il y a eu une erreur
                                    return res.status(500).json({
                                        message:
                                            "Erreur lors du décollage du drone",
                                        error: reponseTakeOff,
                                    });
                                }
                            }

                            // on envoie la trajectoire au drone
                            let reponseTraj: any;
                            try {
                                reponseTraj = await axios.post(
                                    API_DRONE_URL + endpoint,
                                    {
                                        datas: repDatas, // on envoie les datas au drone
                                    },
                                );
                            } catch (error) {
                                return res.status(500).json({
                                    message:
                                        "Erreur lors de l'envoi de la trajectoire au drone",
                                    error: error,
                                });
                            }
                            // Envoi de l'event de creation de trajectoire aux clients
                            const io = require("../realtime/socketIoServer").getIO();
                            io.to(intervention._id.toString()).emit(
                                getEventCode(
                                    EventOperation.CREATED,
                                    EventElement.TRAJECTOIRE,
                                ),
                                trajectoire,
                            );

                            return res.status(201).json({
                                message:
                                    "Trajectoire créée et envoyée au drone",
                                trajectoire: trajectoire,
                                response: reponseTraj.data,
                            });
                        }
                    })
                    .catch((err) => {
                        return res.status(500).json({ error: err });
                    });
            }
        })
        .catch((error) => {
            return res.status(500).json({
                message: "Erreur lors de l'enregistrement de la trajectoire",
                error: error,
            });
        });
};

exports.getPhotosTrajectoire = async function (req: Request, res: Response) {
    const _id = req.params.id;
    // Validation de l'id passé en paramètre
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // on récupère l'intervention
    Intervention.findById(_id)
        .then((intervention) => {
            if (!intervention) {
                return res
                    .status(404)
                    .json({ error: "L'intervention n'existe pas" });
            }

            // on se met dans le répertoire des images de l'intervention
            const directoryPath = path.join(__dirname, IMAGES_DIR, _id);
            fs.readdir(directoryPath, function (err, files) {
                if (err) {
                    return res
                        .status(500)
                        .json({
                            error: "Erreur lors de la lecture du repertoire",
                        });
                }

                // on crée les urls des images et on les envoie
                const urls = files.map((file) => {
                    return `${req.protocol}://${req.get(
                        "host",
                    )}/photos/${_id}/${file}`;
                });

                return res.status(200).json({ urls: urls });
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: "Erreur lors de la récupération de l'intervention",
                error: error,
            });
        });
};

exports.postPhotosTrajectoire = async function (req: Request, res: Response) {
    let points: any[] = req.body.points; // points de la trajectoire
    const typeTraj: string = req.body.type; // type de trajectoire

    // on verifie que le type de trajectoire est le bon
    if (typeTraj !== "PHOTO") {
        return res.status(400).json({
            message: "Le type de trajectoire doit être PHOTO",
        });
    }

    const _id = req.params.id;
    // Validation de l'id de l'intervention
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // suppression de l'id dans le body (au cas ou)
    if (req.body._id != undefined) {
        const { ["_id"]: id, ...bodySansId } = req.body;
        req.body = bodySansId;
    }

    let repDatas: datas[] = [];
    // on transforme les points recus en structure datas qui va pouvoir être envoyée au drone
    for (let i = 0; i < points.length; i++) {
        repDatas.push({
            longitude: points[i].longitude,
            latitude: points[i].latitude,
            relative_altitude: 4.2,
        });
    }

    // on enregistre la trajectoire de l'intervention dans la base de données
    Intervention.findById(_id)
        .then((intervention) => {
            if (!intervention) {
                return res
                    .status(404)
                    .json({ error: "L'intervention n'existe pas" });
            } else {
                Trajectoire.create(req.body)
                    .then(async (trajectoire) => {
                        if (!trajectoire) {
                            return res.status(500).json({
                                error: "Erreur à la création de la trajectoire",
                            });
                        } else {
                            // on lie la trajectoire à l'intervention
                            intervention.trajectoire = trajectoire._id;
                            intervention.save((err) => {
                                // on sauvegarde l'intervention
                                if (err) {
                                    res.status(500).json({ error: err });
                                }
                            });
                            console.log(
                                "Trajectoire créée à l'intervention " + _id,
                            );

                            // on se connecte au drone et on attend la réponse
                            let reponseConnect = await connect();
                            if (reponseConnect != undefined) {
                                // si la réponse n'est pas undefined, c'est qu'il y a eu une erreur
                                return res.status(500).json({
                                    message:
                                        "Erreur lors de la connexion au drone",
                                    error: reponseConnect,
                                });
                            }

                            // on vérifie que le drone est bien dans les air avant d'envoyer la trajectoire
                            let reponseIsTakeOff: any;
                            try {
                                reponseIsTakeOff = await axios.get(
                                    API_DRONE_URL + "isTakeOff",
                                );
                            } catch (err) {
                                return res.status(500).json({
                                    message:
                                        "Erreur lors de la récupération du status du drone",
                                    error: err,
                                });
                            }

                            // parse de la réponse en objet puis en string pour pouvoir accéder à la valeur de isTakeOff
                            const dataToString = JSON.stringify(
                                reponseIsTakeOff.data,
                            );
                            const dataToObj = JSON.parse(dataToString);
                            const droneDansLesAirs = dataToObj.data.isTakeOff;
                            if (!droneDansLesAirs) {
                                let reponseTakeOff = await takeOff();
                                if (reponseTakeOff != undefined) {
                                    // si la réponse n'est pas undefined, c'est qu'il y a eu une erreur
                                    return res.status(500).json({
                                        message:
                                            "Erreur lors du décollage du drone",
                                        error: reponseTakeOff,
                                    });
                                }
                            }

                            // on envoie la trajectoire au drone
                            let reponseTraj: any;
                            try {
                                reponseTraj = await axios.post(
                                    API_DRONE_URL + "followPath",
                                    {
                                        datas: repDatas, // on envoie les datas au drone
                                    },
                                );
                            } catch (error) {
                                return res.status(500).json({
                                    message:
                                        "Erreur lors de l'envoi de la trajectoire au drone",
                                    error: error,
                                });
                            }

                            // on lance la récupération de la position du drone en temps reel et on prend des photos pour chaque points
                            try {
                                realtime_location_and_photos(repDatas, _id);
                            } catch (error) {
                                console.log("Erreur lors de la prise de photos, rabbitmq :", error);
                            }
                            
                            res.status(201).json({
                                message:
                                    "Trajectoire créée et envoyée au drone, en attente des photos ...",
                                trajectoire: trajectoire,
                                response: reponseTraj.data,
                            });
                        }
                    })
                    .catch((err) => {
                        return res.status(500).json({ error: err });
                    });
            }
        })
        .catch((error) => {
            return res.status(500).json({
                message: "Erreur lors de l'enregistrement de la trajectoire",
                error: error,
            });
        });
};

exports.getTrajectoire = async function (req: Request, res: Response) {
    const _id = req.params.id;
    // Validation de l'id passé en paramètre
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // on récupère l'intervention
    Intervention.findById(_id)
        .populate("trajectoire")
        .then((intervention) => {
            if (!intervention) {
                return res
                    .status(404)
                    .json({ error: "L'intervention n'existe pas" });
            } else {
                if (!intervention.trajectoire) {
                    return res
                        .status(404)
                        .json({ error: "La trajectoire n'existe pas" });
                }
                return res.status(200).json(intervention.trajectoire);
            }
        })
        .catch((error) => {
            return res.status(500).json({
                message: "Erreur lors de la récupération de l'intervention",
                error: error,
            });
        });
};

exports.deleteTrajectoire = async function (req: Request, res: Response) {
    const _id = req.params.id;
    // Validation de l'id passé en paramètre
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // on recupère l'intervention et on supprime la trajectoire
    Intervention.findById(_id)
        .then((intervention) => {
            if (!intervention) {
                return res
                    .status(404)
                    .json({ error: "L'intervention n'existe pas" });
            } else {
                Trajectoire.findByIdAndDelete(intervention.trajectoire)
                    .then((trajectoire) => {
                        if (!trajectoire) {
                            return res
                                .status(404)
                                .json({ error: "La trajectoire n'existe pas" });
                        }
                        intervention.trajectoire = undefined;
                        intervention.save(async (err) => {
                            if (err) {
                                res.status(500).json({ error: err });
                            } else {
                                console.log(
                                    "Trajectoire " +
                                        trajectoire.id +
                                        " supprimée",
                                );

                                // on fait revenir le drone à la base
                                let reponse: any;
                                try {
                                    reponse = await axios.post(
                                        API_DRONE_URL + "gotoBase",
                                        {},
                                    );
                                } catch (error) {
                                    return res.status(500).json({
                                        message:
                                            "Erreur lors de l'envoi du gotoBase au drone",
                                        error: error,
                                    });
                                }
                                // Envoi de l'event de suppression de trajectoire aux clients
                                const io =
                                    require("../realtime/socketIoServer").getIO();
                                io.to(intervention._id.toString()).emit(
                                    getEventCode(
                                        EventOperation.DELETED,
                                        EventElement.TRAJECTOIRE,
                                        trajectoire._id.toString(),
                                    ),
                                    trajectoire,
                                );

                                // envoie de la réponse finale
                                return res.status(200).json({
                                    message:
                                        "Trajectoire supprimée et drone à la base",
                                    trajectoire: trajectoire.id,
                                    response: reponse.data,
                                });
                            }
                        });
                    })
                    .catch((error) => {
                        return res.status(500).json({
                            message:
                                "Erreur lors de la suppression de la trajectoire",
                            error: error,
                        });
                    });
            }
        })
        .catch((error) => {
            return res.status(500).json({
                message: "Erreur lors de la récupération de l'intervention",
                error: error,
            });
        });
};

exports.gotoBase = async function (req: Request, res: Response) {
    // on se connecte au drone et on attend la réponse
    let error = await connect();
    if (error != undefined) {
        return res.status(500).json({
            message: "Erreur lors de la connexion au drone",
            error: error,
        });
    }

    // on vérifie que le drone est bien dans les air avant d'envoyer la trajectoire
    let droneDansLesAirs: boolean = false;
    await axios
        .get(API_DRONE_URL + "isTakeOff")
        .then(function (response) {
            // parse de la réponse en objet puis en string pour pouvoir accéder à la valeur de isTakeOff
            const dataToString = JSON.stringify(response.data);
            const dataToObj = JSON.parse(dataToString);
            droneDansLesAirs = dataToObj.data.isTakeOff;
        })
        .catch(function (error) {
            return res.status(500).json({
                message: "Erreur lors de la récupération du status du drone",
                error: error,
            });
        });
    if (!droneDansLesAirs) {
        let error = await takeOff();
        if (error != undefined) {
            return res.status(500).json({
                message: "Erreur lors du décollage du drone",
                error: error,
            });
        }
    }

    // on envoie le gotoBase au drone
    axios
        .post(API_DRONE_URL + "gotoBase", {})
        .then(function (response) {
            return res.status(201).json({
                message: "GotoBase envoyé",
                response: response.data,
            });
        })
        .catch(function (error) {
            return res.status(500).json({
                message: "Erreur lors de l'envoie du gotoBase au drone",
                error: error,
            });
        });
};

exports.goto = async function (req: Request, res: Response) {
    const longitude: number = req.body.longitude;
    const latitude: number = req.body.latitude;
    const relative_altitude: number = 4.2; // on fixe l'altitude à 4.2m

    const _id = req.params.id;
    // Validation de l'id de l'intervention
    if (!mongoose.isValidObjectId(_id)) {
        return res.status(422).json({ error: "Paramètre id invalide" });
    }

    // suppression de l'id dans le body (au cas ou)
    if (req.body._id !== undefined) {
        const { ["_id"]: id, ...bodySansId } = req.body;
        req.body = bodySansId;
    }

    // on enregistre le goto en tant que trajectoire dans l'intervention et dans la base de données
    Intervention.findById(_id)
        .then((intervention) => {
            if (!intervention) {
                return res
                    .status(404)
                    .json({ error: "L'intervention n'existe pas" });
            } else {
                // on enregistre la trajectoire dans la base de données
                Trajectoire.create({
                    type: "CIBLE",
                    points: [
                        {
                            longitude: longitude,
                            latitude: latitude,
                            relative_altitude: relative_altitude,
                        },
                    ],
                })
                    .then(async (trajectoire) => {
                        if (!trajectoire) {
                            return res.status(500).json({
                                error: "Erreur à la création de la trajectoire",
                            });
                        } else {
                            // on enregistre la trajectoire dans l'intervention
                            intervention.trajectoire = trajectoire._id;
                            intervention.save((err) => {
                                if (err) {
                                    res.status(500).json({ error: err });
                                }
                            });
                            console.log(
                                "Trajectoire enregistrée à l'intervention " +
                                    _id,
                            );

                            // on se connecte au drone et on attend la réponse
                            let reponse = await connect();
                            if (reponse != undefined) {
                                // si la réponse est undefined, c'est qu'il y a eu une erreur
                                return res.status(500).json({
                                    message:
                                        "Erreur lors de la connexion au drone",
                                    error: reponse,
                                });
                            }

                            // on vérifie que le drone est bien dans les air avant d'envoyer la trajectoire
                            let reponseIsTakeOff: any;
                            try {
                                reponseIsTakeOff = await axios.get(
                                    API_DRONE_URL + "isTakeOff",
                                );
                            } catch (error) {
                                return res.status(500).json({
                                    message:
                                        "Erreur lors de la récupération du status du drone",
                                    error: error,
                                });
                            }

                            // parse de la réponse en objet puis en string pour pouvoir accéder à la valeur de isTakeOff
                            const dataToString = JSON.stringify(
                                reponseIsTakeOff.data,
                            );
                            const dataToObj = JSON.parse(dataToString);
                            const droneDansLesAirs = dataToObj.data.isTakeOff;
                            if (!droneDansLesAirs) {
                                let reponse = await takeOff();
                                if (reponse != undefined) {
                                    // si la reponse est undefined, c'est qu'il y a eu une erreur
                                    return res.status(500).json({
                                        message:
                                            "Erreur lors du décollage du drone",
                                        error: reponse,
                                    });
                                }
                            }

                            // on envoie le goto au drone
                            let reponseGoto: any;
                            try {
                                reponseGoto = await axios.post(
                                    API_DRONE_URL + "goto",
                                    {
                                        longitude: longitude,
                                        latitude: latitude,
                                        relative_altitude: relative_altitude,
                                    },
                                );
                            } catch (error) {
                                return res.status(500).json({
                                    message:
                                        "Erreur lors de l'envoie du goto au drone",
                                    error: error,
                                });
                            }
                            return res.status(201).json({
                                message:
                                    "Trajectoire goto créée et envoyée au drone",
                                trajectoire: trajectoire,
                                response: reponseGoto.data,
                            });
                        }
                    })
                    .catch((err) => {
                        return res.status(500).json({ error: err });
                    });
            }
        })
        .catch((error) => {
            return res.status(500).json({
                message: "Erreur lors de l'enregistrement de la trajectoire",
                error: error,
            });
        });
};

exports.cancelTask = async function (req: Request, res: Response) {
    // on se connecte au drone et on attend la réponse
    let error = await connect();
    if (error != undefined) {
        return res.status(500).json({
            message: "Erreur lors de la connexion au drone",
            error: error,
        });
    }

    // on envoie la requete cancel au drone
    axios
        .post(API_DRONE_URL + "cancelTask", {})
        .then(function (response) {
            return res.status(201).json({
                message: "Annulation de tâche envoyée",
                response: response.data,
            });
        })
        .catch(function (error) {
            return res.status(500).json({
                message:
                    "Erreur lors de l'envoie de la demande d'annulation de tâche au drone",
                error: error,
            });
        });
};

async function takePhotos(
    latitude: number,
    longitude: number,
    idIntervention: string,
) {
    exec(
        "./photos_drone.sh " +
            latitude +
            " " +
            longitude +
            " " +
            idIntervention,
        { shell: "/bin/sh" },
        function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Photo prise pour l'intervention %s.", idIntervention);
        },
    );
}

function realtime_location_and_photos(
    positions: datas[],
    idIntervention: string,
) {
    // on recupere les latitudes et longitudes des points de la trajectoire
    const latitudes: number[] = positions.map((position) => position.latitude);
    const longitudes: number[] = positions.map(
        (position) => position.longitude,
    );
    var nbDeScreeshotsPris = 0;

    var amqp = require("amqplib/callback_api");
    // on recupere les points de la trajectoire en realtime grace a rabbitmq
    amqp.connect(
        "amqp://admin:admin@148.60.11.229:8088",
        function (error0, connection) {
            if (error0) {
                console.log(
                    "Erreur lors de la connexion a rabbitMQ : " + error0,
                );
                return;
            }
            connection.createChannel(function (error1, channel) {
                if (error1) {
                    console.log(
                        "Erreur lors de la creation du channel : " + error1,
                    );
                    return;
                }
                // le nom de l'echange, ou 'tag'
                var exchange = "drone";

                channel.assertExchange(exchange, "fanout", {
                    durable: false,
                });

                // on crée une queue temporaire
                channel.assertQueue(
                    "",
                    {
                        exclusive: true,
                    },
                    function (error2, q) {
                        if (error2) {
                            console.log(
                                "Erreur lors de la creation du channel : " +
                                    error2,
                            );
                            return;
                        }
                        channel.bindQueue(q.queue, exchange, "");

                        channel.consume(q.queue, function (msg) {
                            if (msg.content) {
                                const content = JSON.parse(
                                    msg.content.toString(),
                                );
                                const latitude: number = parseFloat(
                                    content.latitude.toFixed(7),
                                );
                                const longitude: number = parseFloat(
                                    content.longitude.toFixed(7),
                                );

                                // on regarde si la position actuelle correspond a une position de la trajectoire
                                const index = getMatchingPositionIndex(
                                    latitudes,
                                    longitudes,
                                    latitude,
                                    longitude,
                                );
                                if (index !== -1) {
                                    console.log("Photos en cours ...");

                                    // on prend une photo
                                    takePhotos(
                                        latitude,
                                        longitude,
                                        idIntervention,
                                    );

                                    // on supprime la position de la liste des positions a prendre en photo
                                    latitudes.splice(index, 1);
                                    longitudes.splice(index, 1);

                                    nbDeScreeshotsPris++;

                                    // on ferme la connection si on a pris tout les photos
                                    if (
                                        nbDeScreeshotsPris == positions.length
                                    ) {
                                        console.log(
                                            "Fin de la trajectoire, toutes les photos ont été prises.",
                                        );
                                        channel.close();
                                        return;
                                    }
                                }
                            }
                        });
                    },
                );
            });
        },
    );
}

async function takeOff() {
    try {
        await axios.post(API_DRONE_URL + "takeoff", {});
    } catch (err) {
        return err;
    }
}

async function connect() {
    try {
        await axios.post(API_DRONE_URL + "connect", {});
    } catch (err) {
        return err;
    }
}
