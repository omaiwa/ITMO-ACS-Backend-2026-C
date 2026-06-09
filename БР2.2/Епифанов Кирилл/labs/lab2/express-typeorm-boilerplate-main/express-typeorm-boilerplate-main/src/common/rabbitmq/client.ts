import amqplib, { Channel, Connection } from 'amqplib';

import { RENTAL_EXCHANGE } from './events';

let connection: Connection | null = null;
let channel: Channel | null = null;

function amqpUrl(): string {
    return process.env.RABBITMQ_URL || 'amqp://guest:guest@127.0.0.1:5672';
}

async function openChannel(): Promise<Channel> {
    if (channel) {
        return channel;
    }
    const maxAttempts = 12;
    let lastErr: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            connection = await amqplib.connect(amqpUrl());
            channel = await connection.createChannel();
            await channel.assertExchange(RENTAL_EXCHANGE, 'topic', {
                durable: true,
            });
            return channel;
        } catch (err) {
            lastErr = err;
            channel = null;
            connection = null;
            await new Promise((r) => setTimeout(r, 2000));
        }
    }
    throw lastErr;
}

export async function connectPublisher(): Promise<Channel> {
    return openChannel();
}

export async function connectConsumer(
    queue: string,
    routingKeys: string[],
): Promise<void> {
    const ch = await openChannel();
    await ch.assertQueue(queue, { durable: true });
    for (const key of routingKeys) {
        await ch.bindQueue(queue, RENTAL_EXCHANGE, key);
    }
}

export async function publishEvent(
    routingKey: string,
    payload: unknown,
): Promise<void> {
    const ch = await connectPublisher();
    ch.publish(
        RENTAL_EXCHANGE,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true, contentType: 'application/json' },
    );
}

export async function consumeQueue(
    queue: string,
    serviceName: string,
    handler: (routingKey: string, body: unknown) => Promise<void>,
): Promise<void> {
    const ch = await openChannel();
    await ch.consume(
        queue,
        async (msg) => {
            if (!msg) {
                return;
            }
            try {
                const routingKey = msg.fields.routingKey;
                const body = JSON.parse(msg.content.toString()) as unknown;
                await handler(routingKey, body);
                ch.ack(msg);
            } catch (err) {
                console.error(`[${serviceName}] rabbit handler error`, err);
                ch.nack(msg, false, false);
            }
        },
        { noAck: false },
    );
    console.log(`[${serviceName}] listening queue ${queue}`);
}

export function startConsumerInBackground(
    queue: string,
    serviceName: string,
    routingKeys: string[],
    handler: (routingKey: string, body: unknown) => Promise<void>,
): void {
    (async () => {
        await connectConsumer(queue, routingKeys);
        await consumeQueue(queue, serviceName, handler);
    })().catch((err) => {
        console.error(`[${serviceName}] rabbit consumer failed`, err);
    });
}
