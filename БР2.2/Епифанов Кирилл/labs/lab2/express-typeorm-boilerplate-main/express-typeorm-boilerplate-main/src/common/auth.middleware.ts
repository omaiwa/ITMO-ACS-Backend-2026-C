import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface JwtPayloadWithUser extends JwtPayload {
    user: { id: number };
}

interface RequestWithUser extends Request {
    user: { id: number };
}

const authMiddleware = (
    request: RequestWithUser,
    response: Response,
    next: NextFunction,
) => {
    const { authorization } = request.headers;

    try {
        const [, accessToken] = (authorization || '').split(' ');

        if (!accessToken) {
            return response
                .status(401)
                .send({ message: 'Unauthorized: no token provided' });
        }

        const secret = process.env.JWT_SECRET_KEY || 'secret';
        const { user } = jwt.verify(accessToken, secret) as JwtPayloadWithUser;

        request.user = user;
        next();
    } catch {
        return response
            .status(403)
            .send({ message: 'Forbidden: token is invalid or expired' });
    }
};

export { JwtPayloadWithUser, RequestWithUser };
export default authMiddleware;
