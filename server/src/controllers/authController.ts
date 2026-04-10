import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../app';
import { generateToken } from '../utils/token';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string(),
    role: z.enum(['student', 'faculty', 'admin']),
    // Student fields
    usn: z.string().optional(),
    course: z.string().optional(),
    // Faculty fields
    empId: z.string().optional(),
    specialization: z.string().optional(),
    department: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.role === 'student') {
        if (!data.usn) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "USN is required for students", path: ["usn"] });
        }
        if (!data.course) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Course is required for students", path: ["course"] });
        }
    } else if (data.role === 'faculty') {
        if (!data.empId) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Employee ID is required for faculty", path: ["empId"] });
        }
        if (!data.specialization) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Specialization is required for faculty", path: ["specialization"] });
        }
        if (!data.department) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Department is required for faculty", path: ["department"] });
        }
    }
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role, usn, course, empId, specialization, department } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                usn,
                course,
                empId,
                specialization,
                department,
            },
        });

        const token = generateToken(user.id, user.role);
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);
        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: { id: true, name: true, email: true, role: true, avatar: true },
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
