import amqp from 'amqplib';
import logger from "../utils/logger.js";

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'FACEBOOK_EVENTS';

const connectToRabbitMQ = async () => {
    try {
        connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false });
        logger.info('Connected to RabbitMQ');
        return channel;
    } catch (error) {
        logger.error('Error connecting to RabbitMQ', error);
    }
}

const consumeEvent = async (routingKey, callback) => {
    if (!channel) {
        await connectToRabbitMQ();
    }

    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
    channel.consume(q.queue, (msg) => {
        if (msg !== null) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg);
        }
    })

    logger.info(`Subscribed to event: ${routingKey}`);
}

export { connectToRabbitMQ, consumeEvent };