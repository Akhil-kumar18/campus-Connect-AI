import { Request, Response } from 'express';
import { prisma } from '../app';
import { z } from 'zod';

const createExamSchema = z.object({
    title: z.string(),
    date: z.string(), // ISO String
    time: z.string(),
    location: z.string(),
    courseId: z.string(),
});

export const createExam = async (req: Request, res: Response) => {
    try {
        const data = createExamSchema.parse(req.body);
        const userId = (req as any).user.id;

        const exam = await prisma.exam.create({
            data: {
                title: data.title,
                date: new Date(data.date),
                time: data.time,
                location: data.location,
                course: { connect: { id: data.courseId } },
                createdBy: { connect: { id: userId } },
            },
            include: {
                course: true,
            }
        });

        // Notify all students in the course (Assuming functionality exists or basic placeholder)
        // For now, let's just create a generic notification for ALL students as we don't have explicit enrollment yet.
        // In a real app, we would query students enrolled in courseId.
        const allStudents = await prisma.user.findMany({ where: { role: 'student' } });

        const notifications = allStudents.map((student: { id: string }) => ({
            userId: student.id,
            message: `New Exam Scheduled: ${data.title} for ${exam.course.name} on ${data.date}`,
            isRead: false
        }));

        await prisma.notification.createMany({
            data: notifications
        });

        res.status(201).json(exam);
    } catch (error) {
        console.error('Create Exam Error:', error);
        res.status(500).json({ message: 'Error creating exam', error: (error as Error).message });
    }
};

export const getExams = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.query;
        const exams = await prisma.exam.findMany({
            where: courseId ? { courseId: String(courseId) } : {},
            include: {
                course: { select: { name: true, code: true } },
                createdBy: { select: { name: true } }
            },
            orderBy: { date: 'asc' }
        });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exams' });
    }
};
