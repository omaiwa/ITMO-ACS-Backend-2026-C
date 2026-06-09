import { startConsumerInBackground } from '../../../../common/rabbitmq/client';
import {
    BookingCreatedEvent,
    QUEUE_MESSAGING,
    ROUTING_BOOKING_CREATED,
    ROUTING_USER_REGISTERED,
    UserRegisteredEvent,
} from '../../../../common/rabbitmq/events';

export function startMessagingConsumers(): void {
    startConsumerInBackground(
        QUEUE_MESSAGING,
        'messaging-service',
        [ROUTING_USER_REGISTERED, ROUTING_BOOKING_CREATED],
        async (key, body) => {
            if (key === ROUTING_USER_REGISTERED) {
                const e = body as UserRegisteredEvent;
                console.log(
                    `[messaging] user registered: id=${e.userId} email=${e.email}`,
                );
                return;
            }
            if (key === ROUTING_BOOKING_CREATED) {
                const e = body as BookingCreatedEvent;
                console.log(
                    `[messaging] booking created: id=${e.bookingId} property=${e.propertyId}`,
                );
            }
        },
    );
}
