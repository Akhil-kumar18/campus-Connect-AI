import { Request, Response } from 'express';
import { prisma } from '../app';

interface Question {
    id: number;
    text: string;
    answer: string;
}

export const analyzeInterview = async (req: Request, res: Response) => {
    try {
        const { questions, topic } = req.body;
        const userId = (req as any).user.id;

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        let totalScore = 0;
        const improvements: string[] = [];
        let feedback = '';

        // Topic-specific keywords for better evaluation
        const topicKeywords: Record<string, string[]> = {
            'Java': ['class', 'object', 'interface', 'abstract', 'inheritance', 'polymorphism', 'encapsulation', 'jvm', 'jdk', 'jre', 'thread', 'garbage', 'collection', 'exception', 'spring', 'method', 'static', 'final', 'constructor', 'arraylist', 'hashmap'],
            'Python': ['decorator', 'generator', 'list', 'tuple', 'dictionary', 'lambda', 'comprehension', 'class', 'function', 'module', 'import', 'exception', 'gil', 'memory', 'pip', 'django', 'flask', 'init', 'self', 'yield', 'async'],
            'DBMS': ['table', 'query', 'join', 'index', 'normalization', 'primary', 'foreign', 'key', 'acid', 'transaction', 'sql', 'nosql', 'schema', 'record', 'relation', 'select', 'insert', 'update', 'delete', 'stored', 'procedure'],
            'JavaScript': ['closure', 'callback', 'promise', 'async', 'await', 'prototype', 'scope', 'hoisting', 'event', 'loop', 'dom', 'function', 'arrow', 'const', 'let', 'var', 'this', 'bind', 'strict', 'module', 'es6'],
            'Operating Systems': ['process', 'thread', 'deadlock', 'memory', 'virtual', 'paging', 'scheduling', 'semaphore', 'mutex', 'kernel', 'cache', 'interrupt', 'context', 'switch', 'cpu', 'io', 'file', 'system', 'stack', 'heap', 'thrashing'],
            'HR Questions': ['team', 'leadership', 'communication', 'problem', 'solving', 'experience', 'goal', 'challenge', 'strength', 'weakness', 'project', 'achievement', 'collaboration', 'growth', 'learn', 'adapt', 'manage', 'responsibility', 'impact', 'result', 'example'],
        };

        const genericKeywords = ['function', 'class', 'object', 'data', 'algorithm', 'system', 'process', 'memory', 'time', 'code'];
        const relevantKeywords = topicKeywords[topic] || genericKeywords;

        // Per-question evaluation details
        const evaluation = questions.map((q: Question) => {
            const answer = q.answer.toLowerCase();
            
            // Length score (0-40)
            let lengthScore = 0;
            if (answer.length > 100) lengthScore = 40;
            else if (answer.length > 50) lengthScore = 30;
            else if (answer.length > 20) lengthScore = 15;
            else lengthScore = 5;

            // Keyword score (0-40)
            const matchedKeywords: string[] = [];
            relevantKeywords.forEach(k => {
                if (answer.includes(k)) matchedKeywords.push(k);
            });
            const keywordScore = Math.min(matchedKeywords.length * 10, 40);

            // Topic mention bonus (0-20)
            let topicScore = 0;
            if (topic && answer.includes(topic.toLowerCase())) topicScore = 20;

            const questionScore = Math.min(lengthScore + keywordScore + topicScore, 100);
            totalScore += questionScore;

            return {
                question: q.text,
                answer: q.answer,
                score: questionScore,
                lengthScore,
                keywordScore,
                topicScore,
                matchedKeywords,
                answerLength: q.answer.length,
            };
        });

        const averageScore = Math.round(totalScore / questions.length);

        // Generate dynamic feedback
        if (averageScore >= 80) {
            feedback = 'Excellent performance! You demonstrated strong understanding of the core concepts.';
            improvements.push('Consider applying for senior roles.');
            improvements.push('Try simpler explanations for non-technical audiences.');
        } else if (averageScore >= 60) {
            feedback = 'Good effort. You have a decent grasp of the basics but missed some depth in your explanations.';
            improvements.push('Elaborate more on technical details.');
            improvements.push('Use more specific industry terminology.');
            improvements.push('Provide concrete examples in your answers.');
        } else {
            feedback = 'Keep practicing. Your answers were a bit too brief or missed key concepts.';
            improvements.push('Review the fundamental theory.');
            improvements.push('Practice structuring your answers (STAR method).');
            improvements.push('Write longer, more detailed responses.');
        }

        // Artificial delay to simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Save result to DB
        await prisma.interviewSession.create({
            data: {
                userId,
                score: averageScore,
                feedback,
                topic,
                improvements: JSON.stringify(improvements)
            }
        });

        res.json({
            score: averageScore,
            feedback,
            improvements,
            evaluation
        });

    } catch (error) {
        console.error('Interview Analysis Error:', error);
        res.status(500).json({ message: 'Error analyzing interview' });
    }
};

export const getInterviewStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const sessions = await prisma.interviewSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        const totalSessions = sessions.length;
        const averageAccuracy = totalSessions > 0
            ? Math.round(sessions.reduce((acc, curr) => acc + curr.score, 0) / totalSessions)
            : 0;

        // Basic heuristic for weak area
        let weakArea = '--';
        if (totalSessions > 0) {
            // Find session with lowest score
            const lowest = sessions.reduce((min, curr) => curr.score < min.score ? curr : min, sessions[0]);
            if (lowest.topic) weakArea = lowest.topic;
        }

        res.json({
            sessionsCompleted: totalSessions,
            averageAccuracy,
            weakArea
        });
    } catch (error) {
        console.error('Error fetching interview stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};
