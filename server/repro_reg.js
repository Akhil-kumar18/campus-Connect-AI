const fetch = require('node-fetch'); // Or native fetch in Node 18+

async function testRegistration() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'testuser_' + Date.now() + '@example.com',
                password: 'password123',
                name: 'Test User',
                role: 'student'
            }),
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testRegistration();
