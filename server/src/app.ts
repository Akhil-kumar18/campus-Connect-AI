import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
const app = express();

import path from 'path';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, path, stat) => {
        res.set('Content-Disposition', 'inline');
    }
}));

import authRoutes from './routes/authRoutes';
import examRoutes from './routes/examRoutes';
import notificationRoutes from './routes/notificationRoutes';
import courseRoutes from './routes/courseRoutes';
import statsRoutes from './routes/statsRoutes';
import interviewRoutes from './routes/interviewRoutes';
import noteRoutes from './routes/noteRoutes';
import videoRoutes from './routes/videoRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import moduleRoutes from './routes/moduleRoutes';
import userRoutes from './routes/userRoutes';
import communityRoutes from './routes/communityRoutes';
import timetableRoutes from './routes/timetableRoutes';
import chatRoutes from './routes/chatRoutes';

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/chat', chatRoutes);

// Routes will be added here

// Serve frontend static files
const frontendDistPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendDistPath));

// Catch-all route to serve index.html for SPA routing (must be after all API routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

export default app;
