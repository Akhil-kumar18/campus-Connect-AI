import { Request, Response } from 'express';
import { prisma } from '../app';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalStudents = await prisma.user.count({ where: { role: 'student' } });
        const totalFaculty = await prisma.user.count({ where: { role: 'faculty' } });
        const totalCourses = await prisma.course.count();

        const totalNotes = await prisma.note.count();
        const totalVideos = await prisma.videoClass.count();
        const totalAssignments = await prisma.assignment.count();
        const totalSubmissions = await prisma.submission.count();

        // Calculate Submission Rate
        // Logic: (Total Submissions / (Total Assignments * Total Students)) * 100
        // If no assignments or students, rate is 0.
        let submissionRate = 0;
        const potentialSubmissions = totalAssignments * totalStudents;
        if (potentialSubmissions > 0) {
            submissionRate = Math.round((totalSubmissions / potentialSubmissions) * 100);
        }

        // Mock views for now as schema migration is pending server restart
        // In future: await prisma.videoClass.aggregate({ _sum: { views: true } });
        const totalVideoViews = 0;
        const totalNoteViews = 0;

        // Active Users (Simple count for now)
        const activeUsers = totalStudents + totalFaculty;

        // Student Engagement could be same as Submission Rate or average of multiple metrics
        const studentEngagement = submissionRate;

        res.json({
            totalStudents,
            totalFaculty,
            totalCourses,
            totalNotes,
            totalVideos,
            totalAssignments,
            submissionRate,
            activeUsers,
            totalVideoViews,
            totalNoteViews,
            studentEngagement
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};
