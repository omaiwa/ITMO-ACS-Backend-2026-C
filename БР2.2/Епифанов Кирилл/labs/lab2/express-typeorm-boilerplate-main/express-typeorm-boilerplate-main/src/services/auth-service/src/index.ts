import 'reflect-metadata';
import cors from 'cors';
import express from 'express';
import { useExpressServer } from 'routing-controllers';

import HealthController from '../../../common/health.controller';
import SETTINGS from './config/settings';
import AuthController from './controllers/auth.controller';

const app = express();
app.use(cors());
app.use(express.json());
useExpressServer(app, {
    routePrefix: SETTINGS.APP_API_PREFIX,
    controllers: [HealthController, AuthController],
    validation: true,
    classTransformer: true,
    defaultErrorHandler: true,
});
app.listen(SETTINGS.APP_PORT, SETTINGS.APP_HOST, () => {
    console.log(`auth ${SETTINGS.APP_PORT}`);
});
