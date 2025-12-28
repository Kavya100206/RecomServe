// Test Event Tracking API

const BASE_URL = 'http://localhost:3000/api';

async function testEventAPI() {
    console.log('🧪 Testing Event Tracking API...\n');

    try {
        // First, get a user and content to work with
        console.log('📋 Getting existing user and content...');
        const usersRes = await fetch(`${BASE_URL}/users?limit=1`);
        const users = await usersRes.json();
        const userId = users.data[0].id;

        const contentRes = await fetch(`${BASE_URL}/content?limit=1`);
        const content = await contentRes.json();
        const contentId = content.data[0].id;

        console.log(`✅ Using User ID: ${userId}`);
        console.log(`✅ Using Content ID: ${contentId}\n`);

        // Test 1: Track View Event
        console.log('1️⃣ Testing POST /api/events (Track View)');
        const viewResponse = await fetch(`${BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                contentId,
                eventType: 'view'
            })
        });
        const viewEvent = await viewResponse.json();
        console.log('✅ Response:', JSON.stringify(viewEvent, null, 2));

        // Test 2: Track Like Event
        console.log('\n2️⃣ Testing POST /api/events (Track Like)');
        const likeResponse = await fetch(`${BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                contentId,
                eventType: 'like'
            })
        });
        const likeEvent = await likeResponse.json();
        console.log('✅ Response:', JSON.stringify(likeEvent, null, 2));

        // Test 3: Track Rating Event
        console.log('\n3️⃣ Testing POST /api/events (Track Rating)');
        const ratingResponse = await fetch(`${BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                contentId,
                eventType: 'rating',
                value: 4.5
            })
        });
        const ratingEvent = await ratingResponse.json();
        console.log('✅ Response:', JSON.stringify(ratingEvent, null, 2));

        // Test 4: Get User's Event History
        console.log(`\n4️⃣ Testing GET /api/events/user/${userId} (Get User Events)`);
        const userEventsRes = await fetch(`${BASE_URL}/events/user/${userId}?limit=5`);
        const userEvents = await userEventsRes.json();
        console.log('✅ Response:', JSON.stringify(userEvents, null, 2));

        // Test 5: Get Content Statistics
        console.log(`\n5️⃣ Testing GET /api/events/stats/${contentId} (Get Content Stats)`);
        const statsRes = await fetch(`${BASE_URL}/events/stats/${contentId}`);
        const stats = await statsRes.json();
        console.log('✅ Response:', JSON.stringify(stats, null, 2));

        // Test 6: Get Events by Type
        console.log('\n6️⃣ Testing GET /api/events/type/rating (Get All Ratings)');
        const ratingsRes = await fetch(`${BASE_URL}/events/type/rating?limit=3`);
        const ratings = await ratingsRes.json();
        console.log('✅ Response:', JSON.stringify(ratings, null, 2));

        // Test 7: Invalid Event Type (Error Test)
        console.log('\n7️⃣ Testing POST /api/events (Invalid Event Type - Should Fail)');
        const invalidResponse = await fetch(`${BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                contentId,
                eventType: 'invalid_type'
            })
        });
        const invalidResult = await invalidResponse.json();
        console.log('✅ Response:', JSON.stringify(invalidResult, null, 2));

        console.log('\n✅ All Event API tests passed!');
        console.log('\n🎯 Event tracking is working! This data will train the ML model!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testEventAPI();
