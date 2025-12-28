"""
MovieLens 100k Dataset Import Script
Downloads and imports MovieLens 100k dataset into PostgreSQL database.
"""

import os
import zipfile
import urllib.request
import pandas as pd
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
import uuid
from datetime import datetime

# Load environment variables
load_dotenv()

# Dataset URLs
MOVIELENS_URL = "https://files.grouplens.org/datasets/movielens/ml-100k.zip"
DATASET_DIR = "datasets"
EXTRACT_DIR = os.path.join(DATASET_DIR, "ml-100k")

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL')

def download_dataset():
    """Download MovieLens 100k dataset"""
    print("=" * 80)
    print("📥 DOWNLOADING MOVIELENS 100K DATASET")
    print("=" * 80)
    
    os.makedirs(DATASET_DIR, exist_ok=True)
    zip_path = os.path.join(DATASET_DIR, "ml-100k.zip")
    
    if os.path.exists(EXTRACT_DIR):
        print("✓ Dataset already downloaded and extracted")
        return
    
    if not os.path.exists(zip_path):
        print(f"Downloading from {MOVIELENS_URL}...")
        urllib.request.urlretrieve(MOVIELENS_URL, zip_path)
        print("✓ Download complete")
    
    print("Extracting dataset...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(DATASET_DIR)
    print("✓ Extraction complete")
    print()

def load_movies():
    """Load movie data from u.item"""
    print("📽️ Loading movie data...")
    
    # u.item columns
    columns = ['movie_id', 'title', 'release_date', 'video_release_date', 'imdb_url'] + \
              [f'genre_{i}' for i in range(19)]
    
    movies_df = pd.read_csv(
        os.path.join(EXTRACT_DIR, 'u.item'),
        sep='|',
        encoding='latin-1',
        names=columns,
        header=None
    )
    
    # Genre names
    genre_names = [
        'unknown', 'Action', 'Adventure', 'Animation', "Children's", 'Comedy',
        'Crime', 'Documentary', 'Drama', 'Fantasy', 'Film-Noir', 'Horror',
        'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
    ]
    
    # Sample 200 random movies for faster import
    movies_df = movies_df.sample(n=min(200, len(movies_df)), random_state=42)
    
    # Process movies
    movies = []
    for _, row in movies_df.iterrows():
        # Get genres for this movie
        genres = [genre_names[i] for i in range(19) if row[f'genre_{i}'] == 1]
        
        # Skip unknown genre
        if 'unknown' in genres:
            genres.remove('unknown')
        
        # Primary genre is first one (or 'General' if none)
        primary_genre = genres[0] if genres else 'General'
        
        # Handle NaN release dates
        release_date = row['release_date']
        if pd.isna(release_date):
            release_date = None
        
        movies.append({
            'movie_id': row['movie_id'],
            'uuid': str(uuid.uuid4()),
            'title': row['title'],
            'category': primary_genre,
            'tags': genres,
            'release_date': release_date
        })
    
    print(f"✓ Loaded {len(movies)} movies (sampled)")
    return movies

def load_users():
    """Load user data from u.user"""
    print("👥 Loading user data...")
    
    users_df = pd.read_csv(
        os.path.join(EXTRACT_DIR, 'u.user'),
        sep='|',
        names=['user_id', 'age', 'gender', 'occupation', 'zip_code'],
        header=None
    )
    
    # Sample 100 random users for faster import
    users_df = users_df.sample(n=min(100, len(users_df)), random_state=42)
    
    users = []
    for _, row in users_df.iterrows():
        users.append({
            'user_id': row['user_id'],
            'uuid': str(uuid.uuid4()),
            'metadata': {
                'age': int(row['age']),
                'gender': row['gender'],
                'occupation': row['occupation'],
                'zip_code': row['zip_code']
            }
        })
    
    print(f"✓ Loaded {len(users)} users (sampled)")
    return users

def load_ratings(users, movies):
    """Load ratings data from u.data - filtered to sampled users/movies"""
    print("⭐ Loading ratings data...")
    
    ratings_df = pd.read_csv(
        os.path.join(EXTRACT_DIR, 'u.data'),
        sep='\t',
        names=['user_id', 'movie_id', 'rating', 'timestamp'],
        header=None
    )
    
    # Filter to only include ratings from sampled users and movies
    user_ids = {u['user_id'] for u in users}
    movie_ids = {m['movie_id'] for m in movies}
    
    original_count = len(ratings_df)
    ratings_df = ratings_df[
        (ratings_df['user_id'].isin(user_ids)) & 
        (ratings_df['movie_id'].isin(movie_ids))
    ]
    
    print(f"✓ Loaded {len(ratings_df)} ratings (filtered from {original_count})")
    return ratings_df

def clear_database():
    """Clear existing data from database"""
    print("\n" + "=" * 80)
    print("🗑️ CLEARING EXISTING DATA")
    print("=" * 80)
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        cursor.execute("TRUNCATE interactions, content, users CASCADE;")
        conn.commit()
        print("✓ Database cleared")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error clearing database: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

def import_to_database(users, movies, ratings_df):
    """Import data to PostgreSQL"""
    print("\n" + "=" * 80)
    print("💾 IMPORTING TO DATABASE")
    print("=" * 80)
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        # Create mappings
        user_id_map = {u['user_id']: u['uuid'] for u in users}
        movie_id_map = {m['movie_id']: m['uuid'] for m in movies}
        
        # Import users
        print("Importing users...")
        for user in users:
            cursor.execute("""
                INSERT INTO users (id, metadata)
                VALUES (%s, %s::jsonb)
            """, (user['uuid'], psycopg2.extras.Json(user['metadata'])))
        print(f"✓ Imported {len(users)} users")
        
        # Import movies as content
        print("Importing movies...")
        for movie in movies:
            # Only include release_date in metadata if it exists
            metadata = {}
            if movie['release_date']:
                metadata['release_date'] = movie['release_date']
            
            cursor.execute("""
                INSERT INTO content (id, title, category, tags, metadata)
                VALUES (%s, %s, %s, %s, %s::jsonb)
            """, (
                movie['uuid'],
                movie['title'],
                movie['category'],
                movie['tags'],
                psycopg2.extras.Json(metadata) if metadata else None
            ))
        print(f"✓ Imported {len(movies)} movies")
        
        # Import ratings as interactions
        print("Importing ratings...")
        total = len(ratings_df)
        
        # Prepare all rating tuples
        rating_data = []
        for _, row in ratings_df.iterrows():
            user_uuid = user_id_map[row['user_id']]
            movie_uuid = movie_id_map[row['movie_id']]
            timestamp = datetime.fromtimestamp(row['timestamp'])
            rating_data.append((user_uuid, movie_uuid, float(row['rating']), timestamp))
        
        # Bulk insert using execute_batch (much faster!)
        print(f"Bulk inserting {total} ratings...")
        psycopg2.extras.execute_batch(cursor, """
            INSERT INTO interactions (user_id, content_id, event_type, value, created_at)
            VALUES (%s, %s, 'rating', %s, %s)
        """, rating_data, page_size=1000)
        
        print(f"✓ Imported {total} ratings")
        
        conn.commit()
        print("\n✅ Data import successful!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error importing data: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

def verify_import():
    """Verify data was imported correctly"""
    print("\n" + "=" * 80)
    print("✔️ VERIFYING IMPORT")
    print("=" * 80)
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"Users: {user_count}")
        
        cursor.execute("SELECT COUNT(*) FROM content")
        content_count = cursor.fetchone()[0]
        print(f"Movies: {content_count}")
        
        cursor.execute("SELECT COUNT(*) FROM interactions")
        interaction_count = cursor.fetchone()[0]
        print(f"Ratings: {interaction_count}")
        
        # Sample a movie
        cursor.execute("""
            SELECT id, title, category, tags
            FROM content
            LIMIT 1
        """)
        sample = cursor.fetchone()
        print(f"\nSample movie:")
        print(f"  ID: {sample[0]}")
        print(f"  Title: {sample[1]}")
        print(f"  Category: {sample[2]}")
        print(f"  Tags: {sample[3]}")
        
        print("\n✅ Verification complete!")
        
    finally:
        cursor.close()
        conn.close()

def main():
    """Main import process"""
    print("\n🎬 MOVIELENS 100K IMPORT")
    print("=" * 80)
    
    # Step 1: Download dataset
    download_dataset()
    
    # Step 2: Load data
    movies = load_movies()
    users = load_users()
    ratings_df = load_ratings(users, movies)
    
    # Step 3: Clear existing data
    clear_database()
    
    # Step 4: Import to database
    import_to_database(users, movies, ratings_df)
    
    # Step 5: Verify
    verify_import()
    
    print("\n" + "=" * 80)
    print("🎉 IMPORT COMPLETE!")
    print("=" * 80)
    print("\nNext steps:")
    print("1. Retrain the model: python app/train.py")
    print("2. Test recommendations: python app/main.py")
    print("=" * 80)

if __name__ == "__main__":
    main()
