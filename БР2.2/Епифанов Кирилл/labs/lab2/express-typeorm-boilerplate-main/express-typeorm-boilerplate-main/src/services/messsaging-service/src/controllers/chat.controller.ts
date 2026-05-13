import {
    Body,
    Delete,
    Get,
    Param,
    Post,
} from 'routing-controllers';
import { ObjectLiteral } from 'typeorm';

import BaseController from '../../../../common/base-controller';
import EntityController from '../../../../common/entity-controller';
import { getDataSource } from '../../../../common/data-source-context';
import { Chat } from '../models/chat.entity';
import { Message } from '../models/message.entity';

class CreateMessageDto {
    sender!: string;
    content!: string;
}

async function requireProperty(propertyId: number): Promise<void> {
    const base =
        process.env.PROPERTY_SERVICE_URL || 'http://127.0.0.1:8003';
    const token =
        process.env.INTERNAL_SERVICE_TOKEN || 'internal';
    const url = `${base}/api/internal/properties/${propertyId}`;
    const res = await fetch(url, {
        headers: { 'x-internal-token': token },
    });
    if (res.status === 404) {
        throw new Error('Property not found');
    }
    if (!res.ok) {
        throw new Error('Property lookup failed');
    }
}

@EntityController({
    baseRoute: '/properties/:propertyId/chats',
    entity: Chat,
})
class ChatController extends BaseController {
    @Get('')
    async getAll(@Param('propertyId') propertyId: number) {
        return this.repository.find({
            where: { propertyId },
            relations: ['messages'],
        });
    }

    @Post('')
    async create(@Param('propertyId') propertyId: number) {
        await requireProperty(propertyId);
        const chat = this.repository.create({ propertyId });
        return this.repository.save(chat);
    }

    @Get('/:chatId')
    async getById(
        @Param('propertyId') propertyId: number,
        @Param('chatId') chatId: number,
    ): Promise<ObjectLiteral> {
        const chat = await this.repository.findOne({
            where: { id: chatId, propertyId },
            relations: ['messages'],
        });
        if (!chat) throw new Error('Chat not found');
        return chat;
    }

    @Post('/:chatId/messages')
    async addMessage(
        @Param('propertyId') propertyId: number,
        @Param('chatId') chatId: number,
        @Body() body: CreateMessageDto,
    ) {
        const chat = await this.repository.findOne({
            where: { id: chatId, propertyId },
        });
        if (!chat) throw new Error('Chat not found');

        const messageRepo = getDataSource().getRepository(Message);
        const message = messageRepo.create({ ...body, chat });
        return messageRepo.save(message);
    }

    @Delete('/:chatId/messages/:messageId')
    async removeMessage(
        @Param('propertyId') propertyId: number,
        @Param('chatId') chatId: number,
        @Param('messageId') messageId: number,
    ) {
        const chat = await this.repository.findOne({
            where: { id: chatId, propertyId },
        });
        if (!chat) throw new Error('Chat not found');

        const messageRepo = getDataSource().getRepository(Message);
        const message = await messageRepo.findOne({
            where: { id: messageId, chat: { id: chatId } },
        });
        if (!message) throw new Error('Message not found');
        return messageRepo.remove(message);
    }

    @Delete('/:chatId')
    async remove(
        @Param('propertyId') propertyId: number,
        @Param('chatId') chatId: number,
    ) {
        const chat = await this.repository.findOne({
            where: { id: chatId, propertyId },
        });
        if (!chat) throw new Error('Chat not found');
        return this.repository.remove(chat);
    }
}

export default ChatController;
