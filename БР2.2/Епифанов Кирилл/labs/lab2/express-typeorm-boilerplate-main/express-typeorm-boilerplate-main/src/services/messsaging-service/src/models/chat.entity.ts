import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', nullable: false })
    propertyId!: number;

    @OneToMany(() => Message, (message) => message.chat, {
        cascade: true,
        eager: true,
    })
    messages!: Message[];
}
