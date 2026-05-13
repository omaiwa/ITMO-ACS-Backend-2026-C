import { Get, JsonController, Param, UseBefore } from 'routing-controllers';

import requireInternalToken from '../../../../common/internal-token.middleware';
import { getDataSource } from '../../../../common/data-source-context';
import { Property } from '../models/property.entity';

@UseBefore(requireInternalToken)
@JsonController('/internal/properties')
export default class InternalPropertyController {
    @Get('/:id')
    async getOne(@Param('id') id: number) {
        const repo = getDataSource().getRepository(Property);
        const p = await repo.findOneBy({ id });
        if (!p) {
            throw new Error('Property not found');
        }
        return {
            id: p.id,
            propertyOwnerId: p.propertyOwnerId,
        };
    }
}
