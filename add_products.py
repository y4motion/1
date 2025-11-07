import requests
import json

API_URL = "http://localhost:8001/api"

# Sample products
products = [
    {
        "title": "Razer Deathadder V3 Pro",
        "description": "Professional wireless gaming mouse with RGB lighting and ergonomic design",
        "price": 149.99,
        "original_price": 179.99,
        "category_id": "200",
        "sub_category_id": "202",
        "images": ["https://images.unsplash.com/photo-1527814050087-3793815479db?w=800"],
        "stock": 15,
        "personas": ["pro_gamer"],
        "specific_attributes": {
            "polling_rate_hz": 8000,
            "weight_g": 63,
            "sensor": "Focus Pro 30K",
            "connectivity": "Wireless"
        },
        "tags": ["gaming", "wireless", "rgb"],
        "seller_id": "seller1"
    },
    {
        "title": "Corsair K100 RGB",
        "description": "Premium mechanical gaming keyboard with per-key RGB",
        "price": 229.99,
        "original_price": 249.99,
        "category_id": "200",
        "sub_category_id": "201",
        "images": ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"],
        "stock": 8,
        "personas": ["pro_gamer", "rgb_enthusiast"],
        "specific_attributes": {
            "switch_type": "Cherry MX Speed",
            "layout": "Full-size",
            "connectivity": "Wired"
        },
        "tags": ["gaming", "mechanical", "rgb"],
        "seller_id": "seller1"
    },
    {
        "title": "Samsung Odyssey G9",
        "description": "49\" Curved Gaming Monitor with 240Hz refresh rate",
        "price": 1299.99,
        "original_price": 1499.99,
        "category_id": "200",
        "sub_category_id": "204",
        "images": ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"],
        "stock": 5,
        "personas": ["pro_gamer", "pro_creator"],
        "specific_attributes": {
            "screen_size": "49 inch",
            "resolution": "5120x1440",
            "refresh_rate": "240Hz",
            "panel_type": "VA"
        },
        "tags": ["gaming", "ultrawide", "curved"],
        "seller_id": "seller1"
    },
    {
        "title": "NVIDIA RTX 4090",
        "description": "Flagship graphics card for maximum gaming performance",
        "price": 1599.99,
        "category_id": "100",
        "sub_category_id": "102",
        "images": ["https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800"],
        "stock": 3,
        "personas": ["pro_gamer", "pro_creator"],
        "specific_attributes": {
            "vram": "24GB",
            "memory_type": "GDDR6X",
            "tdp": "450W"
        },
        "tags": ["gpu", "nvidia", "rtx"],
        "seller_id": "seller1"
    },
    {
        "title": "AMD Ryzen 9 7950X",
        "description": "16-core processor for gaming and content creation",
        "price": 549.99,
        "category_id": "100",
        "sub_category_id": "101",
        "images": ["https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800"],
        "stock": 12,
        "personas": ["pro_gamer", "pro_creator"],
        "specific_attributes": {
            "cores": 16,
            "threads": 32,
            "base_clock": "4.5 GHz",
            "boost_clock": "5.7 GHz"
        },
        "tags": ["cpu", "amd", "ryzen"],
        "seller_id": "seller1"
    },
    {
        "title": "Sony WH-1000XM5",
        "description": "Industry-leading noise cancelling headphones",
        "price": 399.99,
        "category_id": "300",
        "sub_category_id": "301",
        "images": ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"],
        "stock": 20,
        "personas": ["audiophile", "remote_worker"],
        "specific_attributes": {
            "driver_size": "30mm",
            "anc": "Yes",
            "battery": "30 hours"
        },
        "tags": ["headphones", "wireless", "anc"],
        "seller_id": "seller2"
    }
]

print("Adding products to database...")

# First, register a seller user
register_data = {
    "email": "seller@test.com",
    "username": "TestSeller",
    "password": "password123",
    "is_seller": True
}

try:
    # Try to register
    r = requests.post(f"{API_URL}/auth/register", json=register_data)
    if r.status_code == 201:
        token = r.json()["access_token"]
        print(f"✅ Seller registered, token: {token[:20]}...")
    else:
        # Try to login
        r = requests.post(f"{API_URL}/auth/login", json={
            "email": "seller@test.com",
            "password": "password123"
        })
        token = r.json()["access_token"]
        print(f"✅ Seller logged in, token: {token[:20]}...")
except Exception as e:
    print(f"❌ Auth error: {e}")
    token = None

# Add products
headers = {"Authorization": f"Bearer {token}"} if token else {}

added = 0
for product in products:
    try:
        r = requests.post(f"{API_URL}/products/", json=product, headers=headers)
        if r.status_code == 201:
            added += 1
            print(f"✅ Added: {product['title']}")
        else:
            print(f"❌ Failed to add {product['title']}: {r.status_code} - {r.text[:100]}")
    except Exception as e:
        print(f"❌ Error adding {product['title']}: {e}")

print(f"\n✅ Successfully added {added}/{len(products)} products")

# Verify
try:
    r = requests.get(f"{API_URL}/products/")
    count = len(r.json())
    print(f"✅ Total products in database: {count}")
except Exception as e:
    print(f"❌ Error verifying: {e}")
