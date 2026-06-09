import 'reflect-metadata';
import cors from 'cors';
import express from 'express';
import { useExpressServer } from 'routing-controllers';

import { setDataSource } from '../../../common/data-source-context';
import { startPropertyBookingConsumer } from './consumers/booking.consumer';
import HealthController from '../../../common/health.controller';
import dataSource from './config/data-source';
import SETTINGS from './config/settings';
import CityController from './controllers/city.controller';
import FacilityController from './controllers/facility.controller';
import InternalPropertyController from './controllers/internal-property.controller';
import PropertyController from './controllers/property.controller';

async function main() {
    await dataSource.initialize();
    setDataSource(dataSource);
    const app = express();
    app.use(cors());
    app.use(express.json());
    useExpressServer(app, {
        routePrefix: SETTINGS.APP_API_PREFIX,
        controllers: [
            HealthController,
            CityController,
            FacilityController,
            PropertyController,
            InternalPropertyController,
        ],
        validation: true,
        classTransformer: true,
        defaultErrorHandler: true,
    });
    app.listen(SETTINGS.APP_PORT, SETTINGS.APP_HOST, () => {
        console.log(`property ${SETTINGS.APP_PORT}`);
    });
    startPropertyBookingConsumer();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
