
const API_URL = 'http://localhost:3000/api';

async function testStats() {
    try {
        const uniqueEmail = `test.stats.${Date.now()}@test.com`;
        const user = {
            name: 'Test Stats',
            email: uniqueEmail,
            password: 'password123',
            role: 'faculty'
        };

        console.log('Registering user...');
        await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: uniqueEmail, password: 'password123' })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Token obtained.');

        console.log('Fetching stats...');
        const statsRes = await fetch(`${API_URL}/stats/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const statsData = await statsRes.json();
        console.log('Stats Response:', statsData);

    } catch (error: any) {
        console.error('Error:', error);
    }
}

testStats();
