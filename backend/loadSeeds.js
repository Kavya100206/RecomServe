// OPTIMIZED seed loader - uses BATCH inserts (100x faster!)
import { pool } from './src/config/database.js';

async function loadSeeds() {
    try {
        console.log('🌱 Loading seed data (FAST version)...\n');

        // ==========================================
        // BATCH INSERT USERS (all at once)
        // ==========================================
        console.log('👥 Creating 50 users...');
        const userValues = [];
        for (let i = 0; i < 50; i++) {
            const ageGroups = ['18-24', '25-34', '35-44', '45-54'];
            const ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)];
            userValues.push(`('${JSON.stringify({ age_group: ageGroup })}')`);
        }

        await pool.query(`INSERT INTO users (metadata) VALUES ${userValues.join(',')}`);
        console.log('✅ 50 users created\n');

        // ==========================================
        // BATCH INSERT CONTENT (all at once)
        // ==========================================
        console.log('📄 Creating 50 content items...');
        const contentData = [
            ['Introduction to Machine Learning', 'technology', ['AI', 'ML', 'tutorial']],
            ['Healthy Meal Prep Guide', 'food', ['cooking', 'healthy', 'meal-prep']],
            ['Ultimate Japan Travel Guide', 'travel', ['asia', 'culture', 'tourism']],
            ['Beginner Yoga Routine', 'fitness', ['yoga', 'exercise', 'wellness']],
            ['Top Sci-Fi Movies of 2024', 'entertainment', ['movies', 'scifi', 'reviews']],
            ['Building Your First Web App', 'technology', ['programming', 'web-dev', 'tutorial']],
            ['Italian Cooking Masterclass', 'food', ['cooking', 'italian', 'recipes']],
            ['Budget Travel Tips for Europe', 'travel', ['europe', 'budget', 'tips']],
            ['HIIT Workout for Beginners', 'fitness', ['hiit', 'cardio', 'workout']],
            ['Classic Rock Albums You Must Hear', 'entertainment', ['music', 'rock', 'classics']],
            ['Deep Learning with PyTorch', 'technology', ['AI', 'deep-learning', 'python']],
            ['Vegan Dessert Recipes', 'food', ['vegan', 'desserts', 'baking']],
            ['Backpacking Southeast Asia', 'travel', ['asia', 'backpacking', 'adventure']],
            ['CrossFit Training Guide', 'fitness', ['crossfit', 'strength', 'training']],
            ['Best TV Shows 2024', 'entertainment', ['tv', 'streaming', 'reviews']],
            ['Blockchain Fundamentals', 'technology', ['blockchain', 'crypto', 'web3']],
            ['Mediterranean Diet Guide', 'food', ['diet', 'healthy', 'mediterranean']],
            ['Photography Tips for Travelers', 'travel', ['photography', 'tips', 'gear']],
            ['Meditation for Stress Relief', 'fitness', ['meditation', 'mindfulness', 'mental-health']],
            ['Indie Games Worth Playing', 'entertainment', ['gaming', 'indie', 'reviews']],
            ['Cybersecurity Best Practices', 'technology', ['security', 'cyber', 'privacy']],
            ['Quick Breakfast Recipes', 'food', ['breakfast', 'quick', 'easy']],
            ['Solo Travel Safety Tips', 'travel', ['solo', 'safety', 'female-travel']],
            ['Running for Beginners', 'fitness', ['running', 'cardio', 'beginner']],
            ['Jazz Music History', 'entertainment', ['jazz', 'music', 'history']],
            ['React Best Practices 2024', 'technology', ['react', 'javascript', 'frontend']],
            ['Keto Diet Meal Plans', 'food', ['keto', 'diet', 'low-carb']],
            ['Digital Nomad Destinations', 'travel', ['remote-work', 'digital-nomad', 'wifi']],
            ['Strength Training for Women', 'fitness', ['strength', 'gym', 'women']],
            ['Electronic Music Festivals 2024', 'entertainment', ['edm', 'festivals', 'events']],
            ['IoT Projects with Arduino', 'technology', ['iot', 'arduino', 'diy']],
            ['Gluten-Free Baking Guide', 'food', ['gluten-free', 'baking', 'recipes']],
            ['Caribbean Islands Guide', 'travel', ['caribbean', 'islands', 'beach']],
            ['Swimming Techniques', 'fitness', ['swimming', 'technique', 'sports']],
            ['Art House Cinema Guide', 'entertainment', ['movies', 'art', 'cinema']],
            ['Data Science with Python', 'technology', ['data-science', 'python', 'analytics']],
            ['Asian Fusion Recipes', 'food', ['asian', 'fusion', 'cooking']],
            ['Mountain Hiking Trails', 'travel', ['hiking', 'mountains', 'adventure']],
            ['Pilates for Core Strength', 'fitness', ['pilates', 'core', 'flexibility']],
            ['RPG Game Recommendations', 'entertainment', ['gaming', 'rpg', 'story']],
            ['Cloud Computing Basics', 'technology', ['cloud', 'aws', 'devops']],
            ['Farm-to-Table Cooking', 'food', ['organic', 'local', 'sustainable']],
            ['Northern Lights Viewing Guide', 'travel', ['aurora', 'scandinavia', 'winter']],
            ['Nutrition for Athletes', 'fitness', ['nutrition', 'sports', 'diet']],
            ['Podcast Recommendations 2024', 'entertainment', ['podcasts', 'audio', 'reviews']],
            ['Mobile App Development', 'technology', ['mobile', 'ios', 'android']],
            ['Coffee Brewing Techniques', 'food', ['coffee', 'brewing', 'barista']],
            ['African Safari Planning', 'travel', ['africa', 'safari', 'wildlife']],
            ['Boxing Training Guide', 'fitness', ['boxing', 'cardio', 'combat']],
            ['Film Production Basics', 'entertainment', ['filmmaking', 'production', 'directing']]
        ];

        const contentValues = contentData.map(([title, category, tags]) => {
            const escTitle = title.replace(/'/g, "''");
            const escCategory = category.replace(/'/g, "''");
            const escTags = tags.map(t => `'${t.replace(/'/g, "''")}'`).join(',');
            return `('${escTitle}', '${escCategory}', ARRAY[${escTags}])`;
        });

        await pool.query(`INSERT INTO content (title, category, tags) VALUES ${contentValues.join(',')}`);
        console.log('✅ 50 content items created\n');

        // ==========================================
        // BATCH INSERT INTERACTIONS
        // ==========================================
        console.log('🔗 Generating interactions (this will be quick!)...');

        const users = await pool.query('SELECT id FROM users');
        const content = await pool.query('SELECT id FROM content');

        const interactionValues = [];

        for (const user of users.rows) {
            // Each user interacts with 10-15 random content items
            const numInteractions = 10 + Math.floor(Math.random() * 6);

            for (let i = 0; i < numInteractions; i++) {
                const randomContent = content.rows[Math.floor(Math.random() * content.rows.length)];
                const daysAgo = Math.floor(Math.random() * 30);

                // View
                interactionValues.push(
                    `('${user.id}', '${randomContent.id}', 'view', NULL, NOW() - INTERVAL '${daysAgo} days')`
                );

                // 40% chance of like
                if (Math.random() < 0.4) {
                    interactionValues.push(
                        `('${user.id}', '${randomContent.id}', 'like', NULL, NOW() - INTERVAL '${daysAgo} days')`
                    );
                }

                // 30% chance of rating (3-5 stars)
                if (Math.random() < 0.3) {
                    const rating = (3 + Math.random() * 2).toFixed(1);
                    interactionValues.push(
                        `('${user.id}', '${randomContent.id}', 'rating', ${rating}, NOW() - INTERVAL '${daysAgo} days')`
                    );
                }
            }
        }

        // Insert all interactions at once!
        await pool.query(`
      INSERT INTO interactions (user_id, content_id, event_type, value, created_at)
      VALUES ${interactionValues.join(',')}
    `);

        console.log(`✅ ${interactionValues.length} interactions generated\n`);

        // ==========================================
        // SUMMARY
        // ==========================================
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        const contentCount = await pool.query('SELECT COUNT(*) FROM content');
        const interactionStats = await pool.query(`
      SELECT event_type, COUNT(*) as count
      FROM interactions
      GROUP BY event_type
      ORDER BY count DESC
    `);

        console.log('📊 Database Summary:');
        console.log(`  Users: ${userCount.rows[0].count}`);
        console.log(`  Content: ${contentCount.rows[0].count}`);
        console.log(`  Total Interactions: ${interactionValues.length}`);
        console.log('\n  Interaction Breakdown:');
        interactionStats.rows.forEach(row => {
            console.log(`    - ${row.event_type}: ${row.count}`);
        });

        console.log('\n✅ Seed data loaded successfully!');
        console.log('🎯 Ready to build APIs and train ML models!');

    } catch (error) {
        console.error('❌ Seed loading failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

loadSeeds();
