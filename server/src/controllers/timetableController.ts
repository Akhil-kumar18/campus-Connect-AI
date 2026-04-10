import { Request, Response } from 'express';
import { prisma } from '../app';
import { z } from 'zod';

const createTimetableSchema = z.object({
    title: z.string(),
    courseId: z.string(),
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    room: z.string().optional(),
});

export const getTimetables = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.query;

        const timetables = await prisma.timetable.findMany({
            where: courseId ? { courseId: String(courseId) } : {},
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    }
                },
                faculty: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: [
                { day: 'asc' },
                { startTime: 'asc' }
            ]
        });

        res.json(timetables);
    } catch (error) {
        console.error('Error fetching timetables:', error);
        res.status(500).json({ message: 'Error fetching timetables' });
    }
};

export const createTimetable = async (req: Request, res: Response) => {
    try {
        const data = createTimetableSchema.parse(req.body);
        const userId = (req as any).user.id;

        const timetable = await prisma.timetable.create({
            data: {
                title: data.title,
                courseId: data.courseId,
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                room: data.room,
                facultyId: userId,
            },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    }
                },
                faculty: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        res.status(201).json(timetable);
    } catch (error) {
        console.error('Error creating timetable:', error);
        res.status(500).json({ message: 'Error creating timetable' });
    }
};

export const updateTimetable = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = createTimetableSchema.parse(req.body);

        const timetable = await prisma.timetable.update({
            where: { id },
            data: {
                title: data.title,
                courseId: data.courseId,
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                room: data.room,
            },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    }
                },
                faculty: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        res.json(timetable);
    } catch (error) {
        console.error('Error updating timetable:', error);
        res.status(500).json({ message: 'Error updating timetable' });
    }
};

export const deleteTimetable = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.timetable.delete({
            where: { id }
        });

        res.json({ message: 'Timetable entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting timetable:', error);
        res.status(500).json({ message: 'Error deleting timetable' });
    }
};
