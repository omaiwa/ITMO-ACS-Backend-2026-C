import {
    Get,
    JsonController,
    QueryParam,
    UseBefore,
} from 'routing-controllers';

import requireInternalToken from '../../../../common/internal-token.middleware';
import { getDataSource } from '../../../../common/data-source-context';
import { User } from '../models/user.entity';

@UseBefore(requireInternalToken)
@JsonController('/internal/users')
export default class InternalUserController {
    @Get('/by-email')
    async byEmail(@QueryParam('email') email: string) {
        const repo = getDataSource().getRepository(User);
        const user = await repo.findOneBy({ email });
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            password: user.password,
        };
    }
}
