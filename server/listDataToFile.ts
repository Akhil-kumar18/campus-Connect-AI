
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const courses = await prisma.course.findMany({
        include: { _count: { select: { modules: true, notes: true, videos: true } } }
    });

    let output = '--- COURSES ---\n';
    courses.forEach(c => {
        output += `ID: ${c.id} | Code: ${c.code} | Name: ${c.name} | Modules: ${c._count.modules} | Notes: ${c._count.notes}\n`;
    });

    const modules = await prisma.module.findMany({
        include: { course: true, _count: { select: { notes: true, videos: true } } }
    });
    output += '\n--- MODULES ---\n';
    modules.forEach(m => {
        output += `ID: ${m.id} | Course: ${m.course.name} | Title: ${m.title} | Notes: ${m._count.notes}\n`;
    });

    fs.writeFileSync('debug_courses.txt', output);
    console.log('Written to debug_courses.txt');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
