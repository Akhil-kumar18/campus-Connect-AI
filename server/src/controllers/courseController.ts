import { Request, Response } from 'express';
import { prisma } from '../app';
import { z } from 'zod';

const createCourseSchema = z.object({
    name: z.string(),
    code: z.string(),
    description: z.string(),
});

export const createCourse = async (req: Request, res: Response) => {
    try {
        const data = createCourseSchema.parse(req.body);
        const userId = (req as any).user.id;

        const course = await prisma.course.create({
            data: {
                ...data,
                facultyId: userId
            }
        });
        res.status(201).json(course);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Error creating course', error: (error as Error).message });
    }
};

export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = await prisma.course.findMany({
            include: { faculty: { select: { name: true } } }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses' });
    }
};
