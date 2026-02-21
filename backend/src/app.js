import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.routes.js';
import userRoutes from './routes/user.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import topicRoutes from './routes/topic.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import errorHandler from './middlewares/error.middleware.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/assignments', assignmentRoutes);

// Route Placeholder for development
app.get('/', (req, res) => {
    res.send('Welcome to EduHub API');
});

// Error Handler
app.use(errorHandler);

export default app;
