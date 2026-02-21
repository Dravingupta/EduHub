import { SLOW_REQUEST_THRESHOLD_MS } from '../config/constants.js';

/**
 * Structured request logger middleware.
 * Logs method, URL, timestamp, and response time.
 * Flags slow requests exceeding the threshold.
 */

const formatLog = (method, url, timestamp, duration, isSlow) => {
    const slowTag = isSlow ? ' [SLOW]' : '';
    return `[${timestamp}] ${method} ${url} - ${duration}ms${slowTag}`;
};

const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    req.startTime = startTime;

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const timestamp = new Date().toISOString();
        const isSlow = duration > SLOW_REQUEST_THRESHOLD_MS;
        const logEntry = formatLog(req.method, req.originalUrl, timestamp, duration, isSlow);

        if (isSlow) {
            process.stderr.write(`${logEntry}\n`);
        } else {
            process.stdout.write(`${logEntry}\n`);
        }
    });

    next();
};

export default requestLogger;
