# Back-end repository pour le projet POMPIER - Groupe D

## Acceder au Back-end - Production

Vous pouvez retrouver les endpoints du back à cette adresse : http://148.60.11.163/

---

## Build et run avec docker - Localement

```bash
make install
make dev
```

Once you are finished working on the project and you want to stop the containers, you can simply run:

```bash
make stop
```

Ensuite, l'adresse locale du back se trouve à l'adresse : http://localhost:8085/

## Base de données

### Se connecter au container

```bash
docker exec -it pit-mongo-db bash
```

### Se connecter à la base de données (Container)

Lancer le mongo shell dans le container :

```bash
mongosh "mongodb://localhost:${PORT_DB}"
```

### Commandes utiles pour le mongo shell

Lister les bases de données : `show dbs`

Nom de la database courante : `db.getName()` or `db`

Lister les utilisateurs : `db.getUsers()`

Créer une db / Switcher sur une db particulière : `use mydb`

Afficher toutes les collections : `show collections`

Afficher les objets d'une collection : `db.collection.find()`

Insérer un document : 
- `db.myCollection.insertOne({name: "myName"})` 
    
    or 

- `db.myCollection.insertMany([{name: "myName"}, {name: "myName2"}])` 
    cela va créer une collection nommée `myCollection` si elle n'existe pas.

---

# Swagger

Un swagger a été mis en place. La documentation des endpoints est disponible à l'adresse : http://148.60.11.163/api-docs/

Pensez bien à vous connecter au réseau de l'ISTIC pour accéder à cette documentation

---

# Service Realtime

Le backend utilise 'Socket.IO' pour faire du realtime avec le front Flutter.

Le fichier **socketIoServer.ts** permet de gérer l'initialisation de socket.IO et de récupérer l'instance du serveur pour envoyer un évènement.  
La liste des évènements disponibles est représentée par l'enum **RealtimeEvents** présent dans **realtime/realtimeEventEnum.ts**

### Pour émettre un event :

```typescript
const io = require("../socketIoListener").getIO();
io.emit("my_event_code", additionalData);
```
Les données envoyées dans 'additionalData' sont jointes à l'évènement et peuvent être utilisées pour actualiser une valeur sans que le Front ait à faire un appel à l'api du backend.

### Pour s'abonner à un évènement

La bibliothèque est bidirectionelle, donc le serveur peut aussi s'abonner à des events et réagir à des events envoyés par les clients.
```typescript
const io = require("../socketIoListener").getIO();
io.on("hello from client", (...args) => {
    // my code to execute
  });
```

### Ajouter un middleware

On peut insérer un middleware, qui va effectuer un traitement à la réception d'un message sans le consommer.
Exemple :
```typescript
io.use((socket, next) => {
    console.log("Received a message");
    next();
});
```

Il existe de nombreuses autres fonctionnalités pour contrôler les messages émits.
La documentation complète de Socket.IO est disponible ici: https://socket.io/docs/v4/.  

# RabbitMQ

On utilise `amqplib/callback_api` pour consommer les messages sur RabbitMQ. Pour chaque nouveau message, on parse le contenu afin de créer un object Coordonnée et le stocker en base de données.
```
channel.consume(queueName, function(msg) {
    console.log("Message received : " + JSON.parse(msg.content));
    Coordinate.create(JSON.parse(msg.content))
}
```

---

# Drone

Si vous lancez le back en local, et que vous voulez tester les endpoints liés au drone, n'oubliez pas de changer la valeur de la variable `API_DRONE_URL` dans le fichier `src/controllers/droneController.ts` pour qu'elle corresponde à l'adresse du drone. L'adresse du drone peut être soit sur la VM à l'adresse `148.60.11.229` ou alors en localhost si l'API est lancée localement.

## Photos drone

Les photos sont prises grace au module `ffmget` qui permet de capturer un moment dans le flux rstp du drone.
Les photos prises par le drone sont stockées dans le dossier `/photos`, et rangées chacune dans le dossier de l'intervention qui lui est associé. Sur la photos, plusieurs informations sont présentes, comme la date de prise de la photo, la position du drone, et l'id de l'intervention. 
Tout cela est fait grace au script `photos_drone.sh`, appelé par un des controller du back.