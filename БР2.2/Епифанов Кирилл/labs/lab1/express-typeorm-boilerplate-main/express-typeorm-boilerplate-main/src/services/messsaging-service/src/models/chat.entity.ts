import { Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Property } from '../../../property-service/src/models/property.entity';
import { Message } from './message.entity';

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Property, property => property.chats, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'propertyId' })
    property!: Property;

    @OneToMany(() => Message, message => message.chat, { cascade: true, eager: true })
    messages!: Message[];
}