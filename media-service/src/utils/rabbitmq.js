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

const consumeEvent = async (routingKey, message) => {
    if(!channel) {
        await connectToRabbitMQ()
    }

    const q = await channel.assertQueue("", { exclusive: true})
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey)
    channel.consume(q.queue, (msg) => {
        if(msg !== null){
            const content = JSON.parse(msg.content.toString())
            callback(content)
            channel.ack(msg)
        }
    })

    logger.info(`Subscribed to event: ${routingKey}`)
}

export { connectToRabbitMQ, consumeEvent }