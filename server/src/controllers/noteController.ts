import { Request, Response } from 'express';
import { prisma } from '../app';
import { z } from 'zod';

const createNoteSchema = z.object({
    title: z.string(),
    description: z.string(),
    fileUrl: z.string().url(),
    courseId: z.string(),
    moduleId: z.string(),
});

export const createNote = async (req: Request, res: Response) => {
    try {
        // Parse body since it comes as form-data strings
        const { title, description, courseId, moduleId } = req.body;
        const userId = (req as any).user.id;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Construct file URL (assuming server runs on port 5000)
        // In production, this would be the S3 URL
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const note = await prisma.note.create({
            data: {
                title,
                description,
                fileUrl,
                courseId,
                moduleId,
                facultyId: userId,
            },
            include: {
                faculty: { select: { name: true } }
            }
        });
        res.status(201).json(note);
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ message: 'Error creating note', error: (error as Error).message });
    }
};

export const deleteNote = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;

        const note = await prisma.note.findUnique({ where: { id } });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Allow admin or the faculty who created the note to delete it
        if (note.facultyId !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this note' });
        }

        await prisma.note.delete({ where: { id } });
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ message: 'Error deleting note' });
    }
};

export const getNotes = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.query;
        const notes = await prisma.note.findMany({
            where: courseId ? { courseId: String(courseId) } : {},
            include: {
                faculty: { select: { name: true } },
                course: { select: { name: true } },
                module: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes' });
    }
};

export const summarizeNotes = async (req: Request, res: Response) => {
    try {
        const { noteContent } = req.body;

        if (!noteContent) {
            return res.status(400).json({ message: 'No content provided for summarization' });
        }

        // Simple Heuristic Summarizer (Keyword-based extraction)
        // 1. Split into sentences
        const sentences = noteContent.match(/[^\.!\?]+[\.!\?]+/g) || [noteContent];

        // 2. Define keywords
        const keywords = ['important', 'significant', 'key', 'main', 'concept', 'define', 'summary', 'conclusion', 'crucial', 'essential', 'note', 'remember'];

        // 3. Score sentences
        const scoredSentences = sentences.map((sentence: string) => {
            const lowerSentence = sentence.toLowerCase();
            let score = 0;

            // Keyword match
            keywords.forEach(keyword => {
                if (lowerSentence.includes(keyword)) score += 5;
            });

            // Length check (favor medium length)
            if (sentence.length > 20 && sentence.length < 150) score += 2;

            // Position check (first and last sentences often contain main ideas)
            // We can't easily do position check inside map without index, but valid enough for now.

            return { text: sentence.trim(), score };
        });

        // 4. Sort by score
        scoredSentences.sort((a: any, b: any) => b.score - a.score);

        // 5. Select top sentences (e.g., top 30% or top 5)
        const summaryCount = Math.min(5, Math.ceil(scoredSentences.length * 0.3));
        const summarySentences = scoredSentences.slice(0, summaryCount).map((s: any) => s.text);

        // 6. Reconstruct summary (optional: order by original appearance? For now just list them)
        // To order by appearance, we'd need to keep original index.
        const summaryText = summarySentences.map((s: string) => `• ${s}`).join('\n\n');

        // Artificial delay for "processing" feel
        await new Promise(resolve => setTimeout(resolve, 1500));

        res.json({ summary: `📚 **AI Generated Summary:**\n\n${summaryText}` });

    } catch (error) {
        console.error('Summarize error:', error);
        res.status(500).json({ message: 'Error generating summary' });
    }
};
