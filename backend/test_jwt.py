"""
Test script to verify the JWT token verification process.
Run this script to test the token generation and validation.
"""
import requests
import time
import sys
import json

# Colors for console output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

# Helper function to print colored output
def print_color(color, text):
    print(f"{color}{text}{RESET}")

def test_jwt_flow():
    API_URL = "http://localhost:8900"
    
    # 1. Try to login with test user
    print_color(YELLOW, "1. Testing login and token generation...")
    
    login_data = {
        "username": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        login_response = requests.post(
            f"{API_URL}/auth/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data.get("access_token")
            print_color(GREEN, f"✓ Login successful, received token: {token[:15]}...")
            
            # 2. Test the /me endpoint with the token
            print_color(YELLOW, "\n2. Testing /me endpoint with token...")
            
            me_response = requests.get(
                f"{API_URL}/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if me_response.status_code == 200:
                user_data = me_response.json()
                print_color(GREEN, f"✓ User data retrieved successfully!")
                print(f"User ID: {user_data.get('id')}")
                print(f"Email: {user_data.get('email')}")
                print(f"Full Name: {user_data.get('full_name', 'Not provided')}")
                
                # 3. Test notebook pages endpoint
                print_color(YELLOW, "\n3. Testing notebook pages endpoint with token...")
                
                notebook_response = requests.get(
                    f"{API_URL}/notebook/pages",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if notebook_response.status_code == 200:
                    pages = notebook_response.json()
                    print_color(GREEN, f"✓ Notebook pages retrieved successfully!")
                    print(f"Found {len(pages)} pages for user")
                    
                    for i, page in enumerate(pages[:3]):  # Show max 3 pages
                        print(f"  - Page {i+1}: id={page.get('id')}, name={page.get('name')}")
                    
                    if len(pages) > 3:
                        print(f"  (and {len(pages) - 3} more pages)")
                        
                    return True
                else:
                    print_color(RED, f"✗ Failed to retrieve notebook pages: {notebook_response.status_code}")
                    print(f"Response: {notebook_response.text}")
            else:
                print_color(RED, f"✗ Failed to retrieve user data: {me_response.status_code}")
                print(f"Response: {me_response.text}")
                
                # Try to decode the error
                try:
                    error_data = me_response.json()
                    print(f"Error details: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"Raw response: {me_response.text}")
        else:
            print_color(RED, f"✗ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            
    except Exception as e:
        print_color(RED, f"✗ Error during testing: {str(e)}")
        
    return False

if __name__ == "__main__":
    print_color(YELLOW, "JWT Token Verification Test")
    print_color(YELLOW, "=========================\n")
    
    success = test_jwt_flow()
    
    if success:
        print_color(GREEN, "\n✅ JWT token flow working correctly!")
        sys.exit(0)
    else:
        print_color(RED, "\n❌ JWT token flow has issues. Check the logs above.")
        sys.exit(1)
