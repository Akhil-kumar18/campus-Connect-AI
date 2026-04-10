const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testSummary() {
    try {
        console.log('--- Starting Summary Test ---');

        // 1. Register/Login Student to get Token
        const studentEmail = `student_summary_${Date.now()}@test.com`;
        const studentRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Summary Test Student',
                email: studentEmail,
                password: 'password123',
                role: 'student',
                usn: `USN_SUM_${Date.now()}`,
                course: 'CS'
            })
        });
        const studentData = await studentRes.json();
        if (!studentRes.ok) throw new Error(`Student Reg Failed: ${JSON.stringify(studentData)}`);
        const token = studentData.token;
        console.log('1. Student Registered & Token Acquired.');

        // 2. Send Summary Request
        console.log('\n2. Sending Text for Summarization...');
        const textToSummarize = `
            React is a JavaScript library for building user interfaces. 
            It is maintained by Facebook and a community of individual developers.
            One key concept in React is the Virtual DOM. It improves performance by minimizing direct DOM manipulation.
            Another important feature is JSX, which allows writing HTML-like syntax inside JavaScript.
            React components can be functional or class-based. 
            The most significant addition in recent years is React Hooks, which allow state and side effects in functional components.
            To conclude, React is essential for modern web development.
        `;

        const summaryRes = await fetch(`${BASE_URL}/notes/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ noteContent: textToSummarize })
        });

        const summaryData = await summaryRes.json();
        console.log('\n3. Response Received:');
        console.log(JSON.stringify(summaryData, null, 2));

        if (summaryData.summary && summaryData.summary.includes('AI Generated Summary')) {
            console.log('\nSUCCESS: Summarizer returned a valid response.');
            if (summaryData.summary.includes('React Hooks') || summaryData.summary.includes('Virtual DOM')) {
                console.log('SUCCESS: Summarizer extracted keywords correctly.');
            }
        } else {
            console.log('\nFAILURE: Summarizer response was unexpected.');
        }

    } catch (err) {
        console.error('TEST FAILED:', err);
    }
}

testSummary();
