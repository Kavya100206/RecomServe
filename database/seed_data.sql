-- Seed Data for Render Deployment (Free Tier Compatible)
-- This provides minimal demo data without requiring external downloads

-- Insert sample users
INSERT INTO users (id, created_at, metadata) VALUES
('004deb95-9cc2-43e6-8445-14faae27a12f', NOW() - INTERVAL '30 days', '{"age": 25, "gender": "M"}'),
('12345678-1234-1234-1234-123456789012', NOW() - INTERVAL '25 days', '{"age": 30, "gender": "F"}'),
('23456789-2345-2345-2345-234567890123', NOW() - INTERVAL '20 days', '{"age": 28, "gender": "M"}'),
('34567890-3456-3456-3456-345678901234', NOW() - INTERVAL '15 days', '{"age": 35, "gender": "F"}'),
('45678901-4567-4567-4567-456789012345', NOW() - INTERVAL '10 days', '{"age": 22, "gender": "M"}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample movies/content
INSERT INTO content (id, title, category, tags, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Inception', 'Sci-Fi', ARRAY['Action', 'Thriller', 'Mind-bending'], NOW() - INTERVAL '100 days'),
('22222222-2222-2222-2222-222222222222', 'The Shawshank Redemption', 'Drama', ARRAY['Drama', 'Hope', 'Prison'], NOW() - INTERVAL '95 days'),
('33333333-3333-3333-3333-333333333333', 'Interstellar', 'Sci-Fi', ARRAY['Space', 'Drama', 'Time'], NOW() - INTERVAL '90 days'),
('44444444-4444-4444-4444-444444444444', 'The Dark Knight', 'Action', ARRAY['Action', 'Crime', 'Superhero'], NOW() - INTERVAL '85 days'),
('55555555-5555-5555-5555-555555555555', 'Pulp Fiction', 'Crime', ARRAY['Crime', 'Drama', 'Thriller'], NOW() - INTERVAL '80 days'),
('66666666-6666-6666-6666-666666666666', 'Forrest Gump', 'Drama', ARRAY['Drama', 'Romance', 'History'], NOW() - INTERVAL '75 days'),
('77777777-7777-7777-7777-777777777777', 'The Matrix', 'Sci-Fi', ARRAY['Action', 'Sci-Fi', 'Philosophy'], NOW() - INTERVAL '70 days'),
('88888888-8888-8888-8888-888888888888', 'Goodfellas', 'Crime', ARRAY['Crime', 'Biography', 'Mafia'], NOW() - INTERVAL '65 days'),
('99999999-9999-9999-9999-999999999999', 'The Godfather', 'Crime', ARRAY['Crime', 'Drama', 'Mafia'], NOW() - INTERVAL '60 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Fight Club', 'Drama', ARRAY['Drama', 'Thriller', 'Psychology'], NOW() - INTERVAL '55 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample interactions (ratings)
INSERT INTO interactions (user_id, content_id, event_type, value, created_at) VALUES
-- User 1 likes Sci-Fi
('004deb95-9cc2-43e6-8445-14faae27a12f', '11111111-1111-1111-1111-111111111111', 'rating', 5.0, NOW() - INTERVAL '5 days'),
('004deb95-9cc2-43e6-8445-14faae27a12f', '33333333-3333-3333-3333-333333333333', 'rating', 5.0, NOW() - INTERVAL '4 days'),
('004deb95-9cc2-43e6-8445-14faae27a12f', '77777777-7777-7777-7777-777777777777', 'rating', 4.5, NOW() - INTERVAL '3 days'),
('004deb95-9cc2-43e6-8445-14faae27a12f', '44444444-4444-4444-4444-444444444444', 'rating', 4.0, NOW() - INTERVAL '2 days'),

-- User 2 likes Drama
('12345678-1234-1234-1234-123456789012', '22222222-2222-2222-2222-222222222222', 'rating', 5.0, NOW() - INTERVAL '5 days'),
('12345678-1234-1234-1234-123456789012', '66666666-6666-6666-6666-666666666666', 'rating', 4.5, NOW() - INTERVAL '4 days'),
('12345678-1234-1234-1234-123456789012', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'rating', 4.0, NOW() - INTERVAL '3 days'),

-- User 3 likes Crime
('23456789-2345-2345-2345-234567890123', '55555555-5555-5555-5555-555555555555', 'rating', 5.0, NOW() - INTERVAL '5 days'),
('23456789-2345-2345-2345-234567890123', '88888888-8888-8888-8888-888888888888', 'rating', 4.5, NOW() - INTERVAL '4 days'),
('23456789-2345-2345-2345-234567890123', '99999999-9999-9999-9999-999999999999', 'rating', 5.0, NOW() - INTERVAL '3 days'),
('23456789-2345-2345-2345-234567890123', '44444444-4444-4444-4444-444444444444', 'rating', 3.5, NOW() - INTERVAL '2 days'),

-- User 4 diverse tastes
('34567890-3456-3456-3456-345678901234', '11111111-1111-1111-1111-111111111111', 'rating', 4.0, NOW() - INTERVAL '5 days'),
('34567890-3456-3456-3456-345678901234', '22222222-2222-2222-2222-222222222222', 'rating', 4.5,NOW() - INTERVAL '4 days'),
('34567890-3456-3456-3456-345678901234', '99999999-9999-9999-9999-999999999999', 'rating', 5.0, NOW() - INTERVAL '3 days'),

-- User 5 likes action
('45678901-4567-4567-4567-456789012345', '44444444-4444-4444-4444-444444444444', 'rating', 5.0, NOW() - INTERVAL '5 days'),
('45678901-4567-4567-4567-456789012345', '77777777-7777-7777-7777-777777777777', 'rating', 4.5, NOW() - INTERVAL '4 days'),
('45678901-4567-4567-4567-456789012345', '11111111-1111-1111-1111-111111111111', 'rating', 4.0, NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;
