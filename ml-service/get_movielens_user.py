"""
Get a sample user ID from the MovieLens-imported data
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cursor = conn.cursor()

cursor.execute("SELECT id FROM users LIMIT 5")
users = cursor.fetchall()

print("=" * 80)
print("🎬 SAMPLE MOVIELENS USER IDs")
print("=" * 80)
print("\nCopy one of these UUIDs to sign in:\n")

for i, (user_id,) in enumerate(users, 1):
    print(f"{i}. {user_id}")

print("\n" + "=" * 80)
print("Now go to http://localhost:5173/ and sign in with one of these IDs!")
print("=" * 80)

cursor.close()
conn.close()
