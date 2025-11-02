#!/usr/bin/env python3
"""
Backend Marketplace API Test Suite
Tests all backend APIs for gaming/tech marketplace including:
- Authentication (JWT)
- Product Management
- Categories
- Reviews & Ratings
- Questions & Answers
- Shopping Cart
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

class MarketplaceTestSuite:
    def __init__(self):
        self.base_url = get_backend_url()
        if not self.base_url:
            raise Exception("Could not determine backend URL")
        
        self.api_url = f"{self.base_url}/api"
        self.session = None
        
        # Test users
        self.normal_user_data = {
            "email": f"buyer_{uuid.uuid4().hex[:8]}@gamemarket.com",
            "username": f"buyer_{uuid.uuid4().hex[:8]}",
            "password": "SecurePass123!"
        }
        self.seller_user_data = {
            "email": f"seller_{uuid.uuid4().hex[:8]}@gamemarket.com",
            "username": f"seller_{uuid.uuid4().hex[:8]}",
            "password": "SecurePass123!"
        }
        
        # Tokens
        self.normal_token = None
        self.seller_token = None
        
        # Test data IDs
        self.category_id = None
        self.product_id = None
        self.review_id = None
        self.question_id = None
        
        print(f"🔧 Testing backend at: {self.api_url}")
        print(f"👤 Normal user: {self.normal_user_data['email']}")
        print(f"🛒 Seller user: {self.seller_user_data['email']}")
    
    async def setup(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
    
    async def cleanup(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
    
    # ==================== AUTHENTICATION TESTS ====================
    
    async def test_register_users(self):
        """Test registering both normal and seller users"""
        print("\n🧪 Testing User Registration...")
        
        # Register normal user
        try:
            async with self.session.post(
                f"{self.api_url}/auth/register",
                json=self.normal_user_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Normal user status: {status}")
                
                if status == 201:
                    self.normal_token = data["access_token"]
                    normal_user_id = data["user"]["id"]
                    print(f"✅ Normal user registered: {data['user']['username']}")
                else:
                    print(f"❌ Normal user registration failed: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Normal user registration error: {e}")
            return False
        
        # Register seller user
        try:
            async with self.session.post(
                f"{self.api_url}/auth/register",
                json=self.seller_user_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Seller user status: {status}")
                
                if status == 201:
                    self.seller_token = data["access_token"]
                    seller_user_id = data["user"]["id"]
                    print(f"✅ Seller user registered: {data['user']['username']}")
                    
                    # Manually set seller flag in database (simulating admin action)
                    await self.set_user_as_seller(seller_user_id)
                    
                    return True
                else:
                    print(f"❌ Seller user registration failed: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Seller user registration error: {e}")
            return False
    
    async def set_user_as_seller(self, user_id: str):
        """Helper to set user as seller (simulating admin action)"""
        # This would normally be done through admin interface
        # For testing, we'll use direct database access simulation
        print(f"   🔧 Setting user {user_id} as seller (simulated admin action)")
        return True
    
    # ==================== CATEGORY TESTS ====================
    
    async def test_create_category_as_normal_user(self):
        """Test creating category as normal user (should fail)"""
        print("\n🧪 Testing Category Creation (Normal User - Should Fail)...")
        
        category_data = {
            "name": "Gaming Laptops",
            "slug": "gaming-laptops",
            "description": "High-performance gaming laptops",
            "icon": "💻"
        }
        
        try:
            async with self.session.post(
                f"{self.api_url}/categories/",
                json=category_data,
                headers={
                    "Authorization": f"Bearer {self.normal_token}",
                    "Content-Type": "application/json"
                }
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                
                if status == 403:
                    print(f"✅ Category creation correctly rejected for normal user")
                    return True
                else:
                    print(f"❌ Should return 403 for normal user, got {status}")
                    return False
                    
        except Exception as e:
            print(f"❌ Category creation test error: {e}")
            return False
    
    async def test_get_categories(self):
        """Test getting all categories"""
        print("\n🧪 Testing Get Categories...")
        
        try:
            async with self.session.get(f"{self.api_url}/categories/") as response:
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                
                if status == 200:
                    print(f"✅ Categories retrieved: {len(data)} categories")
                    return True
                else:
                    print(f"❌ Failed to get categories: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Get categories test error: {e}")
            return False
    
    # ==================== PRODUCT TESTS ====================
    
    async def test_create_product_as_normal_user(self):
        """Test creating product as normal user (should fail)"""
        print("\n🧪 Testing Product Creation (Normal User - Should Fail)...")
        
        product_data = {
            "title": "Gaming Laptop RTX 4090",
            "description": "High-end gaming laptop with RTX 4090",
            "category_id": "test-category-id",
            "price": 2999.99,
            "currency": "USD",
            "stock": 5,
            "images": [{"url": "https://example.com/laptop.jpg", "is_primary": True}],
            "specifications": [
                {"name": "GPU", "value": "RTX 4090"},
                {"name": "RAM", "value": "32GB DDR5"}
            ],
            "tags": ["gaming", "laptop", "rtx"]
        }
        
        try:
            async with self.session.post(
                f"{self.api_url}/products/",
                json=product_data,
                headers={
                    "Authorization": f"Bearer {self.normal_token}",
                    "Content-Type": "application/json"
                }
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                
                if status == 403:
                    print(f"✅ Product creation correctly rejected for normal user")
                    return True
                else:
                    print(f"❌ Should return 403 for normal user, got {status}")
                    return False
                    
        except Exception as e:
            print(f"❌ Product creation test error: {e}")
            return False
    
    async def test_create_product_as_seller(self):
        """Test creating product as seller user"""
        print("\n🧪 Testing Product Creation (Seller User)...")
        
        product_data = {
            "title": "Gaming Mechanical Keyboard",
            "description": "RGB mechanical keyboard perfect for gaming",
            "category_id": "gaming-peripherals",
            "price": 149.99,
            "currency": "USD",
            "stock": 25,
            "images": [{"url": "https://example.com/keyboard.jpg", "is_primary": True}],
            "specifications": [
                {"name": "Switch Type", "value": "Cherry MX Blue"},
                {"name": "Backlight", "value": "RGB"}
            ],
            "tags": ["gaming", "keyboard", "mechanical", "rgb"]
        }
        
        try:
            async with self.session.post(
                f"{self.api_url}/products/",
                json=product_data,
                headers={
                    "Authorization": f"Bearer {self.seller_token}",
                    "Content-Type": "application/json"
                }
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                
                if status == 201:
                    self.product_id = data["id"]
                    print(f"✅ Product created successfully: {data['title']}")
                    print(f"   Product ID: {self.product_id}")
                    return True
                else:
                    print(f"❌ Product creation failed: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Product creation test error: {e}")
            return False
    
    async def test_get_products_with_filters(self):
        """Test getting products with various filters"""
        print("\n🧪 Testing Product Listing with Filters...")
        
        test_cases = [
            ("Basic listing", {}),
            ("Pagination", {"skip": 0, "limit": 10}),
            ("Search", {"search": "gaming"}),
            ("Price range", {"min_price": 100, "max_price": 200}),
            ("Sort by price", {"sort_by": "price", "sort_order": "asc"})
        ]
        
        success_count = 0
        
        for test_name, params in test_cases:
            try:
                async with self.session.get(
                    f"{self.api_url}/products/",
                    params=params
                ) as response:
                    
                    status = response.status
                    data = await response.json()
                    
                    if status == 200:
                        print(f"   ✅ {test_name}: {len(data)} products")
                        success_count += 1
                    else:
                        print(f"   ❌ {test_name} failed: {status}")
                        
            except Exception as e:
                print(f"   ❌ {test_name} error: {e}")
        
        return success_count == len(test_cases)
    
    async def test_get_single_product(self):
        """Test getting single product and view increment"""
        print("\n🧪 Testing Single Product Retrieval...")
        
        if not self.product_id:
            print("❌ No product ID available for testing")
            return False
        
        try:
            # Get product first time
            async with self.session.get(f"{self.api_url}/products/{self.product_id}/") as response:
                status = response.status
                data = await response.json()
                
                print(f"   Status: {status}")
                
                if status == 200:
                    initial_views = data.get("views", 0)
                    print(f"✅ Product retrieved: {data['title']}")
                    print(f"   Initial views: {initial_views}")
                    
                    # Get product second time to test view increment
                    async with self.session.get(f"{self.api_url}/products/{self.product_id}/") as response2:
                        data2 = await response2.json()
                        new_views = data2.get("views", 0)
                        
                        if new_views > initial_views:
                            print(f"✅ View count incremented: {initial_views} → {new_views}")
                            return True
                        else:
                            print(f"❌ View count not incremented: {initial_views} → {new_views}")
                            return False
                else:
                    print(f"❌ Failed to get product: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Single product test error: {e}")
            return False
    
    async def test_wishlist_toggle(self):
        """Test adding/removing product from wishlist"""
        print("\n🧪 Testing Wishlist Toggle...")
        
        if not self.product_id:
            print("❌ No product ID available for wishlist testing")
            return False
        
        try:
            # Add to wishlist
            async with self.session.post(
                f"{self.api_url}/products/{self.product_id}/wishlist/",
                headers={"Authorization": f"Bearer {self.normal_token}"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Add to wishlist status: {status}")
                
                if status == 200 and data.get("in_wishlist"):
                    print(f"✅ Added to wishlist: {data['message']}")
                    
                    # Remove from wishlist
                    async with self.session.post(
                        f"{self.api_url}/products/{self.product_id}/wishlist/",
                        headers={"Authorization": f"Bearer {self.normal_token}"}
                    ) as response2:
                        
                        data2 = await response2.json()
                        
                        if response2.status == 200 and not data2.get("in_wishlist"):
                            print(f"✅ Removed from wishlist: {data2['message']}")
                            return True
                        else:
                            print(f"❌ Failed to remove from wishlist: {data2}")
                            return False
                else:
                    print(f"❌ Failed to add to wishlist: {data}")
                    return False
                    
        except Exception as e:
            print(f"❌ Wishlist test error: {e}")
            return False
    
    # ==================== SHOPPING CART TESTS ====================
    
    async def test_cart_operations(self):
        """Test complete cart workflow"""
        print("\n🧪 Testing Shopping Cart Operations...")
        
        if not self.product_id:
            print("❌ No product ID available for cart testing")
            return False
        
        try:
            # Get empty cart
            async with self.session.get(
                f"{self.api_url}/cart/",
                headers={"Authorization": f"Bearer {self.normal_token}"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Get cart status: {status}")
                
                if status != 200:
                    print(f"❌ Failed to get cart: {data}")
                    return False
                
                print(f"✅ Cart retrieved: {data.get('item_count', 0)} items")
            
            # Add item to cart
            add_data = {"product_id": self.product_id, "quantity": 2}
            async with self.session.post(
                f"{self.api_url}/cart/items/",
                json=add_data,
                headers={
                    "Authorization": f"Bearer {self.normal_token}",
                    "Content-Type": "application/json"
                }
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Add to cart status: {status}")
                
                if status != 200:
                    print(f"❌ Failed to add to cart: {data}")
                    return False
                
                print(f"✅ Added to cart: {data.get('item_count', 0)} items, total: ${data.get('total', 0)}")
            
            # Update cart item quantity
            update_data = {"quantity": 3}
            async with self.session.put(
                f"{self.api_url}/cart/items/{self.product_id}/",
                json=update_data,
                headers={
                    "Authorization": f"Bearer {self.normal_token}",
                    "Content-Type": "application/json"
                }
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Update cart status: {status}")
                
                if status != 200:
                    print(f"❌ Failed to update cart: {data}")
                    return False
                
                print(f"✅ Cart updated: {data.get('item_count', 0)} items")
            
            # Remove item from cart
            async with self.session.delete(
                f"{self.api_url}/cart/items/{self.product_id}/",
                headers={"Authorization": f"Bearer {self.normal_token}"}
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Remove from cart status: {status}")
                
                if status != 200:
                    print(f"❌ Failed to remove from cart: {data}")
                    return False
                
                print(f"✅ Item removed: {data.get('item_count', 0)} items remaining")
                return True
                    
        except Exception as e:
            print(f"❌ Cart operations test error: {e}")
            return False
    
    # ==================== REVIEW TESTS ====================
    
    async def test_review_workflow(self):
        """Test complete review workflow"""
        print("\n🧪 Testing Review System...")
        
        if not self.product_id:
            print("❌ No product ID available for review testing")
            return False
        
        try:
            # Create review
            review_data = {
                "product_id": self.product_id,
                "rating": 4.5,
                "title": "Great gaming keyboard!",
                "comment": "Excellent build quality and responsive keys. Perfect for gaming sessions."
            }
            
            async with self.session.post(
                f"{self.api_url}/reviews",
                json=review_data,
                headers={
                    "Authorization": f"Bearer {self.normal_token}",
                    "Content-Type": "application/json"
                }
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Create review status: {status}")
                
                if status == 201:
                    self.review_id = data["id"]
                    print(f"✅ Review created: {data['title']}")
                    print(f"   Rating: {data['rating']}/5")
                else:
                    print(f"❌ Failed to create review: {data}")
                    return False
            
            # Test duplicate review (should fail)
            async with self.session.post(
                f"{self.api_url}/reviews/",
                json=review_data,
                headers={
                    "Authorization": f"Bearer {self.normal_token}",
                    "Content-Type": "application/json"
                }
            ) as response:
                
                status = response.status
                
                if status == 400:
                    print(f"✅ Duplicate review correctly rejected")
                else:
                    print(f"❌ Duplicate review should be rejected with 400")
            
            # Get product reviews
            async with self.session.get(f"{self.api_url}/reviews/product/{self.product_id}/") as response:
                status = response.status
                data = await response.json()
                
                print(f"   Get reviews status: {status}")
                
                if status == 200:
                    print(f"✅ Reviews retrieved: {len(data)} reviews")
                else:
                    print(f"❌ Failed to get reviews: {data}")
                    return False
            
            # React to review (helpful)
            if self.review_id:
                async with self.session.post(
                    f"{self.api_url}/reviews/{self.review_id}/reaction/?reaction_type=helpful",
                    headers={"Authorization": f"Bearer {self.seller_token}"}
                ) as response:
                    
                    status = response.status
                    data = await response.json()
                    
                    print(f"   Review reaction status: {status}")
                    
                    if status == 200:
                        print(f"✅ Review marked as helpful")
                        return True
                    else:
                        print(f"❌ Failed to react to review: {data}")
                        return False
            
            return True
                    
        except Exception as e:
            print(f"❌ Review workflow test error: {e}")
            return False
    
    # ==================== QUESTION & ANSWER TESTS ====================
    
    async def test_question_answer_workflow(self):
        """Test complete Q&A workflow"""
        print("\n🧪 Testing Question & Answer System...")
        
        if not self.product_id:
            print("❌ No product ID available for Q&A testing")
            return False
        
        try:
            # Ask question
            question_data = {
                "product_id": self.product_id,
                "question": "Does this keyboard work with Mac computers?"
            }
            
            async with self.session.post(
                f"{self.api_url}/questions/",
                json=question_data,
                headers={
                    "Authorization": f"Bearer {self.normal_token}",
                    "Content-Type": "application/json"
                }
            ) as response:
                
                status = response.status
                data = await response.json()
                
                print(f"   Ask question status: {status}")
                
                if status == 201:
                    self.question_id = data["id"]
                    print(f"✅ Question asked: {data['question']}")
                else:
                    print(f"❌ Failed to ask question: {data}")
                    return False
            
            # Get product questions
            async with self.session.get(f"{self.api_url}/questions/product/{self.product_id}/") as response:
                status = response.status
                data = await response.json()
                
                print(f"   Get questions status: {status}")
                
                if status == 200:
                    print(f"✅ Questions retrieved: {len(data)} questions")
                else:
                    print(f"❌ Failed to get questions: {data}")
                    return False
            
            # Answer question (as seller)
            if self.question_id:
                answer_data = {
                    "content": "Yes, this keyboard is fully compatible with Mac computers. It works great with macOS!"
                }
                
                async with self.session.post(
                    f"{self.api_url}/questions/{self.question_id}/answers",
                    json=answer_data,
                    headers={
                        "Authorization": f"Bearer {self.seller_token}",
                        "Content-Type": "application/json"
                    }
                ) as response:
                    
                    status = response.status
                    data = await response.json()
                    
                    print(f"   Answer question status: {status}")
                    
                    if status == 201:
                        print(f"✅ Question answered by seller")
                        return True
                    else:
                        print(f"❌ Failed to answer question: {data}")
                        return False
            
            return True
                    
        except Exception as e:
            print(f"❌ Q&A workflow test error: {e}")
            return False
    
    async def run_all_tests(self):
        """Run complete marketplace API test suite"""
        print("🚀 Starting Marketplace Backend API Tests")
        print("=" * 60)
        
        await self.setup()
        
        test_results = []
        
        # Test sequence - following the workflow from review request
        tests = [
            ("User Registration (Normal + Seller)", self.test_register_users),
            ("Category Creation (Normal User - Should Fail)", self.test_create_category_as_normal_user),
            ("Get Categories", self.test_get_categories),
            ("Product Creation (Normal User - Should Fail)", self.test_create_product_as_normal_user),
            ("Product Creation (Seller User)", self.test_create_product_as_seller),
            ("Product Listing with Filters", self.test_get_products_with_filters),
            ("Single Product Retrieval & View Increment", self.test_get_single_product),
            ("Wishlist Toggle", self.test_wishlist_toggle),
            ("Shopping Cart Operations", self.test_cart_operations),
            ("Review System Workflow", self.test_review_workflow),
            ("Question & Answer Workflow", self.test_question_answer_workflow),
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
        print("\n" + "=" * 60)
        print("📊 MARKETPLACE API TEST RESULTS SUMMARY")
        print("=" * 60)
        
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
            print("\n🎉 All marketplace API tests passed!")
            return True
        else:
            print(f"\n⚠️  {failed} test(s) failed - marketplace APIs need attention")
            return False

async def main():
    """Main test runner"""
    try:
        test_suite = MarketplaceTestSuite()
        success = await test_suite.run_all_tests()
        return success
    except Exception as e:
        print(f"❌ Test suite initialization failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)