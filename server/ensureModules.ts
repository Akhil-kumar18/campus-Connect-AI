import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureModules() {
    console.log('=== Ensuring all courses have modules ===\n');

    const courses = await prisma.course.findMany();
    console.log(`Found ${courses.length} courses\n`);

    for (const course of courses) {
        const modules = await prisma.module.findMany({
            where: { courseId: course.id }
        });

        console.log(`Course: ${course.name}`);
        console.log(`  ID: ${course.id}`);
        console.log(`  Modules: ${modules.length}`);

        if (modules.length === 0) {
            console.log(`  Creating default module...`);
            const newModule = await prisma.module.create({
                data: {
                    title: 'Module 1',
                    description: 'First module',
                    courseId: course.id,
                    order: 1
                }
            });
            console.log(`  ✓ Created module: ${newModule.title} (ID: ${newModule.id})`);
        } else {
            modules.forEach(m => console.log(`  - ${m.title} (ID: ${m.id})`));
        }
        console.log('');
    }

    console.log('=== Summary ===');
    const allModules = await prisma.module.findMany();
    console.log(`Total modules: ${allModules.length}`);
}

ensureModules()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
