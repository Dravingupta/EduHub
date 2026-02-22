import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

// Routes
import healthRoutes from './routes/health.routes.js';
import userRoutes from './routes/user.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import topicRoutes from './routes/topic.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import streakRoutes from './routes/streak.routes.js';
import readinessRoutes from './routes/readiness.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import chatRoutes from './routes/chat.routes.js';

// Middlewares
import errorHandler from './middlewares/error.middleware.js';
import rateLimiter from './middlewares/rateLimit.middleware.js';
import requestLogger from './middlewares/requestLogger.middleware.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// Body parser
app.use(express.json({ limit: '10mb' }));

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://edu-hub-brown-two.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (all /api routes)
app.use('/api', rateLimiter);

// Request logger + response time monitor
app.use(requestLogger);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/readiness', readinessRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// Route Placeholder for development
app.get('/', (req, res) => {
    res.send('Welcome to EduHub API');
});

// Error Handler
app.use(errorHandler);

export default app;
