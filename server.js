const { createServer } = require('http');
const next = require('next');

const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';

const app = next({
    dev: false,
    hostname,
    port
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            await handle(req, res);
        } catch (err) {
            console.error('Error handling request:', err);

            if (!res.headersSent) {
                res.statusCode = 500;
                res.end('Internal server error');
            } else {
                res.end();
            }
        }
    });

    server.listen(port, hostname, () => {
        console.log(`> Teyaqi Next.js running on port ${port}`);
    });

    const shutdown = (signal) => {
        console.log(`${signal} received. Shutting down...`);

        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });

        setTimeout(() => {
            console.error('Forced shutdown after timeout.');
            process.exit(1);
        }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
});