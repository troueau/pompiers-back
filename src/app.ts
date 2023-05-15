import bodyParser from "body-parser";
import cors from "cors";

import * as http from "http";
import express = require("express");
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import options from "./documentation/swagger_options";
var morgan = require("morgan");

const dataBaseConfigurator = require("./config/database/config");
const dataBaseInitializator = require("./config/database/init-mongo");
const socketIoServer = require("./realtime/socketIoServer");

const intervention = require("./routes/intervention");
const moyen = require("./routes/moyen");
const pointAttention = require("./routes/pointattention");
const zoneAction = require("./routes/zoneaction");
const action = require("./routes/action");
const connect = require("./routes/connect");
const drone = require("./routes/drone");

// Initialisation de l'application Express
const app = express();
const httpServer = http.createServer(app);

// Logger des requêtes HTTP
app.use(morgan("combined"));

// Utilisation des fichiers statiques (images, etc.)
app.use('/photos', express.static('/usr/src/service/photos'));

// cors
app.use(cors({ origin: true, credentials: true }));

// Init Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration de Swagger
const specs = swaggerJsdoc(options);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true }),
);

// Configuration des routes
app.use("/connect", connect);
app.use("/interventions", intervention);
app.use("/moyens", moyen);
app.use("/pointattentions", pointAttention);
app.use("/zoneactions", zoneAction);
app.use("/actions", action);
app.use("/drone", drone);

// Configuration de SocketIO
socketIoServer.configureSocketIO(httpServer);

// Écoute en http sur le port 8085
let port = 8085;
httpServer.listen(port, () => console.log(`Server running on port ${port}`));

// Connexion à la base de données
dataBaseConfigurator.connectDB();

// Ajout des comptes par défaut
dataBaseInitializator.ajoutComptesDefaut();
