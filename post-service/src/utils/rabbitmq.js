import amqp from 'amqplib'
import logger from './logger.js'
import { RABBITMQ_URL } from '../config/env.js'


let connection = null
let channel = null

const EXCHANGE_NAME = 'facebook_events'

const connectToRabbitMQ = async () => {
    try {
        connection = await amqp.connect(RABBITMQ_URL)
        channel = await connection.createChannel()
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false })
        logger.info('Connected to RabbitMQ')
        return channel
    } catch (error) {
        logger.error('Error connecting to RabbitMQ', error)
    }
}

const publishEvent = async (routingKey, message) => {
    if(!channel) {
        await connectToRabbitMQ()
    }

    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)))
    logger.info(`Published event with routing key ${routingKey}: ${message}`)
}

export { connectToRabbitMQ, publishEvent }