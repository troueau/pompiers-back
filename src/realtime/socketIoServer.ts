import * as http from "http";
import { Server } from "socket.io";

let io: Server;

/**
 * Méthode d'initialisation de SocketIO, s'attachant sur le serveur passé en paramètre
 * @param httpServer
 */
function configureSocketIO(httpServer: http.Server): void {
    if (!httpServer) {
        throw new Error("Argument invalide");
    }
    if (!io) {
        io = new Server(httpServer);
        if (!io) {
            console.error("Erreur à la configuration de SocketIO");
        }
    }

    io.on("connection", (socket) => {
        // Log des nouvelles connexions
        console.log("Socket " + socket.id + " connected");

        // Ajout des évènements à envoyer par le client pour la gestion des salles
        socket.on("leaveRooms", (data: string, callback: Function) => {
            socket.rooms.forEach((room) => {
                if (socket.id !== room) {
                    socket.leave(room);
                }
            });
            if (callback !== undefined) {
                callback({
                    status: "ok",
                });
            }
        });
        socket.on("room", (room) => {
            socket.join(room);
        });
    });
}

/**
 * Méthode de récupération de 'io', pour ajouter des listeners ou émettre des évènements
 * @return io
 */
function getIO() {
    if (!io) {
        throw new Error(
            "Must call constructor of mysocketio module before getIO()",
        );
    }
    return io;
}

module.exports = { configureSocketIO, getIO };
