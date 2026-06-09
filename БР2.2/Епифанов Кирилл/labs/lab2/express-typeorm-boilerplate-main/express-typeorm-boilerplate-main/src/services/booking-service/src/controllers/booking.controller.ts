import {
    Body,
    Delete,
    Get,
    Param,
    Patch,
    Post
} from 'routing-controllers';

import { ObjectLiteral } from 'typeorm';

import BaseController from '../../../../common/base-controller';
import EntityController from '../../../../common/entity-controller';

import { publishEvent } from '../../../../common/rabbitmq/client';
import {
    BookingCreatedEvent,
    ROUTING_BOOKING_CREATED,
} from '../../../../common/rabbitmq/events';
import { Booking } from '../models/booking.entity';

@EntityController({
    baseRoute: '/bookings',
    entity: Booking,
})

class BookingController extends BaseController {

    @Get('')
    async getAll() {
        return await this.repository.find();
    }

    @Post('')
    async create(@Body() booking: Booking) {
        const createdBooking = this.repository.create(booking);

        const saved = await this.repository.save(createdBooking);
        try {
            const event: BookingCreatedEvent = {
                bookingId: saved.id,
                propertyId: saved.propertyId,
                startDate: saved.startDate,
                endDate: saved.endDate,
                totalPrice: saved.totalPrice,
                status: saved.status,
                occurredAt: new Date().toISOString(),
            };
            await publishEvent(ROUTING_BOOKING_CREATED, event);
        } catch (err) {
            console.error('[booking] publish booking.created failed', err);
        }
        return saved;
    }

    @Get('/:id')
    async getById(@Param('id') id: number): Promise<ObjectLiteral> {
        const results = await this.repository.findOneBy({ id });

        if (!results) {
            throw new Error('Booking not found');
        }

        return results;
    }

    @Patch('/:id')
    async update(
        @Param('id') id: number,
        @Body() booking: Partial<Booking>,
    ): Promise<ObjectLiteral> {
        const bookingForUpdate = await this.repository.findOneBy({ id });

        if (!bookingForUpdate) {
            throw new Error('Booking not found');
        }

        Object.assign(bookingForUpdate, booking);
        const results = await this.repository.save(bookingForUpdate);

        return results;
    }

    @Delete('/:id')
    async remove(@Param('id') id: number) {
        return `booking #${id} removed`;
    }
}

export default BookingController;