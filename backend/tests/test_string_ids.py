#!/usr/bin/env python3
"""
Test script to demonstrate the new paste_id functionality
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_paste_creation_and_access():
    """Test creating a paste and accessing it via string ID"""
    
    # Create a new paste
    paste_data = {
        "title": "Test Paste",
        "content": "This is a test paste with string ID access"
    }
    
    print("Creating a new paste...")
    response = requests.post(f"{BASE_URL}/api/pastes/create", json=paste_data)
    
    if response.status_code == 201:
        paste = response.json()
        paste_id = paste['id']  # This will now be the string ID
        print(f"✅ Paste created successfully with ID: {paste_id}")
        
        # Access the paste using the string ID
        print(f"Accessing paste via URL: /api/pastes/{paste_id}")
        get_response = requests.get(f"{BASE_URL}/api/pastes/{paste_id}")
        
        if get_response.status_code == 200:
            retrieved_paste = get_response.json()
            print("✅ Paste retrieved successfully:")
            print(f"   Title: {retrieved_paste['title']}")
            print(f"   Content: {retrieved_paste['content']}")
            print(f"   ID: {retrieved_paste['id']}")
        else:
            print("❌ Failed to retrieve paste")
            print(f"   Status: {get_response.status_code}")
            print(f"   Response: {get_response.text}")
    else:
        print("❌ Failed to create paste")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")

if __name__ == "__main__":
    test_paste_creation_and_access()
