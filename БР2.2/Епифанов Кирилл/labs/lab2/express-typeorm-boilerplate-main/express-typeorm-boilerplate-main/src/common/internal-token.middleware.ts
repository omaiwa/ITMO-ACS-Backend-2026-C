import { NextFunction, Request, Response } from 'express';

export default function requireInternalToken(
    request: Request,
    response: Response,
    next: NextFunction,
): void | Response {
    const expected = process.env.INTERNAL_SERVICE_TOKEN || 'internal';
    const got = request.headers['x-internal-token'] as string | undefined;
    if (got !== expected) {
        return response.status(403).json({ message: 'Forbidden' });
    }
    next();
}
