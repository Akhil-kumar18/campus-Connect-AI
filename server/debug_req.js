const fetch = require('node-fetch'); // Assuming node-fetch is available or using native fetch in Node 18+

const BASE_URL = 'http://localhost:3000/api';

async function main() {
    try {
        console.log('1. Registering/Logging in as Faculty...');
        let token = '';

        const regBody = {
            email: 'debug_faculty@test.com',
            password: 'password123',
            name: 'Debug Faculty',
            role: 'faculty',
            empId: 'DBG001',
            specialization: 'Debugging',
            department: 'CS'
        };

        let res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(regBody)
        });

        if (res.status === 400) {
            // Already exists, try login
            console.log('User exists, logging in...');
            res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: regBody.email, password: regBody.password })
            });
        }

        if (!res.ok) {
            console.error('Auth failed:', await res.text());
            return;
        }

        const authData = await res.json();
        token = authData.token;
        console.log('Got token:', token ? 'Yes' : 'No');

        console.log('2. Creating Course...');
        const courseRes = await fetch(`${BASE_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Debug Course',
                code: 'DBG101',
                description: 'A course for debugging'
            })
        });

        console.log('Response Status:', courseRes.status);
        const text = await courseRes.text();
        console.log('Response Body:', text);

        try {
            console.log('Parsed JSON:', JSON.parse(text));
        } catch (e) {
            console.log('Not JSON');
        }

    } catch (e) {
        console.error('Script Error:', e);
    }
}

main();
