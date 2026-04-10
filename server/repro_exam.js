const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testExamFlow() {
    try {
        console.log('--- Starting Exam & Notification Flow Test ---');

        // 1. Register Faculty
        const facultyEmail = `faculty_${Date.now()}@test.com`;
        console.log(`\n1. Registering Faculty: ${facultyEmail}`);
        const facultyRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Prof. Test',
                email: facultyEmail,
                password: 'password123',
                role: 'faculty',
                empId: `EMP${Date.now()}`,
                specialization: 'Testing',
                department: 'CS'
            })
        });
        const facultyData = await facultyRes.json();
        if (!facultyRes.ok) throw new Error(`Faculty Reg Failed: ${JSON.stringify(facultyData)}`);
        const facultyToken = facultyData.token;
        console.log('   Faculty Registered. Token acquired.');

        // 2. Register Student
        const studentEmail = `student_${Date.now()}@test.com`;
        console.log(`\n2. Registering Student: ${studentEmail}`);
        const studentRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Student Test',
                email: studentEmail,
                password: 'password123',
                role: 'student',
                usn: `USN${Date.now()}`,
                course: 'CS'
            })
        });
        const studentData = await studentRes.json();
        if (!studentRes.ok) throw new Error(`Student Reg Failed: ${JSON.stringify(studentData)}`);
        const studentToken = studentData.token;
        console.log('   Student Registered. Token acquired.');

        // 3. Create Course
        const courseCode = `CS${Date.now()}`;
        console.log(`\n3. Faculty Creating Course: ${courseCode}`);
        const courseRes = await fetch(`${BASE_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${facultyToken}`
            },
            body: JSON.stringify({
                name: 'Computer Science Basics',
                code: courseCode,
                description: 'Intro to CS'
            })
        });
        const courseData = await courseRes.json();
        if (!courseRes.ok) throw new Error(`Course Create Failed: ${JSON.stringify(courseData)}`);
        const courseId = courseData.id;
        console.log(`   Course Created: ${courseId}`);

        console.log(`\n3b. Faculty Creating Exam for Course: ${courseId}`);
        const examRes = await fetch(`${BASE_URL}/exams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${facultyToken}`
            },
            body: JSON.stringify({
                title: 'Final Exam',
                date: new Date().toISOString(),
                time: '10:00 AM',
                location: 'Room 303',
                courseId: courseId
            })
        });

        const examData = await examRes.json();
        console.log('   Exam Create Response:', examData);

        // 4. Student Checking Notifications
        console.log(`\n4. Student Checking Notifications`);
        const notifRes = await fetch(`${BASE_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        const notifData = await notifRes.json();
        console.log('   Notifications:', notifData);

        if (notifData.length > 0 && notifData[0].message.includes('Final Exam')) {
            console.log('\nSUCCESS: Student received exam notification!');
        } else {
            console.log('\nFAILURE: Notification not found.');
        }

    } catch (err) {
        console.error('TEST FAILED:', err);
    }
}

testExamFlow();
