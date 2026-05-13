import { DataSource } from 'typeorm';
import SETTINGS from './settings';
import { City } from '../models/city.entity';
import { Facility } from '../models/facility.entity';
import { Property } from '../models/property.entity';
import { PropertyFacility } from '../models/property-facility.entity';

export default new DataSource({
    type: 'postgres',
    host: SETTINGS.DB_HOST,
    port: SETTINGS.DB_PORT,
    username: SETTINGS.DB_USER,
    password: SETTINGS.DB_PASSWORD,
    database: SETTINGS.DB_NAME,
    entities: [City, Facility, Property, PropertyFacility],
    subscribers: [],
    synchronize: true,
    logging: false,
});
