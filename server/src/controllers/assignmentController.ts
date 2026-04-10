import { Request, Response } from 'express';
import { prisma } from '../app';
import { z } from 'zod';

const createAssignmentSchema = z.object({
    title: z.string(),
    description: z.string(),
    deadline: z.string(), // ISO Date string
    courseId: z.string(),
    moduleId: z.string(),
});

export const createAssignment = async (req: Request, res: Response) => {
    try {
        console.log('Creating assignment - Request body:', req.body);
        console.log('User from token:', (req as any).user);

        const data = createAssignmentSchema.parse(req.body);
        const userId = (req as any).user.id;

        console.log('Parsed data:', data);
        console.log('User ID:', userId);

        const assignment = await prisma.assignment.create({
            data: {
                title: data.title,
                description: data.description,
                deadline: new Date(data.deadline),
                courseId: data.courseId,
                moduleId: data.moduleId,
                facultyId: userId,
            },
            include: {
                faculty: { select: { name: true } }
            }
        });

        console.log('Assignment created successfully:', assignment.id);
        res.status(201).json(assignment);
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Error creating assignment', error: (error as Error).message });
    }
};

export const getAssignments = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.query;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        const assignments = await prisma.assignment.findMany({
            where: courseId ? { courseId: String(courseId) } : {},
            include: {
                faculty: { select: { name: true } },
                submissions: userRole === 'student' ? {
                    where: { studentId: userId }
                } : true
            },
            orderBy: { deadline: 'asc' }
        });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignments' });
    }
};

export const submitAssignment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const file = (req as any).file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Check if assignment exists
        const assignment = await prisma.assignment.findUnique({
            where: { id }
        });

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if already submitted
        const existingSubmission = await prisma.submission.findFirst({
            where: {
                assignmentId: id,
                studentId: userId
            }
        });

        if (existingSubmission) {
            return res.status(400).json({ message: 'Assignment already submitted' });
        }

        // Create submission
        const fileUrl = `/uploads/${file.filename}`;
        const submission = await prisma.submission.create({
            data: {
                assignmentId: id,
                studentId: userId,
                fileUrl
            },
            include: {
                student: { select: { name: true, usn: true } }
            }
        });

        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting assignment', error: (error as Error).message });
    }
};

export const getSubmissions = async (req: Request, res: Response) => {
    try {
        const { assignmentId } = req.query;

        const submissions = await prisma.submission.findMany({
            where: assignmentId ? { assignmentId: String(assignmentId) } : {},
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        usn: true
                    }
                },
                assignment: {
                    select: {
                        title: true,
                        deadline: true
                    }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });

        res.json(submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Error fetching submissions' });
    }
};

export const getPendingSubmissions = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // assignmentId

        // 1. Get Assignment to find Course
        const assignment = await prisma.assignment.findUnique({
            where: { id },
            select: { courseId: true, title: true }
        });

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // 2. Find all students in the course
        // NOTE: key assumption: user.course stores the courseId
        const totalStudents = await prisma.user.findMany({
            where: {
                role: 'student',
                course: assignment.courseId
            },
            select: {
                id: true,
                name: true,
                email: true,
                usn: true
            }
        });

        // 3. Find all who submitted
        const submissions = await prisma.submission.findMany({
            where: { assignmentId: id },
            select: { studentId: true }
        });

        const submittedStudentIds = new Set(submissions.map(s => s.studentId));

        // 4. Filter pending
        const pendingStudents = totalStudents.filter(student => !submittedStudentIds.has(student.id));

        res.json({
            assignmentTitle: assignment.title,
            pendingCount: pendingStudents.length,
            students: pendingStudents
        });

    } catch (error) {
        console.error('Error fetching pending submissions:', error);
    }
};

export const deleteAssignment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        // Verify assignment ownership or role
        const assignment = await prisma.assignment.findUnique({
            where: { id }
        });

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Just check if role is faculty (already authorized by middleware, but good to be safe)
        if (assignment.facultyId !== userId && (req as any).user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this assignment' });
        }

        // Delete submissions first (Prisma might handle this with onDelete: Cascade, but safe to be explicit)
        await prisma.submission.deleteMany({
            where: { assignmentId: id }
        });

        await prisma.assignment.delete({
            where: { id }
        });

        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ message: 'Error deleting assignment' });
    }
};

export const updateAssignment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { deadline } = req.body;
        const userId = (req as any).user.id;

        const assignment = await prisma.assignment.findUnique({
            where: { id }
        });

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (assignment.facultyId !== userId && (req as any).user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this assignment' });
        }

        // Only updating deadline for now as requested, but can expand
        const updatedAssignment = await prisma.assignment.update({
            where: { id },
            data: {
                deadline: new Date(deadline)
            }
        });

        res.json(updatedAssignment);

    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({ message: 'Error updating assignment' });
    }
};
