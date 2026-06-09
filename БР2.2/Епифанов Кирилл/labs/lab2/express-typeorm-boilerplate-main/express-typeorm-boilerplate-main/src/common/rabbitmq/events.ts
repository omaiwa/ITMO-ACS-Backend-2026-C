export const RENTAL_EXCHANGE = 'rental.events';

export const ROUTING_USER_REGISTERED = 'user.registered';
export const ROUTING_BOOKING_CREATED = 'booking.created';

export const QUEUE_MESSAGING = 'messaging.events';
export const QUEUE_PROPERTY_BOOKINGS = 'property.booking-events';

export type UserRegisteredEvent = {
    userId: number;
    email: string;
    fullName: string;
    occurredAt: string;
};

export type BookingCreatedEvent = {
    bookingId: number;
    propertyId: number;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: string;
    occurredAt: string;
};
