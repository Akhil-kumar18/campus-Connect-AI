
const BASE_URL = 'http://localhost:3000/api';

async function request(method, endpoint, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(`${method} ${endpoint} failed: ${response.status} - ${JSON.stringify(data)}`);
    }
    return data;
}

async function verifyFlow() {
    try {
        console.log('--- Starting Verification Flow ---');

        // 1. Register Faculty
        const facultyEmail = `faculty_${Date.now()}@test.com`;
        const facultyPass = 'password123';
        console.log(`1. Registering faculty: ${facultyEmail}`);

        await request('POST', '/auth/register', {
            email: facultyEmail,
            password: facultyPass,
            name: 'Test Faculty',
            role: 'faculty',
            empId: `EMP${Date.now()}`,
            department: 'CS',
            specialization: 'AI'
        });

        // 2. Login Faculty
        console.log('2. Logging in faculty...');
        const facultyAuth = await request('POST', '/auth/login', {
            email: facultyEmail,
            password: facultyPass
        });
        const facultyToken = facultyAuth.token;

        // 3. Create Course
        console.log('3. Creating course...');
        const course = await request('POST', '/courses', {
            name: 'Test Course',
            code: `CS${Date.now()}`,
            description: 'Test Description'
        }, facultyToken);
        console.log(`   Course created: ${course.id}`);

        // 4. Create Module
        console.log('4. Creating module...');
        const moduleRes = await request('POST', '/modules', {
            title: 'Test Module',
            description: 'Module Description',
            courseId: course.id
        }, facultyToken);
        console.log(`   Module created: ${moduleRes.id}`);
        const moduleId = moduleRes.id;

        // 5. Upload Note
        console.log('5. Uploading note...');
        const note = await request('POST', '/notes', {
            title: 'Test Note',
            description: 'This is a test note',
            fileUrl: 'http://example.com/note.pdf',
            courseId: course.id,
            moduleId: moduleId
        }, facultyToken);
        console.log(`   Note created: ${note.id}`);

        // 6. Register Student
        const studentEmail = `student_${Date.now()}@test.com`;
        console.log(`6. Registering student: ${studentEmail}`);
        await request('POST', '/auth/register', {
            email: studentEmail,
            password: 'password123',
            name: 'Test Student',
            role: 'student',
            usn: `USN${Date.now()}`,
            course: 'CS'
        });

        // 7. Login Student
        console.log('7. Logging in student...');
        const studentAuth = await request('POST', '/auth/login', {
            email: studentEmail,
            password: 'password123'
        });
        const studentToken = studentAuth.token;

        // 8. Fetch Notes
        console.log('8. Fetching notes as student...');
        const notes = await request('GET', '/notes', null, studentToken);

        const found = notes.some(n => n.id === note.id);
        if (found) {
            console.log('SUCCESS: Note found in student view!');
        } else {
            throw new Error('FAILURE: Note NOT found in student view.');
        }

    } catch (error) {
        console.error('\nVERIFICATION FAILED:', error.message);
        process.exit(1);
    }
}

verifyFlow();
