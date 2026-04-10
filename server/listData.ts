
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const courses = await prisma.course.findMany();
    console.log('--- COURSES ---');
    courses.forEach(c => console.log(`${c.code}: ${c.name} (${c.id})`));

    const modules = await prisma.module.findMany({ include: { course: true } });
    console.log('--- MODULES ---');
    modules.forEach(m => console.log(`${m.title} (Course: ${m.course.name})`));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
