const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testAI() {
    try {
        console.log('--- Starting AI Interview Analysis Test ---');

        // 1. Register Student
        const studentEmail = `student_ai_${Date.now()}@test.com`;
        const studentRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'AI Test Student',
                email: studentEmail,
                password: 'password123',
                role: 'student',
                usn: `USN_AI_${Date.now()}`,
                course: 'CS'
            })
        });
        const studentData = await studentRes.json();
        if (!studentRes.ok) throw new Error(`Student Reg Failed: ${JSON.stringify(studentData)}`);
        const token = studentData.token;
        console.log('   Student Registered.');

        // 2. Submit Good Answers (Expect High Score)
        console.log('\n2. Submitting GOOD answers...');
        const goodRes = await fetch(`${BASE_URL}/interview/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                topic: 'Java',
                questions: [
                    { id: 1, text: 'Q1', answer: 'Java is an object-oriented programming language that is class-based and designed to have as few implementation dependencies as possible. It runs on the Java Virtual Machine (JVM).' },
                    { id: 2, text: 'Q2', answer: 'Garbage collection is the process of automatically memory management. The GC identifies objects that are no longer in use and reclaims their memory to free up space for new objects.' }
                ]
            })
        });
        const goodData = await goodRes.json();
        console.log('   Good Answers Result:', goodData);

        // 3. Submit Bad Answers (Expect Low Score)
        console.log('\n3. Submitting BAD answers...');
        const badRes = await fetch(`${BASE_URL}/interview/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                topic: 'Java',
                questions: [
                    { id: 1, text: 'Q1', answer: 'Java is good.' },
                    { id: 2, text: 'Q2', answer: 'I dont know.' }
                ]
            })
        });
        const badData = await badRes.json();
        console.log('   Bad Answers Result:', badData);

        if (goodData.score > badData.score) {
            console.log('\nSUCCESS: AI correctly scored good answers higher than bad answers.');
        } else {
            console.log('\nFAILURE: AI scoring logic seems static or broken.');
        }

    } catch (err) {
        console.error('TEST FAILED:', err);
    }
}

testAI();
