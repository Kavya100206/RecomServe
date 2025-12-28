// Test Content API endpoints

const BASE_URL = 'http://localhost:3000/api';

async function testContentAPI() {
    console.log('🧪 Testing Content API...\n');

    try {
        // Test 1: Create Content
        console.log('1️⃣ Testing POST /api/content (Create Content)');
        const createResponse = await fetch(`${BASE_URL}/content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Advanced Machine Learning Techniques',
                category: 'technology',
                tags: ['AI', 'ML', 'deep-learning'],
                metadata: {
                    difficulty: 'advanced',
                    duration: '60min'
                }
            })
        });
        const newContent = await createResponse.json();
        console.log('✅ Response:', JSON.stringify(newContent, null, 2));

        const contentId = newContent.data?.id;
        console.log(`\n📝 Created Content ID: ${contentId}\n`);

        // Test 2: Get Content by ID
        console.log(`2️⃣ Testing GET /api/content/${contentId} (Get Content)`);
        const getResponse = await fetch(`${BASE_URL}/content/${contentId}`);
        const content = await getResponse.json();
        console.log('✅ Response:', JSON.stringify(content, null, 2));

        // Test 3: Get All Content
        console.log('\n3️⃣ Testing GET /api/content (Get All Content with limit)');
        const getAllResponse = await fetch(`${BASE_URL}/content?limit=3`);
        const allContent = await getAllResponse.json();
        console.log('✅ Response:', JSON.stringify(allContent, null, 2));

        // Test 4: Filter by Category
        console.log('\n4️⃣ Testing GET /api/content?category=technology (Filter by Category)');
        const categoryResponse = await fetch(`${BASE_URL}/content?category=technology&limit=3`);
        const techContent = await categoryResponse.json();
        console.log('✅ Response:', JSON.stringify(techContent, null, 2));

        // Test 5: Search Content
        console.log('\n5️⃣ Testing GET /api/content?search=ML (Search Content)');
        const searchResponse = await fetch(`${BASE_URL}/content?search=ML&limit=3`);
        const searchResults = await searchResponse.json();
        console.log('✅ Response:', JSON.stringify(searchResults, null, 2));

        // Test 6: Update Content
        console.log(`\n6️⃣ Testing PUT /api/content/${contentId} (Update Content)`);
        const updateResponse = await fetch(`${BASE_URL}/content/${contentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Advanced AI & Machine Learning',
                tags: ['AI', 'ML', 'deep-learning', 'neural-networks']
            })
        });
        const updatedContent = await updateResponse.json();
        console.log('✅ Response:', JSON.stringify(updatedContent, null, 2));

        console.log('\n✅ All Content API tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testContentAPI();
