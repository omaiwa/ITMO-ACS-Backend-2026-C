import {
    Get,
    JsonController,
    QueryParam,
    Res,
    UseBefore,
} from 'routing-controllers';
import { Response } from 'express';

import requireInternalToken from '../../../../common/internal-token.middleware';
import { getDataSource } from '../../../../common/data-source-context';
import { User } from '../models/user.entity';

@UseBefore(requireInternalToken)
@JsonController('/internal/users')
export default class InternalUserController {
    @Get('/by-email')
    async byEmail(@QueryParam('email') email: string, @Res() res: Response) {
        const repo = getDataSource().getRepository(User);
        const user = await repo.findOneBy({ email });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        return res.send({
            id: user.id,
            email: user.email,
            password: user.password,
        });
    }
}
