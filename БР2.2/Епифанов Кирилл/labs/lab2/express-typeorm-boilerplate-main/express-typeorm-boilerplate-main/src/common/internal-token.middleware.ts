import { NextFunction, Request, Response } from 'express';

const requireInternalToken = (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    const expected = process.env.INTERNAL_SERVICE_TOKEN || 'internal';
    const provided = request.headers['x-internal-token'];

    if (provided !== expected) {
        return response.status(403).send({ message: 'Forbidden' });
    }

    next();
};

export default requireInternalToken;
