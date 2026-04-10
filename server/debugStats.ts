
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const notes = await prisma.note.count();
    const videos = await prisma.videoClass.count();
    const courses = await prisma.course.count();
    const users = await prisma.user.count();

    console.log('--- DB STATS ---');
    console.log(`Notes: ${notes}`);
    console.log(`Videos: ${videos}`);
    console.log(`Courses: ${courses}`);
    console.log(`Users: ${users}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
