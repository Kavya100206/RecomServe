-- =====================================================
-- ML Recommendation System - Database Schema
-- =====================================================
-- This schema supports a production-grade ML recommendation system
-- with user tracking, content management, and model versioning

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Table 1: Users
-- =====================================================
-- Stores user accounts and basic information
-- metadata JSONB allows flexible storage of preferences, demographics, etc.

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for time-based queries (e.g., "users who joined this month")
CREATE INDEX idx_users_created_at ON users(created_at);

-- =====================================================
-- Table 2: Content
-- =====================================================
-- Stores items that can be recommended (articles, products, movies, etc.)
-- tags array enables content-based filtering

CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',  -- Array for content similarity
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb  -- Flexible storage for extra data
);

-- Indexes for filtering and searching
CREATE INDEX idx_content_category ON content(category);
CREATE INDEX idx_content_created_at ON content(created_at);
CREATE INDEX idx_content_tags ON content USING GIN(tags);  -- GIN index for array searches

-- =====================================================
-- Table 3: Interactions (MOST IMPORTANT!)
-- =====================================================
-- Stores user behavior - this is what trains the ML model
-- Each row represents one interaction event (view, like, rating, etc.)

CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,  -- 'view', 'like', 'rating', 'click'
  value FLOAT,  -- Rating value (1-5), time spent (seconds), or NULL for binary events
  created_at TIMESTAMP DEFAULT NOW()
);

-- Critical indexes for ML training and user lookups
CREATE INDEX idx_interactions_user ON interactions(user_id, created_at DESC);
CREATE INDEX idx_interactions_content ON interactions(content_id, created_at DESC);
CREATE INDEX idx_interactions_event_type ON interactions(event_type, created_at DESC);
CREATE INDEX idx_interactions_created_at ON interactions(created_at DESC);

-- Composite index for user-item pairs (prevents duplicate ratings)
CREATE INDEX idx_interactions_user_content ON interactions(user_id, content_id);

-- =====================================================
-- Table 4: Models
-- =====================================================
-- Tracks ML model versions, performance, and deployment status
-- Enables model versioning, rollback, and A/B testing

CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(50) UNIQUE NOT NULL,  -- e.g., 'v1.0.0', 'v1.1.0'
  algorithm VARCHAR(100),  -- 'collaborative_filtering', 'content_based', 'hybrid'
  trained_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE,  -- Only one model should be active at a time
  training_data_size INTEGER,  -- Number of interactions used for training
  hyperparameters JSONB DEFAULT '{}'::jsonb,  -- Model configuration
  metrics JSONB DEFAULT '{}'::jsonb,  -- precision@k, recall@k, NDCG, etc.
  model_path VARCHAR(255)  -- Path to saved model file (.pkl, .joblib)
);

-- Index for finding active model quickly
CREATE INDEX idx_models_active ON models(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_models_trained_at ON models(trained_at DESC);

-- =====================================================
-- Table 5: Recommendation Logs
-- =====================================================
-- Tracks recommendations made to users and their clicks
-- Enables CTR calculation, model evaluation, and A/B testing

CREATE TABLE recommendation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model_version VARCHAR(50),  -- Which model generated this recommendation
  recommended_content_ids UUID[] NOT NULL,  -- Array of recommended content IDs
  clicked_content_id UUID,  -- Which item they clicked (NULL if no click)
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Optional: Add foreign key check for clicked item
  CONSTRAINT fk_clicked_content 
    FOREIGN KEY (clicked_content_id) 
    REFERENCES content(id) ON DELETE SET NULL
);

-- Indexes for analytics and performance tracking
CREATE INDEX idx_rec_logs_user ON recommendation_logs(user_id, created_at DESC);
CREATE INDEX idx_rec_logs_model_version ON recommendation_logs(model_version);
CREATE INDEX idx_rec_logs_created_at ON recommendation_logs(created_at DESC);

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE users IS 'User accounts and profiles';
COMMENT ON TABLE content IS 'Items available for recommendation';
COMMENT ON TABLE interactions IS 'User behavior events - primary training data for ML models';
COMMENT ON TABLE models IS 'ML model version tracking and metadata';
COMMENT ON TABLE recommendation_logs IS 'Tracks recommendations and clicks for evaluation';

COMMENT ON COLUMN interactions.event_type IS 'Event types: view, like, rating, click, share';
COMMENT ON COLUMN interactions.value IS 'Numeric value: rating (1-5), time spent (seconds), or NULL for binary events';
COMMENT ON COLUMN models.is_active IS 'Only one model should be active at a time for serving recommendations';
COMMENT ON COLUMN recommendation_logs.recommended_content_ids IS 'Array of content IDs recommended to user';
COMMENT ON COLUMN recommendation_logs.clicked_content_id IS 'Content ID that user clicked (NULL if no click)';
