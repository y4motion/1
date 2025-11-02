#!/usr/bin/env python3
"""
Simplified Marketplace API Test Suite
Tests all backend APIs for gaming/tech marketplace
"""

import asyncio
import aiohttp
import json
import uuid

# Get backend URL from frontend .env
def get_backend_url():
    try:
        with open("/app/frontend/.env", 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"❌ Error reading frontend .env: {e}")
        return None

async def run_marketplace_tests():
    """Run comprehensive marketplace API tests"""
    backend_url = get_backend_url()
    if not backend_url:
        print("❌ Could not determine backend URL")
        return False
    
    api_url = f"{backend_url}/api"
    print(f"🔧 Testing backend at: {api_url}")
    
    # Test data
    test_id = uuid.uuid4().hex[:8]
    normal_user = {
        "email": f"buyer_{test_id}@gamemarket.com",
        "username": f"buyer_{test_id}",
        "password": "SecurePass123!"
    }
    seller_user = {
        "email": f"seller_{test_id}@gamemarket.com", 
        "username": f"seller_{test_id}",
        "password": "SecurePass123!"
    }
    
    normal_token = None
    seller_token = None
    product_id = None
    category_id = None
    review_id = None
    question_id = None
    
    test_results = []
    
    async with aiohttp.ClientSession() as session:
        
        # 1. Register normal user
        print("\n🧪 Testing Normal User Registration...")
        try:
            async with session.post(f"{api_url}/auth/register", json=normal_user) as response:
                if response.status == 201:
                    data = await response.json()
                    normal_token = data["access_token"]
                    print(f"✅ Normal user registered: {data['user']['username']}")
                    test_results.append(("Normal User Registration", True))
                else:
                    print(f"❌ Normal user registration failed: {response.status}")
                    test_results.append(("Normal User Registration", False))
        except Exception as e:
            print(f"❌ Normal user registration error: {e}")
            test_results.append(("Normal User Registration", False))
        
        # 2. Register seller user
        print("\n🧪 Testing Seller User Registration...")
        try:
            async with session.post(f"{api_url}/auth/register", json=seller_user) as response:
                if response.status == 201:
                    data = await response.json()
                    seller_token = data["access_token"]
                    seller_user_id = data["user"]["id"]
                    print(f"✅ Seller user registered: {data['user']['username']}")
                    
                    # Update seller permissions in database (simulating admin action)
                    print("   🔧 Updating seller permissions...")
                    # This would be done via admin interface in real app
                    
                    test_results.append(("Seller User Registration", True))
                else:
                    print(f"❌ Seller user registration failed: {response.status}")
                    test_results.append(("Seller User Registration", False))
        except Exception as e:
            print(f"❌ Seller user registration error: {e}")
            test_results.append(("Seller User Registration", False))
        
        # Update seller permissions in database
        if seller_token:
            import sys
            sys.path.append('/app/backend')
            from database import db
            
            try:
                result = await db.users.update_one(
                    {'email': seller_user['email']},
                    {'$set': {'is_seller': True, 'is_admin': True}}
                )
                print(f"   ✅ Seller permissions updated: {result.modified_count} user(s)")
                
                # Re-login to get updated token
                async with session.post(f"{api_url}/auth/login", json={"email": seller_user["email"], "password": seller_user["password"]}) as response:
                    if response.status == 200:
                        data = await response.json()
                        seller_token = data["access_token"]
                        print(f"   ✅ Seller token refreshed with permissions")
            except Exception as e:
                print(f"   ❌ Error updating seller permissions: {e}")
        
        # 3. Test category creation (normal user - should fail)
        print("\n🧪 Testing Category Creation (Normal User - Should Fail)...")
        if normal_token:
            try:
                category_data = {
                    "name": "Gaming Peripherals",
                    "slug": "gaming-peripherals",
                    "description": "Gaming mice, keyboards, headsets",
                    "icon": "🎮"
                }
                
                async with session.post(
                    f"{api_url}/categories/",
                    json=category_data,
                    headers={"Authorization": f"Bearer {normal_token}"}
                ) as response:
                    
                    if response.status == 403:
                        print("✅ Category creation correctly rejected for normal user")
                        test_results.append(("Category Creation Rejection", True))
                    else:
                        print(f"❌ Expected 403, got {response.status}")
                        test_results.append(("Category Creation Rejection", False))
            except Exception as e:
                print(f"❌ Category creation test error: {e}")
                test_results.append(("Category Creation Rejection", False))
        
        # 4. Test product creation (normal user - should fail)
        print("\n🧪 Testing Product Creation (Normal User - Should Fail)...")
        if normal_token:
            try:
                product_data = {
                    "title": "Gaming Mouse",
                    "description": "High-precision gaming mouse",
                    "category_id": "gaming-peripherals",
                    "price": 79.99,
                    "stock": 10
                }
                
                async with session.post(
                    f"{api_url}/products/",
                    json=product_data,
                    headers={"Authorization": f"Bearer {normal_token}"}
                ) as response:
                    
                    if response.status == 403:
                        print("✅ Product creation correctly rejected for normal user")
                        test_results.append(("Product Creation Rejection", True))
                    else:
                        print(f"❌ Expected 403, got {response.status}")
                        test_results.append(("Product Creation Rejection", False))
            except Exception as e:
                print(f"❌ Product creation test error: {e}")
                test_results.append(("Product Creation Rejection", False))
        
        # 5. Test product creation (seller user)
        print("\n🧪 Testing Product Creation (Seller User)...")
        if seller_token:
            try:
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
                
                async with session.post(
                    f"{api_url}/products/",
                    json=product_data,
                    headers={"Authorization": f"Bearer {seller_token}"}
                ) as response:
                    
                    if response.status == 201:
                        data = await response.json()
                        product_id = data["id"]
                        print(f"✅ Product created: {data['title']} (ID: {product_id})")
                        test_results.append(("Product Creation Success", True))
                    else:
                        error_data = await response.json()
                        print(f"❌ Product creation failed: {response.status} - {error_data}")
                        test_results.append(("Product Creation Success", False))
            except Exception as e:
                print(f"❌ Product creation test error: {e}")
                test_results.append(("Product Creation Success", False))
        
        # 6. Test product listing
        print("\n🧪 Testing Product Listing...")
        try:
            async with session.get(f"{api_url}/products/") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Products listed: {len(data)} products")
                    test_results.append(("Product Listing", True))
                else:
                    print(f"❌ Product listing failed: {response.status}")
                    test_results.append(("Product Listing", False))
        except Exception as e:
            print(f"❌ Product listing error: {e}")
            test_results.append(("Product Listing", False))
        
        # 7. Test single product retrieval
        print("\n🧪 Testing Single Product Retrieval...")
        if product_id:
            try:
                async with session.get(f"{api_url}/products/{product_id}/") as response:
                    if response.status == 200:
                        data = await response.json()
                        print(f"✅ Product retrieved: {data['title']}")
                        test_results.append(("Single Product Retrieval", True))
                    else:
                        print(f"❌ Product retrieval failed: {response.status}")
                        test_results.append(("Single Product Retrieval", False))
            except Exception as e:
                print(f"❌ Product retrieval error: {e}")
                test_results.append(("Single Product Retrieval", False))
        
        # 8. Test wishlist toggle
        print("\n🧪 Testing Wishlist Toggle...")
        if product_id and normal_token:
            try:
                async with session.post(
                    f"{api_url}/products/{product_id}/wishlist",
                    headers={"Authorization": f"Bearer {normal_token}"}
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        print(f"✅ Wishlist toggle: {data['message']}")
                        test_results.append(("Wishlist Toggle", True))
                    else:
                        print(f"❌ Wishlist toggle failed: {response.status}")
                        test_results.append(("Wishlist Toggle", False))
            except Exception as e:
                print(f"❌ Wishlist toggle error: {e}")
                test_results.append(("Wishlist Toggle", False))
        
        # 9. Test cart operations
        print("\n🧪 Testing Cart Operations...")
        if product_id and normal_token:
            try:
                # Add to cart
                add_data = {"product_id": product_id, "quantity": 2}
                async with session.post(
                    f"{api_url}/cart/items",
                    json=add_data,
                    headers={"Authorization": f"Bearer {normal_token}"}
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        print(f"✅ Added to cart: {data.get('item_count', 0)} items")
                        test_results.append(("Cart Operations", True))
                    else:
                        print(f"❌ Add to cart failed: {response.status}")
                        test_results.append(("Cart Operations", False))
            except Exception as e:
                print(f"❌ Cart operations error: {e}")
                test_results.append(("Cart Operations", False))
        
        # 10. Test review creation
        print("\n🧪 Testing Review Creation...")
        if product_id and normal_token:
            try:
                review_data = {
                    "product_id": product_id,
                    "rating": 4.5,
                    "title": "Great keyboard!",
                    "comment": "Excellent build quality and responsive keys."
                }
                
                async with session.post(
                    f"{api_url}/reviews/",
                    json=review_data,
                    headers={"Authorization": f"Bearer {normal_token}"}
                ) as response:
                    
                    if response.status == 201:
                        data = await response.json()
                        review_id = data["id"]
                        print(f"✅ Review created: {data['title']}")
                        test_results.append(("Review Creation", True))
                    else:
                        error_data = await response.json()
                        print(f"❌ Review creation failed: {response.status} - {error_data}")
                        test_results.append(("Review Creation", False))
            except Exception as e:
                print(f"❌ Review creation error: {e}")
                test_results.append(("Review Creation", False))
        
        # 11. Test Q&A
        print("\n🧪 Testing Question & Answer...")
        if product_id and normal_token and seller_token:
            try:
                # Ask question
                question_data = {
                    "product_id": product_id,
                    "question": "Does this keyboard work with Mac computers?"
                }
                
                async with session.post(
                    f"{api_url}/questions/",
                    json=question_data,
                    headers={"Authorization": f"Bearer {normal_token}"}
                ) as response:
                    
                    if response.status == 201:
                        data = await response.json()
                        question_id = data["id"]
                        print(f"✅ Question asked: {data['question']}")
                        
                        # Answer question (as seller)
                        answer_data = {"content": "Yes, fully compatible with Mac!"}
                        async with session.post(
                            f"{api_url}/questions/{question_id}/answers",
                            json=answer_data,
                            headers={"Authorization": f"Bearer {seller_token}"}
                        ) as answer_response:
                            
                            if answer_response.status == 201:
                                print(f"✅ Question answered by seller")
                                test_results.append(("Q&A System", True))
                            else:
                                print(f"❌ Answer failed: {answer_response.status}")
                                test_results.append(("Q&A System", False))
                    else:
                        print(f"❌ Question creation failed: {response.status}")
                        test_results.append(("Q&A System", False))
            except Exception as e:
                print(f"❌ Q&A system error: {e}")
                test_results.append(("Q&A System", False))
    
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

if __name__ == "__main__":
    success = asyncio.run(run_marketplace_tests())
    exit(0 if success else 1)