import 'reflect-metadata';
import express, { Request } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const port = parseInt(process.env.GATEWAY_PORT || '8000', 10);
const host = process.env.GATEWAY_HOST || '0.0.0.0';

const auth = process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:8001';
const user = process.env.USER_SERVICE_URL || 'http://127.0.0.1:8002';
const property = process.env.PROPERTY_SERVICE_URL || 'http://127.0.0.1:8003';
const booking = process.env.BOOKING_SERVICE_URL || 'http://127.0.0.1:8004';
const messaging = process.env.MESSAGING_SERVICE_URL || 'http://127.0.0.1:8005';

function pathWithoutQuery(req: Request): string {
    const u = req.originalUrl || req.url || '/';
    const i = u.indexOf('?');
    return i === -1 ? u : u.slice(0, i);
}

const rewriteOriginal = (_path: string, req: Request) => pathWithoutQuery(req);

const app = express();
app.disable('x-powered-by');

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use(
    createProxyMiddleware({
        pathFilter: (pathname) =>
            /^\/api\/properties\/[^/]+\/chats/.test(pathname),
        target: messaging,
        changeOrigin: true,
        pathRewrite: rewriteOriginal,
    }),
);

app.use(
    '/api/auth',
    createProxyMiddleware({
        target: auth,
        changeOrigin: true,
        pathRewrite: rewriteOriginal,
    }),
);
app.use(
    '/api/users',
    createProxyMiddleware({
        target: user,
        changeOrigin: true,
        pathRewrite: rewriteOriginal,
    }),
);
app.use(
    '/api/cities',
    createProxyMiddleware({
        target: property,
        changeOrigin: true,
        pathRewrite: rewriteOriginal,
    }),
);
app.use(
    '/api/facilities',
    createProxyMiddleware({
        target: property,
        changeOrigin: true,
        pathRewrite: rewriteOriginal,
    }),
);
app.use(
    '/api/properties',
    createProxyMiddleware({
        target: property,
        changeOrigin: true,
        pathRewrite: rewriteOriginal,
    }),
);
app.use(
    '/api/bookings',
    createProxyMiddleware({
        target: booking,
        changeOrigin: true,
        pathRewrite: rewriteOriginal,
    }),
);

app.listen(port, host, () => {
    console.log(`gateway ${port}`);
});
