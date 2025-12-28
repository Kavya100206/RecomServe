// Test User API endpoints

const BASE_URL = 'http://localhost:3000/api';

async function testUserAPI() {
    console.log('🧪 Testing User API...\n');

    try {
        // Test 1: Create User
        console.log('1️⃣ Testing POST /api/users (Create User)');
        const createResponse = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                metadata: {
                    age_group: '25-34',
                    interests: ['tech', 'AI', 'ML']
                }
            })
        });
        const newUser = await createResponse.json();
        console.log('✅ Response:', JSON.stringify(newUser, null, 2));

        const userId = newUser.data?.id;
        console.log(`\n📝 Created User ID: ${userId}\n`);

        // Test 2: Get User by ID
        console.log(`2️⃣ Testing GET /api/users/${userId} (Get User)`);
        const getResponse = await fetch(`${BASE_URL}/users/${userId}`);
        const user = await getResponse.json();
        console.log('✅ Response:', JSON.stringify(user, null, 2));

        // Test 3: Get All Users
        console.log('\n3️⃣ Testing GET /api/users (Get All Users)');
        const getAllResponse = await fetch(`${BASE_URL}/users?limit=5`);
        const allUsers = await getAllResponse.json();
        console.log('✅ Response:', JSON.stringify(allUsers, null, 2));

        // Test 4: Update User
        console.log(`\n4️⃣ Testing PUT /api/users/${userId} (Update User)`);
        const updateResponse = await fetch(`${BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                metadata: {
                    age_group: '35-44',
                    interests: ['tech', 'blockchain']
                }
            })
        });
        const updatedUser = await updateResponse.json();
        console.log('✅ Response:', JSON.stringify(updatedUser, null, 2));

        console.log('\n✅ All User API tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testUserAPI();
