import {
    Body,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseBefore
} from 'routing-controllers';
import { ObjectLiteral } from 'typeorm';

import BaseController from '../../../../common/base-controller';
import EntityController from '../../../../common/entity-controller';

import { publishEvent } from '../../../../common/rabbitmq/client';
import {
    ROUTING_USER_REGISTERED,
    UserRegisteredEvent,
} from '../../../../common/rabbitmq/events';
import { User } from '../models/user.entity';

import authMiddleware, {
    RequestWithUser,
} from '../../../../common/auth.middleware';

@EntityController({
    baseRoute: '/users',
    entity: User,
})
class UserController extends BaseController {
    @Get('')
    async getAll() {
        return await this.repository.find();
    }

    @Post('')
    async create(@Body() user: User) {
        const createdUser = this.repository.create(user);
        const results = await this.repository.save(createdUser);
        try {
            const event: UserRegisteredEvent = {
                userId: results.id,
                email: results.email,
                fullName: results.fullName,
                occurredAt: new Date().toISOString(),
            };
            await publishEvent(ROUTING_USER_REGISTERED, event);
        } catch (err) {
            console.error('[user] publish user.registered failed', err);
        }
        return results;
    }

    @Get('/me')
    @UseBefore(authMiddleware)
    async me(@Req() request: RequestWithUser) {
        const { user } = request;
        const results = await this.repository.findOneBy({ id: user.id });

        return results;
    }

    @Get('/:id')
    @UseBefore(authMiddleware)
    async getById(@Param('id') id: number): Promise<ObjectLiteral> {
        const results = await this.repository.findOneBy({ id });

        if (!results) {
            throw new Error('User not found');
        }

        return results;
    }

    @Patch('/:id')
    @UseBefore(authMiddleware)
    async update(
        @Param('id') id: number,
        @Body() user: Partial<User>,
    ): Promise<ObjectLiteral> {

        const userForUpdate = await this.repository.findOneBy({ id });

        if (!userForUpdate) {
            throw new Error('User not found');
        }

        Object.assign(userForUpdate, user);
        const results = await this.repository.save(userForUpdate);

        return results;
    }
}

export default UserController;
