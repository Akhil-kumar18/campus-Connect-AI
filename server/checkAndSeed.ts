import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('=== Checking Database ===\n');

    const courses = await prisma.course.findMany();
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(c => console.log(`  - ${c.name} (ID: ${c.id})`));

    const modules = await prisma.module.findMany({ include: { course: true } });
    console.log(`\nFound ${modules.length} modules:`);
    modules.forEach(m => console.log(`  - ${m.title} in ${m.course.name} (ID: ${m.id})`));

    if (modules.length === 0 && courses.length > 0) {
        console.log('\n=== Creating sample modules ===');
        for (const course of courses) {
            const module = await prisma.module.create({
                data: {
                    title: 'Module 1',
                    description: 'First module',
                    courseId: course.id,
                    order: 1
                }
            });
            console.log(`Created module "${module.title}" for course "${course.name}"`);
        }
    }

    console.log('\n=== Done ===');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
