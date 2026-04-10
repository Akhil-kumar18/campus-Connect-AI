import { Request, Response } from 'express';
import { prisma } from '../app';
import { z } from 'zod';

const createVideoSchema = z.object({
    title: z.string(),
    videoUrl: z.string().url(),
    duration: z.string(),
    courseId: z.string(),
    moduleId: z.string(),
    summaryShort: z.string().optional(),
});

export const createVideo = async (req: Request, res: Response) => {
    try {
        const { title, courseId, moduleId, videoUrl, summaryShort } = req.body;
        const userId = (req as any).user.id;

        let finalVideoUrl = videoUrl;
        let duration = "0:00"; // Placeholder duration

        // If file uploaded, use that instead of URL
        if (req.file) {
            finalVideoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            // In a real app, you'd calculate duration using ffmpeg here
        }

        const video = await prisma.videoClass.create({
            data: {
                title,
                videoUrl: finalVideoUrl,
                duration,
                courseId,
                moduleId,
                summaryShort: summaryShort || `Quick overview of ${title}: This video covers the fundamental concepts and key takeaways effectively.`,
                summaryMedium: `This session explores ${title} in depth. Key topics include core principles, practical applications, and common pitfalls. Suitable for review and exam preparation.`,
                summaryLong: `In this comprehensive video lecture on ${title}, the instructor provides a thorough exploration of the subject matter, beginning with the fundamental principles and historical context to establish a strong foundation. The session systematically progresses through advanced concepts, using real-world examples to illustrate complex theories in a practical manner. Detailed explanations of key methodologies are interspersed with case studies that highlight distinct strategies and common pitfalls to avoid. The lecture concludes with a synthesis of these ideas, offering a holistic view of the topic and actionable insights for future application, making it an essential resource for mastering the material.`,
                facultyId: userId,
            },
            include: {
                faculty: { select: { name: true } }
            }
        });

        res.status(201).json(video);
    } catch (error) {
        console.error("Create video error:", error);
        res.status(500).json({ message: 'Error creating video', error: (error as Error).message });
    }
};

export const getVideos = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.query;
        const videos = await prisma.videoClass.findMany({
            where: courseId ? { courseId: String(courseId) } : {},
            include: {
                faculty: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching videos' });
    }
};

export const deleteVideo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;

        const video = await prisma.videoClass.findUnique({ where: { id } });

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Allow admin or the faculty who created the video to delete it
        if (video.facultyId !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this video' });
        }

        await prisma.videoClass.delete({ where: { id } });
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({ message: 'Error deleting video' });
    }
};
