import { Get, JsonController } from 'routing-controllers';

@JsonController('/health')
export default class HealthController {
    @Get('')
    health() {
        return { status: 'ok' };
    }
}
