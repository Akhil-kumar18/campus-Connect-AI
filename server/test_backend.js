const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch in Node 18+

async function test() {
    const baseUrl = 'http://localhost:3000';

    // Health Check
    try {
        const health = await fetch(`${baseUrl}/health`);
        console.log('Health:', await health.json());
    } catch (e) {
        console.error('Health check failed', e);
    }

    // Register
    try {
        const register = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                role: 'student'
            })
        });
        const regData = await register.json();
        console.log('Register:', regData);

        // Login
        if (register.ok || regData.message === 'User already exists') {
            const login = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            });
            console.log('Login:', await login.json());
        }

    } catch (e) {
        console.error('Auth test failed', e);
    }
}

test();
