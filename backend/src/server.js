import app from './app.js';
import connectDB from './config/db.js';
import { REQUIRED_ENV_VARS } from './config/constants.js';

/**
 * Validate required environment variables at startup.
 * Exits process if any are missing.
 */
const validateEnv = () => {
    const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        process.stderr.write(
            `Missing required environment variables: ${missing.join(', ')}\n`
        );
        process.exit(1);
    }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        validateEnv();

        // Connect to Database
        await connectDB();

        // Start Express Server
        app.listen(PORT, () => {
            process.stdout.write(
                `Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}\n`
            );
        });
    } catch (error) {
        process.stderr.write(`Error: ${error.message}\n`);
        process.exit(1);
    }
};

startServer();
