const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/auth';

async function register(user) {
    console.log(`Registering ${user.role} (${user.name})...`);
    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const data = await response.json();
        console.log(`Status: ${response.status}`);
        if (!response.ok) {
            console.log('Error:', JSON.stringify(data, null, 2));
        } else {
            console.log('Success:', data.user.email);
        }
    } catch (e) {
        console.error('Network Error:', e.message);
    }
    console.log('---');
}

async function runTests() {
    const timestamp = Date.now();

    // 1. Valid Student
    await register({
        email: `student_${timestamp}@test.com`,
        password: 'password123',
        name: 'Student One',
        role: 'student',
        usn: `USN_${timestamp}`,
        course: 'Computer Science'
    });

    // 2. Invalid Student (Missing USN)
    await register({
        email: `student_invalid_${timestamp}@test.com`,
        password: 'password123',
        name: 'Student Invalid',
        role: 'student',
        course: 'Computer Science'
        // Missing USN
    });

    // 3. Valid Faculty
    await register({
        email: `faculty_${timestamp}@test.com`,
        password: 'password123',
        name: 'Faculty One',
        role: 'faculty',
        empId: `EMP_${timestamp}`,
        specialization: 'AI/ML',
        department: 'CS'
    });

    // 4. Invalid Faculty (Missing Department)
    await register({
        email: `faculty_invalid_${timestamp}@test.com`,
        password: 'password123',
        name: 'Faculty Invalid',
        role: 'faculty',
        empId: `EMP_INV_${timestamp}`,
        specialization: 'AI/ML'
        // Missing Department
    });
}

runTests();
