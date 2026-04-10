
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const courses = [
    { name: 'Web Development', code: 'CS101', description: 'Full stack web development including Frontend and Backend technologies.' },
    { name: 'Cyber Security', code: 'CS102', description: 'Fundamentals of network security, cryptography, and ethical hacking.' },
    { name: 'Data Science', code: 'CS103', description: 'Data analysis, visualization, and statistical modeling.' },
    { name: 'Machine Learning', code: 'CS104', description: 'Introduction to ML algorithms, supervised and unsupervised learning.' },
    { name: 'Artificial Intelligence', code: 'CS105', description: 'AI concepts, neural networks, and deep learning.' },
];

async function main() {
    console.log('Start seeding courses...');
    for (const course of courses) {
        const createdCourse = await prisma.course.upsert({
            where: { code: course.code },
            update: {},
            create: course,
        });
        console.log(`Created course with id: ${createdCourse.id}`);
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
