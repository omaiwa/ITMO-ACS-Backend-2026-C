import { DataSource } from 'typeorm';

import SETTINGS from './settings';
import { User } from '../services/user-service/src/models/user.entity';
import { UserSubscriber } from '../services/user-service/src/models/user.subscriber';
import { Booking } from '../services/booking-service/src/models/booking.entity';
import { City } from '../services/property-service/src/models/city.entity';
import { Facility } from '../services/property-service/src/models/facility.entity';
import { Property } from '../services/property-service/src/models/property.entity';
import { PropertyFacility } from '../services/property-service/src/models/property-facility.entity';
import { Chat } from '../services/messsaging-service/src/models/chat.entity';
import { Message } from '../services/messsaging-service/src/models/message.entity';

export default new DataSource({
    type: 'postgres',
    host: SETTINGS.DB_HOST,
    port: SETTINGS.DB_PORT,
    username: SETTINGS.DB_USER,
    password: SETTINGS.DB_PASSWORD,
    database: SETTINGS.DB_NAME,
    entities: [
        User,
        City,
        Facility,
        Property,
        PropertyFacility,
        Booking,
        Chat,
        Message,
    ],
    subscribers: [UserSubscriber],
    synchronize: true,
    logging: false,
});
