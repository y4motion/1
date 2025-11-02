#!/usr/bin/env python3
"""
Backend Authentication System Test Suite
Tests JWT authentication endpoints for gaming/tech marketplace
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime
import uuid

# Get backend URL from frontend .env
FRONTEND_ENV_PATH = "/app/frontend/.env"
BACKEND_URL = None

def get_backend_url():
    """Extract backend URL from frontend .env file"""
    global BACKEND_URL
    if BACKEND_URL:
        return BACKEND_URL
    
    try:
        with open(FRONTEND_ENV_PATH, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    BACKEND_URL = line.split('=', 1)[1].strip()
                    return BACKEND_URL
    except Exception as e:
        print(f"❌ Error reading frontend .env: {e}")
        return None
    
    print("❌ REACT_APP_BACKEND_URL not found in frontend .env")
    return None

class AuthTestSuite:
    def __init__(self):
        self.base_url = get_backend_url()
        if not self.base_url:
            raise Exception("Could not determine backend URL")
        
        self.api_url = f"{self.base_url}/api"
        self.session = None
        self.test_user_data = {
            "email": f"testuser_{uuid.uuid4().hex[:8]}@gamemarket.com",
            "username": f"gamer_{uuid.uuid4().hex[:8]}",
            "password": "SecurePass123!"
        }
        self.access_token = None
        
        print(f"🔧 Testing backend at: {self.api_url}")
        print(f"👤 Test user: {self.test_user_data['email']}")
    
    async def setup(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
    
    async def cleanup(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
    
    async def test_register_endpoint(self):
        """Test POST /api/auth/register"""
        print("\n🧪 Testing User Registration...")
        
        try:
            async with self.session.post(
                f"{self.api_url}/auth/register",
                json=self.test_user_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                print(f"   Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                
                if status == 201:
                    # Verify response structure
                    required_fields = ["access_token", "token_type", "user"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        print(f"❌ Missing fields in response: {missing_fields}")
                        return False
                    
                    # Verify user object structure
                    user = data["user"]
                    user_required_fields = ["id", "email", "username", "level", "coins", "achievements"]
                    missing_user_fields = [field for field in user_required_fields if field not in user]
                    
                    if missing_user_fields:
                        print(f"❌ Missing user fields: {missing_user_fields}")
                        return False
                    
                    # Verify password is not in response
                    if "password" in user or "hashed_password" in user:
                        print("❌ Password found in response - security issue!")
                        return False
                    
                    # Store token for later tests
                    self.access_token = data["access_token"]
                    
                    print(f"✅ Registration successful")
                    print(f"   User ID: {user['id']}")
                    print(f"   Level: {user['level']}")
                    print(f"   Coins: {user['coins']}")
                    print(f"   Token type: {data['token_type']}")
                    return True
                
                else:
                    print(f"❌ Registration failed: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Registration test error: {e}")
            return False
    
    async def test_duplicate_registration(self):
        """Test duplicate email/username registration"""
        print("\n🧪 Testing Duplicate Registration...")
        
        try:
            # Try to register same email again
            async with self.session.post(
                f"{self.api_url}/auth/register",
                json=self.test_user_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                
                if status == 400:
                    print(f"✅ Duplicate registration correctly rejected: {data.get('detail', 'No detail')}")
                    return True
                else:
                    print(f"❌ Duplicate registration should return 400, got {status}")
                    return False
                    
        except Exception as e:
            print(f"❌ Duplicate registration test error: {e}")
            return False
    
    async def test_login_endpoint(self):
        """Test POST /api/auth/login"""
        print("\n🧪 Testing User Login...")
        
        try:
            login_data = {
                "email": self.test_user_data["email"],
                "password": self.test_user_data["password"]
            }
            
            async with self.session.post(
                f"{self.api_url}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                
                if status == 200:
                    # Verify response structure (same as register)
                    required_fields = ["access_token", "token_type", "user"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        print(f"❌ Missing fields in login response: {missing_fields}")
                        return False
                    
                    # Update token
                    self.access_token = data["access_token"]
                    
                    print(f"✅ Login successful")
                    print(f"   User: {data['user']['username']}")
                    return True
                
                else:
                    print(f"❌ Login failed: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Login test error: {e}")
            return False
    
    async def test_invalid_login(self):
        """Test login with wrong password"""
        print("\n🧪 Testing Invalid Login...")
        
        try:
            invalid_login_data = {
                "email": self.test_user_data["email"],
                "password": "WrongPassword123!"
            }
            
            async with self.session.post(
                f"{self.api_url}/auth/login",
                json=invalid_login_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                
                if status == 401:
                    print(f"✅ Invalid login correctly rejected: {data.get('detail', 'No detail')}")
                    return True
                else:
                    print(f"❌ Invalid login should return 401, got {status}")
                    return False
                    
        except Exception as e:
            print(f"❌ Invalid login test error: {e}")
            return False
    
    async def test_me_endpoint(self):
        """Test GET /api/auth/me with valid token"""
        print("\n🧪 Testing Protected Endpoint /me...")
        
        if not self.access_token:
            print("❌ No access token available for /me test")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            async with self.session.get(
                f"{self.api_url}/auth/me",
                headers=headers
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                
                if status == 200:
                    # Verify user profile structure
                    required_fields = ["id", "email", "username", "level", "coins", "achievements"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        print(f"❌ Missing fields in /me response: {missing_fields}")
                        return False
                    
                    # Verify password is not in response
                    if "password" in data or "hashed_password" in data:
                        print("❌ Password found in /me response - security issue!")
                        return False
                    
                    print(f"✅ /me endpoint successful")
                    print(f"   User: {data['username']} (Level {data['level']})")
                    return True
                
                else:
                    print(f"❌ /me endpoint failed: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ /me endpoint test error: {e}")
            return False
    
    async def test_me_without_token(self):
        """Test GET /api/auth/me without token"""
        print("\n🧪 Testing /me Without Token...")
        
        try:
            async with self.session.get(
                f"{self.api_url}/auth/me",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                status = response.status
                
                print(f"   Status: {status}")
                
                if status == 401 or status == 403:
                    print(f"✅ /me correctly rejected without token")
                    return True
                else:
                    print(f"❌ /me should return 401/403 without token, got {status}")
                    return False
                    
        except Exception as e:
            print(f"❌ /me without token test error: {e}")
            return False
    
    async def test_me_invalid_token(self):
        """Test GET /api/auth/me with invalid token"""
        print("\n🧪 Testing /me With Invalid Token...")
        
        try:
            headers = {
                "Authorization": "Bearer invalid_token_12345",
                "Content-Type": "application/json"
            }
            
            async with self.session.get(
                f"{self.api_url}/auth/me",
                headers=headers
            ) as response:
                
                status = response.status
                
                print(f"   Status: {status}")
                
                if status == 401:
                    print(f"✅ /me correctly rejected invalid token")
                    return True
                else:
                    print(f"❌ /me should return 401 for invalid token, got {status}")
                    return False
                    
        except Exception as e:
            print(f"❌ /me invalid token test error: {e}")
            return False
    
    async def run_all_tests(self):
        """Run complete authentication test suite"""
        print("🚀 Starting Authentication System Tests")
        print("=" * 50)
        
        await self.setup()
        
        test_results = []
        
        # Test sequence
        tests = [
            ("User Registration", self.test_register_endpoint),
            ("Duplicate Registration", self.test_duplicate_registration),
            ("User Login", self.test_login_endpoint),
            ("Invalid Login", self.test_invalid_login),
            ("Protected Endpoint /me", self.test_me_endpoint),
            ("/me Without Token", self.test_me_without_token),
            ("/me Invalid Token", self.test_me_invalid_token),
        ]
        
        for test_name, test_func in tests:
            try:
                result = await test_func()
                test_results.append((test_name, result))
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {e}")
                test_results.append((test_name, False))
        
        await self.cleanup()
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 50)
        
        passed = 0
        failed = 0
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name}")
            if result:
                passed += 1
            else:
                failed += 1
        
        print(f"\n📈 Total: {len(test_results)} tests")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed == 0:
            print("\n🎉 All authentication tests passed!")
            return True
        else:
            print(f"\n⚠️  {failed} test(s) failed - authentication system needs attention")
            return False

async def main():
    """Main test runner"""
    try:
        test_suite = AuthTestSuite()
        success = await test_suite.run_all_tests()
        return success
    except Exception as e:
        print(f"❌ Test suite initialization failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)