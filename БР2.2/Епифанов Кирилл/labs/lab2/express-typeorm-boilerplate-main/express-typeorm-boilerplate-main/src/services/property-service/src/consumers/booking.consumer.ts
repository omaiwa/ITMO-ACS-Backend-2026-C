import {
    BookingCreatedEvent,
    QUEUE_PROPERTY_BOOKINGS,
    ROUTING_BOOKING_CREATED,
} from '../../../../common/rabbitmq/events';
import { startConsumerInBackground } from '../../../../common/rabbitmq/client';

export function startPropertyBookingConsumer(): void {
    startConsumerInBackground(
        QUEUE_PROPERTY_BOOKINGS,
        'property-service',
        [ROUTING_BOOKING_CREATED],
        async (key, body) => {
            if (key !== ROUTING_BOOKING_CREATED) {
                return;
            }
            const e = body as BookingCreatedEvent;
            console.log(
                `[property] async booking event: propertyId=${e.propertyId} bookingId=${e.bookingId}`,
            );
        },
    );
}
