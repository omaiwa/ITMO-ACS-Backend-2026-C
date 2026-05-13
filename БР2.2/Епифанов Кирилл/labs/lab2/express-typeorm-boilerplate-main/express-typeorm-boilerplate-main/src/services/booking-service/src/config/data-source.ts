import { DataSource } from 'typeorm';
import SETTINGS from './settings';
import { Booking } from '../models/booking.entity';

export default new DataSource({
    type: 'postgres',
    host: SETTINGS.DB_HOST,
    port: SETTINGS.DB_PORT,
    username: SETTINGS.DB_USER,
    password: SETTINGS.DB_PASSWORD,
    database: SETTINGS.DB_NAME,
    entities: [Booking],
    subscribers: [],
    synchronize: true,
    logging: false,
});
