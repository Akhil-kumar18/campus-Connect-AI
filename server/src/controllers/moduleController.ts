import { Request, Response } from 'express';
import { prisma } from '../app';
import { z } from 'zod';

const createModuleSchema = z.object({
    title: z.string(),
    description: z.string(),
    courseId: z.string(),
    order: z.number().optional(),
});

export const createModule = async (req: Request, res: Response) => {
    try {
        const data = createModuleSchema.parse(req.body);

        const module = await prisma.module.create({
            data: {
                title: data.title,
                description: data.description,
                courseId: data.courseId,
                order: data.order || 0
            }
        });
        res.status(201).json(module);
    } catch (error) {
        res.status(500).json({ message: 'Error creating module' });
    }
};

export const getModules = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.query;

        const modules = await prisma.module.findMany({
            where: courseId ? { courseId: String(courseId) } : {},
            orderBy: { order: 'asc' }
        });
        res.json(modules);
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ message: 'Error fetching modules' });
    }
};
