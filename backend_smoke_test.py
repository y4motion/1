#!/usr/bin/env python3
"""
Backend Smoke Test - Quick Health Check
Tests basic backend functionality to confirm it's operational:
- Basic /api routes responding
- Backend service running and responding
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime

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

class BackendSmokeTest:
    def __init__(self):
        self.base_url = get_backend_url()
        if not self.base_url:
            raise Exception("Could not determine backend URL")
        
        self.api_url = f"{self.base_url}/api"
        self.session = None
        
        print(f"🔧 Testing backend at: {self.api_url}")
    
    async def setup(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
    
    async def cleanup(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
    
    async def test_api_root(self):
        """Test basic /api root endpoint"""
        print("\n🧪 Testing API Root Endpoint...")
        
        try:
            async with self.session.get(f"{self.api_url}/") as response:
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                print(f"   Response: {data}")
                
                if status == 200 and "message" in data:
                    print(f"✅ API root endpoint working: {data['message']}")
                    return True
                else:
                    print(f"❌ API root endpoint failed: {status}")
                    return False
                    
        except Exception as e:
            print(f"❌ API root endpoint error: {e}")
            return False
    
    async def test_status_endpoint(self):
        """Test status endpoint (GET /api/status)"""
        print("\n🧪 Testing Status Endpoint...")
        
        try:
            async with self.session.get(f"{self.api_url}/status") as response:
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                
                if status == 200:
                    print(f"✅ Status endpoint working: {len(data)} status checks")
                    return True
                else:
                    print(f"❌ Status endpoint failed: {status}")
                    return False
                    
        except Exception as e:
            print(f"❌ Status endpoint error: {e}")
            return False
    
    async def test_catalog_endpoints(self):
        """Test catalog endpoints (basic check)"""
        print("\n🧪 Testing Catalog Endpoints...")
        
        endpoints = [
            ("/catalog/personas", "personas"),
            ("/catalog/categories", "categories")
        ]
        
        success_count = 0
        
        for endpoint, expected_key in endpoints:
            try:
                async with self.session.get(f"{self.api_url}{endpoint}") as response:
                    status = response.status
                    
                    if status == 200:
                        data = await response.json()
                        if expected_key in data:
                            print(f"   ✅ {endpoint}: {len(data[expected_key])} items")
                            success_count += 1
                        else:
                            print(f"   ❌ {endpoint}: missing {expected_key} key")
                    else:
                        print(f"   ❌ {endpoint}: status {status}")
                        
            except Exception as e:
                print(f"   ❌ {endpoint}: error {e}")
        
        if success_count == len(endpoints):
            print(f"✅ All catalog endpoints working")
            return True
        else:
            print(f"❌ {len(endpoints) - success_count} catalog endpoints failed")
            return False
    
    async def test_products_endpoint(self):
        """Test products endpoint (basic check)"""
        print("\n🧪 Testing Products Endpoint...")
        
        try:
            async with self.session.get(f"{self.api_url}/products/") as response:
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                
                if status == 200:
                    print(f"✅ Products endpoint working: {len(data)} products")
                    return True
                else:
                    print(f"❌ Products endpoint failed: {status}")
                    return False
                    
        except Exception as e:
            print(f"❌ Products endpoint error: {e}")
            return False
    
    async def test_categories_endpoint(self):
        """Test categories endpoint (basic check)"""
        print("\n🧪 Testing Categories Endpoint...")
        
        try:
            async with self.session.get(f"{self.api_url}/categories/") as response:
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                
                if status == 200:
                    print(f"✅ Categories endpoint working: {len(data)} categories")
                    return True
                else:
                    print(f"❌ Categories endpoint failed: {status}")
                    return False
                    
        except Exception as e:
            print(f"❌ Categories endpoint error: {e}")
            return False
    
    async def run_smoke_tests(self):
        """Run basic smoke tests"""
        print("🚀 Starting Backend Smoke Tests")
        print("=" * 50)
        
        await self.setup()
        
        test_results = []
        
        # Basic smoke tests
        tests = [
            ("API Root Endpoint", self.test_api_root),
            ("Status Endpoint", self.test_status_endpoint),
            ("Products Endpoint", self.test_products_endpoint),
            ("Categories Endpoint", self.test_categories_endpoint),
            ("Catalog Endpoints", self.test_catalog_endpoints),
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
        print("📊 BACKEND SMOKE TEST RESULTS")
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
            print("\n🎉 Backend is operational - all smoke tests passed!")
            return True
        else:
            print(f"\n⚠️  {failed} test(s) failed - backend may have issues")
            return False

async def main():
    """Main test runner"""
    try:
        test_suite = BackendSmokeTest()
        success = await test_suite.run_smoke_tests()
        return success
    except Exception as e:
        print(f"❌ Smoke test initialization failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)