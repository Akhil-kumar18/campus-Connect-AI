import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleChatRequest = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { message } = req.body;

        if (!message) {
            res.status(400).json({ response: "Please provide a message." });
            return;
        }

        // Fetch user details for personalization
        let userName = "Student";
        if (userId) {
            const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
            if (user) {
                userName = user.name.split(' ')[0]; // Use first name
            }
        }

        const lowerMessage = message.toLowerCase().replace(/\s+/g, ' ').trim();
        let responseText = "";

        // Intent: Greetings & Conversational (check FIRST to handle casual messages)
        if (/\b(hi|hello|hey|howdy|yo)\b/.test(lowerMessage) || lowerMessage.includes('how are you') || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening') || lowerMessage.includes("what's up") || lowerMessage.includes('whats up') || lowerMessage.includes('sup')) {
            responseText = `Hi ${userName}! 😊 I'm doing great, thanks for asking! How can I help you today? I can assist with your timetable, exams, notes, assignments, video classes, or interview practice.`;
        }
        // Intent: Help / What can you do
        else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('what do you do') || lowerMessage.includes('features') || lowerMessage.includes('options')) {
            responseText = `Here's what I can help you with, ${userName}:\n📅 Timetable — "Show my timetable" or "today's classes"\n📝 Notes — "Show recent notes"\n📚 Assignments — "Pending assignments"\n🎥 Video Classes — "Recent video lectures"\n📖 Exams — "Upcoming exams"\n🎤 Interview Practice — "My interview progress"\n\nJust type what you need!`;
        }
        // Intent: Video Classes 
        // Logic: Check this BEFORE timetable to prevent "video class" collisions with "class"
        else if (lowerMessage.includes('video') || lowerMessage.includes('lecture') || lowerMessage.includes('recording') ||
            (lowerMessage.includes('class') && lowerMessage.includes('watch'))) {

            const videos = await prisma.videoClass.findMany({
                orderBy: { createdAt: 'desc' },
                take: 3,
                include: { course: { select: { name: true } } }
            });

            if (videos.length > 0) {
                responseText = `Hey ${userName}, I found some recent video classes for you:\n` + videos.map(v => `- ${v.title} (${v.course.name}): [Watch Video](${v.videoUrl})`).join('\n');
            } else {
                responseText = `I couldn't find any recent video classes uploaded, ${userName}.`;
            }
        }
        // Intent: Exams
        else if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('midterm') || lowerMessage.includes('final')) {
            const exams = await prisma.exam.findMany({
                where: { date: { gte: new Date() } },
                orderBy: { date: 'asc' },
                take: 3,
                include: { course: { select: { name: true, code: true } } }
            });

            if (exams.length > 0) {
                responseText = `Heads up ${userName}! You have ${exams.length} upcoming exams:\n` + exams.map(e => `- ${e.title} (${e.course.code}) on ${new Date(e.date).toLocaleDateString()}`).join('\n');
            } else {
                responseText = `Great news, ${userName}! You have no upcoming exams scheduled right now. Enjoy the free time!`;
            }
        }
        // Intent: Timetable/Schedule (handles "time table", "today's classes", "today schedule", etc.)
        else if (lowerMessage.includes('timetable') || lowerMessage.includes('time table') || lowerMessage.includes('schedule') ||
            lowerMessage.includes('class') || lowerMessage.includes('today') || lowerMessage.includes('period') ||
            lowerMessage.includes('routine') || lowerMessage.includes('slot')) {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const timetable = await prisma.timetable.findMany({
                where: { day: today },
                orderBy: { startTime: 'asc' },
                include: { course: { select: { name: true, code: true } } }
            });

            if (timetable.length > 0) {
                responseText = `Here is your schedule for today (${today}):\n` + timetable.map(t => `- ${t.startTime}-${t.endTime}: ${t.course.name} (${t.room || 'No Room'})`).join('\n');
            } else {
                responseText = `You're all clear! No classes scheduled for today (${today}).`;
            }
        }
        // Intent: Notes
        else if (lowerMessage.includes('note') || lowerMessage.includes('material') || lowerMessage.includes('study') || lowerMessage.includes('pdf') || lowerMessage.includes('resource')) {
            const notes = await prisma.note.findMany({
                orderBy: { createdAt: 'desc' },
                take: 3,
                include: { course: { select: { name: true } } }
            });

            if (notes.length > 0) {
                responseText = `Here are the latest study materials I found:\n` + notes.map(n => `- ${n.title} for ${n.course.name}: [View Note](${n.fileUrl})`).join('\n');
            } else {
                responseText = `It looks like no new notes have been uploaded recently, ${userName}.`;
            }
        }
        // Intent: Assignments
        else if (lowerMessage.includes('assign') || lowerMessage.includes('homework') || lowerMessage.includes('submission') || lowerMessage.includes('due') || lowerMessage.includes('deadline')) {
            const assignments = await prisma.assignment.findMany({
                where: { deadline: { gte: new Date() } },
                orderBy: { deadline: 'asc' },
                take: 3,
                include: { course: { select: { name: true } } }
            });

            if (assignments.length > 0) {
                responseText = `Don't forget, you have these pending assignments:\n` + assignments.map(a => `- ${a.title} for ${a.course.name} (Due: ${new Date(a.deadline).toLocaleDateString()})`).join('\n');
            } else {
                responseText = `You're efficient, ${userName}! No pending assignments due soon.`;
            }
        }
        // Intent: Interview Practice
        else if (lowerMessage.includes('interview') || lowerMessage.includes('practice') || lowerMessage.includes('mock')) {
            if (userId) {
                const sessions = await prisma.interviewSession.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                });

                if (sessions.length > 0) {
                    const avgScore = sessions.reduce((acc, curr) => acc + curr.score, 0) / sessions.length;
                    responseText = `You've done ${sessions.length} practice sessions recently with an average score of ${avgScore.toFixed(1)}%. Making valid progress!`;
                } else {
                    responseText = `I notice you haven't tried any interview practice sessions yet, ${userName}. It's a great way to prepare!`;
                }
            } else {
                responseText = "I can track your interview progress if you log in. Want to give it a try?";
            }
        }
        // Intent: Thanks
        else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('thx')) {
            responseText = `You're welcome, ${userName}! 😊 Let me know if you need anything else.`;
        }
        // Intent: Goodbye
        else if (/\b(bye|goodbye|see you|later|good night)\b/.test(lowerMessage)) {
            responseText = `Goodbye, ${userName}! 👋 Have a great day! Feel free to come back anytime you need help.`;
        }
        // Default
        else {
            responseText = `Hmm, I'm not sure I understood that, ${userName}. Here's what I can help with:\n📅 Timetable — "Show my timetable"\n📝 Notes — "Show recent notes"\n📚 Assignments — "Pending assignments"\n🎥 Video Classes — "Recent lectures"\n📖 Exams — "Upcoming exams"\n🎤 Interview Practice — "My interview progress"\n\nTry asking one of these!`;
        }

        res.json({ response: responseText });

    } catch (error) {
        console.error("Error in chat handler:", error);
        res.status(500).json({ response: "Sorry, I seem to be having a bit of trouble right now. Please try again in a moment." });
    }
};
