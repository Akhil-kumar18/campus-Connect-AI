import { Request, Response } from 'express';
import { prisma } from '../app';
import { z } from 'zod';

const createPostSchema = z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    tags: z.string(),
});

const createCommentSchema = z.object({
    text: z.string().min(1),
});

export const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await prisma.communityPost.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
};

export const createPost = async (req: Request, res: Response) => {
    try {
        const data = createPostSchema.parse(req.body);
        const userId = (req as any).user.id;

        const post = await prisma.communityPost.create({
            data: {
                title: data.title,
                body: data.body,
                tags: data.tags,
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    }
                },
                comments: true
            }
        });

        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post' });
    }
};

export const upvotePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const post = await prisma.communityPost.update({
            where: { id },
            data: {
                upvotes: {
                    increment: 1
                }
            }
        });

        res.json(post);
    } catch (error) {
        console.error('Error upvoting post:', error);
        res.status(500).json({ message: 'Error upvoting post' });
    }
};

export const createComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = createCommentSchema.parse(req.body);
        const userId = (req as any).user.id;

        const comment = await prisma.comment.create({
            data: {
                text: data.text,
                postId: id,
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    }
                }
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Error creating comment' });
    }
};

export const upvoteComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const comment = await prisma.comment.update({
            where: { id },
            data: {
                upvotes: {
                    increment: 1
                }
            }
        });

        res.json(comment);
    } catch (error) {
        console.error('Error upvoting comment:', error);
        res.status(500).json({ message: 'Error upvoting comment' });
    }
};
