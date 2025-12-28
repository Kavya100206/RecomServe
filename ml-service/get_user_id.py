"""
Get User from Model
Gets a user ID that's actually in the trained model
"""

import pickle
import os

# Load the trained model
model_path = 'models/nmf_model_v1.0.pkl'

if os.path.exists(model_path):
    with open(model_path, 'rb') as f:
        model_data = pickle.load(f)
    
    # Get first user from model
    user_ids = list(model_data['user_mapper'].keys())
    
    if user_ids:
        user_id = user_ids[0]
        
        print("="*80)
        print("✅ FOUND USER IN MODEL!")
        print("="*80)
        print(f"\nUser ID: {user_id}")
        print(f"\n📋 COPY THIS URL AND PASTE IN BROWSER:")
        print("="*80)
        print(f"\nhttp://localhost:8000/recommendations/{user_id}?n=5")
        print("\n" + "="*80)
        print("This should show PERSONALIZED recommendations!")
        print("(is_personalized: true)")
        print("="*80)
        
        # Also test popular
        print("\n📌 Compare with popular content:")
        print("http://localhost:8000/recommendations/?n=5")
        print("="*80)
    else:
        print("❌ No users in model!")
else:
    print(f"❌ Model file not found: {model_path}")
