#!/usr/bin/env python3
"""
Focused Price Alert System Test
Tests the newly implemented Price Drop Alert System endpoints
"""

import asyncio
import aiohttp
import json

# Backend URL
API_URL = "https://kinetic-dot.preview.emergentagent.com/api"

class PriceAlertTest:
    def __init__(self):
        self.session = None
        self.token = None
        self.alert_id = None
        self.test_product_id = "8529f6c3-b561-462c-a602-f6fcb66edddc"
        
    async def setup(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
    
    async def cleanup(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
    
    async def login(self):
        """Login with test credentials"""
        print("🔐 Testing Login...")
        
        login_data = {
            "email": "testalert@example.com",
            "password": "TestAlert123"
        }
        
        try:
            async with self.session.post(
                f"{API_URL}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                if status == 200:
                    self.token = data["access_token"]
                    print(f"✅ Login successful")
                    return True
                else:
                    print(f"❌ Login failed: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    async def test_verify_product(self):
        """Verify test product exists"""
        print(f"\n📦 Testing Product Verification...")
        
        try:
            async with self.session.get(f"{API_URL}/products/{self.test_product_id}/") as response:
                status = response.status
                data = await response.json()
                
                if status == 200:
                    print(f"✅ Product found: {data.get('title', 'Unknown')} - ${data.get('price', 0)}")
                    return True
                else:
                    print(f"❌ Product not found: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Product verification error: {e}")
            return False
    
    async def test_get_alerts(self):
        """Test getting all user alerts"""
        print(f"\n📋 Testing Get All Alerts...")
        
        try:
            async with self.session.get(
                f"{API_URL}/price-alerts/",
                headers={"Authorization": f"Bearer {self.token}"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                if status == 200:
                    alerts = data.get("data", [])
                    print(f"✅ Retrieved {len(alerts)} alerts")
                    
                    if alerts:
                        alert = alerts[0]
                        print(f"   First alert: Product {alert.get('product_id', 'Unknown')}")
                        print(f"   Target price: ${alert.get('target_price', 'N/A')}")
                        print(f"   Drop percent: {alert.get('price_drop_percent', 'N/A')}%")
                        print(f"   Enabled: {alert.get('enabled', False)}")
                        
                        # Check product enrichment
                        if "product" in alert:
                            product = alert["product"]
                            print(f"   Product enriched: {product.get('title', 'Unknown')}")
                        
                        self.alert_id = alert.get("id")
                    
                    return True
                else:
                    print(f"❌ Failed to get alerts: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Get alerts error: {e}")
            return False
    
    async def test_get_product_alert(self):
        """Test getting alert for specific product"""
        print(f"\n🎯 Testing Get Product Alert...")
        
        try:
            async with self.session.get(
                f"{API_URL}/price-alerts/product/{self.test_product_id}",
                headers={"Authorization": f"Bearer {self.token}"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                if status == 200:
                    alert = data.get("data")
                    if alert:
                        print(f"✅ Found alert for product")
                        print(f"   Alert ID: {alert.get('id', 'Unknown')}")
                        print(f"   Target price: ${alert.get('target_price', 'N/A')}")
                        print(f"   Drop percent: {alert.get('price_drop_percent', 'N/A')}%")
                        self.alert_id = alert.get("id")
                    else:
                        print(f"✅ No alert found for product (valid response)")
                    return True
                else:
                    print(f"❌ Failed to get product alert: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Get product alert error: {e}")
            return False
    
    async def test_toggle_alert(self):
        """Test toggling alert enabled status"""
        if not self.alert_id:
            print(f"\n⚠️  Skipping toggle test - no alert ID available")
            return True
            
        print(f"\n🔄 Testing Toggle Alert...")
        
        try:
            async with self.session.patch(
                f"{API_URL}/price-alerts/{self.alert_id}/toggle",
                headers={"Authorization": f"Bearer {self.token}"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                if status == 200:
                    enabled = data.get("enabled", False)
                    print(f"✅ Alert toggled to: {'Enabled' if enabled else 'Disabled'}")
                    return True
                else:
                    print(f"❌ Failed to toggle alert: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Toggle alert error: {e}")
            return False
    
    async def test_create_alert_simple(self):
        """Test creating a simple alert using curl-like approach"""
        print(f"\n➕ Testing Create Alert (Simple)...")
        
        # First, let's try to create an alert with minimal data
        alert_data = {
            "product_id": self.test_product_id,
            "target_price": 350.0,
            "notification_methods": {"push": True, "email": False, "sms": False},
            "enabled": True
        }
        
        try:
            async with self.session.post(
                f"{API_URL}/price-alerts/",
                json=alert_data,
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                }
            ) as response:
                
                status = response.status
                print(f"   Create alert status: {status}")
                
                if status in [200, 201]:
                    data = await response.json()
                    print(f"✅ Alert created/updated successfully")
                    print(f"   Response: {data}")
                    return True
                else:
                    # Try to get response text for debugging
                    try:
                        data = await response.json()
                        print(f"❌ Failed to create alert: {data}")
                    except:
                        text = await response.text()
                        print(f"❌ Failed to create alert (status {status}): {text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Create alert error: {e}")
            return False
    
    async def test_delete_alert(self):
        """Test deleting alert"""
        if not self.alert_id:
            print(f"\n⚠️  Skipping delete test - no alert ID available")
            return True
            
        print(f"\n🗑️  Testing Delete Alert...")
        
        try:
            async with self.session.delete(
                f"{API_URL}/price-alerts/{self.alert_id}",
                headers={"Authorization": f"Bearer {self.token}"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                if status == 200:
                    print(f"✅ Alert deleted successfully")
                    print(f"   Message: {data.get('message', 'Deleted')}")
                    return True
                else:
                    print(f"❌ Failed to delete alert: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Delete alert error: {e}")
            return False
    
    async def run_tests(self):
        """Run all price alert tests"""
        print("🚀 Starting Price Alert System Tests")
        print("=" * 50)
        
        await self.setup()
        
        tests = [
            ("Login", self.login),
            ("Verify Product", self.test_verify_product),
            ("Get All Alerts", self.test_get_alerts),
            ("Get Product Alert", self.test_get_product_alert),
            ("Toggle Alert", self.test_toggle_alert),
            ("Create Alert", self.test_create_alert_simple),
            ("Delete Alert", self.test_delete_alert),
        ]
        
        results = []
        
        for test_name, test_func in tests:
            try:
                result = await test_func()
                results.append((test_name, result))
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {e}")
                results.append((test_name, False))
        
        await self.cleanup()
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 PRICE ALERT TEST RESULTS")
        print("=" * 50)
        
        passed = 0
        failed = 0
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name}")
            if result:
                passed += 1
            else:
                failed += 1
        
        print(f"\n📈 Total: {len(results)} tests")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed == 0:
            print("\n🎉 All price alert tests passed!")
            return True
        else:
            print(f"\n⚠️  {failed} test(s) failed")
            return False

async def main():
    """Main test runner"""
    try:
        test_suite = PriceAlertTest()
        success = await test_suite.run_tests()
        return success
    except Exception as e:
        print(f"❌ Test suite initialization failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)