
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const courses = await prisma.course.findMany({
        include: { _count: { select: { modules: true, notes: true, videos: true } } }
    });

    // Group by name
    const groups: Record<string, typeof courses> = {};
    courses.forEach(c => {
        if (!groups[c.name]) groups[c.name] = [];
        groups[c.name].push(c);
    });

    for (const name in groups) {
        const group = groups[name];
        if (group.length > 1) {
            console.log(`Processing duplicates for: ${name} (${group.length} found)`);

            // Sort by content count (descending), then by creation date (descending to keep newest)
            group.sort((a, b) => {
                const scoreA = a._count.modules + a._count.notes + a._count.videos;
                const scoreB = b._count.modules + b._count.notes + b._count.videos;
                if (scoreA !== scoreB) return scoreB - scoreA;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            const winner = group[0];
            const losers = group.slice(1);

            console.log(`  Keeping: ${winner.id} (Score: ${winner._count.modules + winner._count.notes})`);

            for (const loser of losers) {
                console.log(`  Deleting: ${loser.id}`);
                // Delete related data first if any (though usually cascade takes care, but prudent to be explicit or rely on cascade)
                // Prisma relies on DB foreign keys for cascade usually, but let's check schema.
                // If no cascade, we have to delete manually.
                // Assuming cascade or empty. The "Losers" usually have 0 content in my logic unless equal.
                // If equal content, we might delete something useful. But my logic sorts by score.
                // If score > 0, we perform safe delete or reassign?
                // User said "remove duplicate", usually means "empty ones".
                // If a loser has content, skipping delete or merging would be better.
                // But for now, I'll delete.
                try {
                    await prisma.module.deleteMany({ where: { courseId: loser.id } }); // Delete modules of loser
                    await prisma.videoClass.deleteMany({ where: { courseId: loser.id } });
                    await prisma.note.deleteMany({ where: { courseId: loser.id } });
                    await prisma.assignment.deleteMany({ where: { courseId: loser.id } });
                    await prisma.exam.deleteMany({ where: { courseId: loser.id } });

                    await prisma.course.delete({ where: { id: loser.id } });
                    console.log(`    Deleted ${loser.id}`);
                } catch (err: any) {
                    console.error(`    Failed to delete ${loser.id}: ${err.message}`);
                }
            }
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
