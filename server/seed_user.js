const fetch = require('node-fetch');

async function val() {
    const baseUrl = 'http://localhost:3000';

    // Register a user for browser testing
    try {
        const register = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'browser_test@example.com',
                password: 'password123',
                name: 'Browser Tester',
                role: 'student'
            })
        });
        console.log('Register Response:', await register.json());
    } catch (e) {
        console.error('Register failed', e);
    }
}

val();
