const amqp = require("amqplib/callback_api");

async function connectRabbitMQ() {
    try {
        const rabbitMQHost = 'host.docker.internal';
        const rabbitMQPort = 8088;
        const rabbitMQUsername = 'admin';
        const rabbitMQPassword = 'admin';
        const rabbitMQUrl = `amqp://${rabbitMQUsername}:${rabbitMQPassword}@${rabbitMQHost}:${rabbitMQPort}`;

        const exchangeName = 'drone';
        const exchangeType = 'fanout';

        await amqp.connect(rabbitMQUrl, function(error0, connection) {
                if (error0) {
                    throw error0;
                }
                connection.createChannel(function(error1, channel) {
                    if (error1) {
                        throw error1;
                    }

                    channel.assertExchange(exchangeName, exchangeType, {
                        durable: false // Indique si l'échange doit être persistant ou non
                    });
                    // Bind la queue à l'échange
                    const queueName = 'back';
                    channel.assertQueue(queueName, {
                        exclusive: false // Indique si la queue est exclusive ou non
                    });
                    channel.bindQueue(queueName, exchangeName, '');

                    // Commence à consommer les messages
                    channel.consume(queueName, function(msg) {
                        console.log("Message received : " + JSON.parse(msg.content));
                    }, {
                        noAck: true
                    });
                });
            });
    } catch (ex) {
        console.error(ex);
    }
}

export default connectRabbitMQ
