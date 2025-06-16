"""
Test script to verify the backend API is functioning correctly.
Run this script to test the API endpoints and CORS configuration.
"""
import requests
import json
import sys

def test_server_running():
    print("Testing if server is running...")
    try:
        response = requests.get("http://localhost:8900/")
        if response.status_code == 200:
            print(f"✓ Server is running: {response.json()}")
            return True
        else:
            print(f"✗ Server returned unexpected status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Failed to connect to server. Make sure it's running on http://localhost:8900")
        return False

def test_cors_headers():
    print("\nTesting CORS headers...")
    try:
        # Send OPTIONS request to test CORS preflight
        response = requests.options(
            "http://localhost:8900/auth/token",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type,Authorization"
            }
        )
        
        print(f"Status code: {response.status_code}")
        print("Response headers:")
        for key, value in response.headers.items():
            if key.lower().startswith("access-control"):
                print(f"  {key}: {value}")
                
        has_allow_origin = "access-control-allow-origin" in [h.lower() for h in response.headers]
        has_allow_headers = "access-control-allow-headers" in [h.lower() for h in response.headers]
        has_allow_methods = "access-control-allow-methods" in [h.lower() for h in response.headers]
        
        if has_allow_origin and has_allow_headers and has_allow_methods:
            print("✓ CORS headers are properly configured")
            return True
        else:
            print("✗ Some CORS headers are missing")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Failed to connect to server")
        return False

def test_signup_and_login():
    print("\nTesting user signup and login...")
    
    # Try registering a test user
    print("1. Registering test user...")
    test_user_data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    
    try:
        signup_response = requests.post(
            "http://localhost:8900/auth/signup",
            json=test_user_data
        )
        
        if signup_response.status_code == 200:
            print(f"✓ User registered successfully: {signup_response.json().get('email')}")
        elif signup_response.status_code == 400 and "already registered" in signup_response.text.lower():
            print("ℹ User already exists (this is fine)")
        else:
            print(f"✗ Failed to register user: {signup_response.text}")
            return False
            
        # Try logging in with this user
        print("2. Testing login...")
        login_data = {
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        }
        
        login_response = requests.post(
            "http://localhost:8900/auth/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            print(f"✓ Login successful, token received: {token[:15]}...")
            
            # Test getting user info with token
            print("3. Testing token authentication...")
            user_info_response = requests.get(
                "http://localhost:8900/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if user_info_response.status_code == 200:
                print(f"✓ Authentication working: {user_info_response.json().get('email')}")
                return True
            else:
                print(f"✗ Auth failed: {user_info_response.status_code} - {user_info_response.text}")
                return False
        else:
            print(f"✗ Login failed: {login_response.status_code} - {login_response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Failed to connect to server")
        return False
    except Exception as e:
        print(f"✗ Error during authentication test: {str(e)}")
        return False

if __name__ == "__main__":
    print("API and CORS Test Script")
    print("========================\n")
    
    tests_passed = 0
    tests_total = 3
    
    # Test 1: Check if server is running
    if test_server_running():
        tests_passed += 1
    
    # Test 2: Check CORS headers
    if test_cors_headers():
        tests_passed += 1
        
    # Test 3: Test signup and login
    if test_signup_and_login():
        tests_passed += 1
        
    print(f"\nTests completed: {tests_passed}/{tests_total} passed")
    
    if tests_passed == tests_total:
        print("\n✅ All tests passed! The API should be working correctly.")
        sys.exit(0)
    else:
        print(f"\n⚠️ {tests_total - tests_passed} tests failed. Check the logs above for details.")
        sys.exit(1)
