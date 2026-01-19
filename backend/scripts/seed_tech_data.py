"""
Glassy.Tech - Tech Data Seeder
Генерация 50+ товаров с реальными спецификациями для тестирования совместимости.

Запуск: python -m scripts.seed_tech_data
"""

import asyncio
import random
from datetime import datetime, timezone, timedelta
from typing import List, Dict
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "glassy_tech")


# ==================== PRODUCT DATA ====================

CATEGORIES = [
    {"id": "cpu", "name": "Processors (CPU)", "icon": "🔲", "slug": "cpu"},
    {"id": "gpu", "name": "Graphics Cards (GPU)", "icon": "🎮", "slug": "gpu"},
    {"id": "motherboard", "name": "Motherboards", "icon": "🖥️", "slug": "motherboard"},
    {"id": "ram", "name": "Memory (RAM)", "icon": "💾", "slug": "ram"},
    {"id": "psu", "name": "Power Supplies (PSU)", "icon": "⚡", "slug": "psu"},
    {"id": "case", "name": "Cases", "icon": "📦", "slug": "case"},
    {"id": "storage", "name": "Storage (SSD/HDD)", "icon": "💿", "slug": "storage"},
    {"id": "cooling", "name": "Cooling", "icon": "❄️", "slug": "cooling"},
]

# CPU Products
CPUS = [
    {
        "title": "AMD Ryzen 9 9950X",
        "brand": "AMD",
        "price": 599,
        "specs": {"socket": "AM5", "cores": 16, "threads": 32, "base_clock": 4.3, "boost_clock": 5.7, "tdp": 170, "cache_l3": 64},
        "ai_tags": ["performance", "flagship", "multitasking"],
        "images": ["https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400"]
    },
    {
        "title": "AMD Ryzen 7 9700X",
        "brand": "AMD",
        "price": 359,
        "specs": {"socket": "AM5", "cores": 8, "threads": 16, "base_clock": 3.8, "boost_clock": 5.5, "tdp": 65, "cache_l3": 32},
        "ai_tags": ["performance", "efficient", "gaming"],
        "images": ["https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400"]
    },
    {
        "title": "AMD Ryzen 5 9600X",
        "brand": "AMD",
        "price": 249,
        "specs": {"socket": "AM5", "cores": 6, "threads": 12, "base_clock": 3.9, "boost_clock": 5.4, "tdp": 65, "cache_l3": 32},
        "ai_tags": ["budget", "efficient", "gaming"],
        "images": ["https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400"]
    },
    {
        "title": "AMD Ryzen 5 7600",
        "brand": "AMD",
        "price": 199,
        "specs": {"socket": "AM5", "cores": 6, "threads": 12, "base_clock": 3.8, "boost_clock": 5.1, "tdp": 65, "cache_l3": 32},
        "ai_tags": ["budget", "efficient"],
        "images": ["https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400"]
    },
    {
        "title": "Intel Core i9-14900K",
        "brand": "Intel",
        "price": 549,
        "specs": {"socket": "LGA1700", "cores": 24, "threads": 32, "base_clock": 3.2, "boost_clock": 6.0, "tdp": 253, "cache_l3": 36},
        "ai_tags": ["performance", "flagship", "overclock"],
        "images": ["https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400"]
    },
    {
        "title": "Intel Core i7-14700K",
        "brand": "Intel",
        "price": 399,
        "specs": {"socket": "LGA1700", "cores": 20, "threads": 28, "base_clock": 3.4, "boost_clock": 5.6, "tdp": 253, "cache_l3": 33},
        "ai_tags": ["performance", "gaming", "overclock"],
        "images": ["https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400"]
    },
    {
        "title": "Intel Core i5-14600K",
        "brand": "Intel",
        "price": 299,
        "specs": {"socket": "LGA1700", "cores": 14, "threads": 20, "base_clock": 3.5, "boost_clock": 5.3, "tdp": 181, "cache_l3": 24},
        "ai_tags": ["budget", "gaming", "overclock"],
        "images": ["https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400"]
    },
    {
        "title": "Intel Core i5-14400F",
        "brand": "Intel",
        "price": 199,
        "specs": {"socket": "LGA1700", "cores": 10, "threads": 16, "base_clock": 2.5, "boost_clock": 4.7, "tdp": 65, "cache_l3": 20},
        "ai_tags": ["budget", "efficient"],
        "images": ["https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400"]
    },
]

# GPU Products
GPUS = [
    {
        "title": "NVIDIA GeForce RTX 5090",
        "brand": "NVIDIA",
        "price": 1999,
        "specs": {"vram": 32, "vram_type": "GDDR7", "length_mm": 336, "recommended_psu_wattage": 1000, "tdp": 575, "cuda_cores": 21760},
        "ai_tags": ["flagship", "performance", "4k-gaming"],
        "images": ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400"]
    },
    {
        "title": "NVIDIA GeForce RTX 5080",
        "brand": "NVIDIA",
        "price": 999,
        "specs": {"vram": 16, "vram_type": "GDDR7", "length_mm": 304, "recommended_psu_wattage": 750, "tdp": 360, "cuda_cores": 10752},
        "ai_tags": ["performance", "4k-gaming"],
        "images": ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400"]
    },
    {
        "title": "NVIDIA GeForce RTX 4070 Super",
        "brand": "NVIDIA",
        "price": 599,
        "specs": {"vram": 12, "vram_type": "GDDR6X", "length_mm": 285, "recommended_psu_wattage": 650, "tdp": 220, "cuda_cores": 7168},
        "ai_tags": ["performance", "1440p-gaming"],
        "images": ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400"]
    },
    {
        "title": "NVIDIA GeForce RTX 4060 Ti",
        "brand": "NVIDIA",
        "price": 399,
        "specs": {"vram": 8, "vram_type": "GDDR6", "length_mm": 240, "recommended_psu_wattage": 550, "tdp": 165, "cuda_cores": 4352},
        "ai_tags": ["budget", "1080p-gaming"],
        "images": ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400"]
    },
    {
        "title": "AMD Radeon RX 7900 XTX",
        "brand": "AMD",
        "price": 899,
        "specs": {"vram": 24, "vram_type": "GDDR6", "length_mm": 287, "recommended_psu_wattage": 800, "tdp": 355, "stream_processors": 6144},
        "ai_tags": ["performance", "4k-gaming"],
        "images": ["https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400"]
    },
    {
        "title": "AMD Radeon RX 7800 XT",
        "brand": "AMD",
        "price": 499,
        "specs": {"vram": 16, "vram_type": "GDDR6", "length_mm": 267, "recommended_psu_wattage": 650, "tdp": 263, "stream_processors": 3840},
        "ai_tags": ["performance", "1440p-gaming"],
        "images": ["https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400"]
    },
    {
        "title": "AMD Radeon RX 7600",
        "brand": "AMD",
        "price": 269,
        "specs": {"vram": 8, "vram_type": "GDDR6", "length_mm": 204, "recommended_psu_wattage": 500, "tdp": 165, "stream_processors": 2048},
        "ai_tags": ["budget", "1080p-gaming", "compact"],
        "images": ["https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400"]
    },
]

# Motherboards
MOTHERBOARDS = [
    {
        "title": "ASUS ROG Crosshair X870E Hero",
        "brand": "ASUS",
        "price": 699,
        "specs": {"socket": "AM5", "form_factor": "ATX", "ram_type": "DDR5", "ram_slots": 4, "max_ram": 256, "pcie_slots": 3, "m2_slots": 5},
        "ai_tags": ["flagship", "overclock", "performance"],
        "images": ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"]
    },
    {
        "title": "MSI MAG X870 Tomahawk WiFi",
        "brand": "MSI",
        "price": 329,
        "specs": {"socket": "AM5", "form_factor": "ATX", "ram_type": "DDR5", "ram_slots": 4, "max_ram": 256, "pcie_slots": 2, "m2_slots": 4},
        "ai_tags": ["performance", "value"],
        "images": ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"]
    },
    {
        "title": "Gigabyte B650 Aorus Elite AX",
        "brand": "Gigabyte",
        "price": 229,
        "specs": {"socket": "AM5", "form_factor": "ATX", "ram_type": "DDR5", "ram_slots": 4, "max_ram": 192, "pcie_slots": 2, "m2_slots": 3},
        "ai_tags": ["budget", "value"],
        "images": ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"]
    },
    {
        "title": "ASUS ROG Strix B650E-I Gaming WiFi",
        "brand": "ASUS",
        "price": 349,
        "specs": {"socket": "AM5", "form_factor": "Mini-ITX", "ram_type": "DDR5", "ram_slots": 2, "max_ram": 96, "pcie_slots": 1, "m2_slots": 2},
        "ai_tags": ["compact", "itx", "performance"],
        "images": ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"]
    },
    {
        "title": "ASUS ROG Maximus Z790 Hero",
        "brand": "ASUS",
        "price": 629,
        "specs": {"socket": "LGA1700", "form_factor": "ATX", "ram_type": "DDR5", "ram_slots": 4, "max_ram": 192, "pcie_slots": 3, "m2_slots": 5},
        "ai_tags": ["flagship", "overclock", "performance"],
        "images": ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"]
    },
    {
        "title": "MSI PRO Z790-A WiFi",
        "brand": "MSI",
        "price": 249,
        "specs": {"socket": "LGA1700", "form_factor": "ATX", "ram_type": "DDR5", "ram_slots": 4, "max_ram": 192, "pcie_slots": 2, "m2_slots": 4},
        "ai_tags": ["budget", "value"],
        "images": ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"]
    },
    {
        "title": "Gigabyte B760M DS3H DDR4",
        "brand": "Gigabyte",
        "price": 99,
        "specs": {"socket": "LGA1700", "form_factor": "Micro-ATX", "ram_type": "DDR4", "ram_slots": 2, "max_ram": 64, "pcie_slots": 1, "m2_slots": 2},
        "ai_tags": ["budget", "ddr4", "compact"],
        "images": ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"]
    },
    {
        "title": "ASRock B760I Lightning WiFi",
        "brand": "ASRock",
        "price": 189,
        "specs": {"socket": "LGA1700", "form_factor": "Mini-ITX", "ram_type": "DDR5", "ram_slots": 2, "max_ram": 96, "pcie_slots": 1, "m2_slots": 2},
        "ai_tags": ["compact", "itx", "budget"],
        "images": ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"]
    },
]

# RAM
RAMS = [
    {
        "title": "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6400",
        "brand": "G.Skill",
        "price": 159,
        "specs": {"type": "DDR5", "capacity": 32, "modules": 2, "speed": 6400, "latency": "CL32", "rgb": True},
        "ai_tags": ["performance", "rgb"],
        "images": ["https://images.unsplash.com/photo-1562976540-1502c2145186?w=400"]
    },
    {
        "title": "Corsair Dominator Platinum 64GB (2x32GB) DDR5-6000",
        "brand": "Corsair",
        "price": 289,
        "specs": {"type": "DDR5", "capacity": 64, "modules": 2, "speed": 6000, "latency": "CL30", "rgb": True},
        "ai_tags": ["performance", "flagship", "workstation"],
        "images": ["https://images.unsplash.com/photo-1562976540-1502c2145186?w=400"]
    },
    {
        "title": "Kingston Fury Beast 32GB (2x16GB) DDR5-5600",
        "brand": "Kingston",
        "price": 99,
        "specs": {"type": "DDR5", "capacity": 32, "modules": 2, "speed": 5600, "latency": "CL36", "rgb": False},
        "ai_tags": ["budget", "value"],
        "images": ["https://images.unsplash.com/photo-1562976540-1502c2145186?w=400"]
    },
    {
        "title": "Corsair Vengeance LPX 32GB (2x16GB) DDR4-3600",
        "brand": "Corsair",
        "price": 69,
        "specs": {"type": "DDR4", "capacity": 32, "modules": 2, "speed": 3600, "latency": "CL18", "rgb": False},
        "ai_tags": ["budget", "ddr4", "low-profile"],
        "images": ["https://images.unsplash.com/photo-1562976540-1502c2145186?w=400"]
    },
    {
        "title": "G.Skill Ripjaws V 16GB (2x8GB) DDR4-3200",
        "brand": "G.Skill",
        "price": 39,
        "specs": {"type": "DDR4", "capacity": 16, "modules": 2, "speed": 3200, "latency": "CL16", "rgb": False},
        "ai_tags": ["budget", "ddr4"],
        "images": ["https://images.unsplash.com/photo-1562976540-1502c2145186?w=400"]
    },
]

# PSU
PSUS = [
    {
        "title": "Corsair RM1000x (2024)",
        "brand": "Corsair",
        "price": 189,
        "specs": {"wattage": 1000, "efficiency": "80+ Gold", "modular": "Full", "form_factor": "ATX"},
        "ai_tags": ["performance", "silent", "flagship"],
        "images": ["https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"]
    },
    {
        "title": "Seasonic Focus GX-850",
        "brand": "Seasonic",
        "price": 139,
        "specs": {"wattage": 850, "efficiency": "80+ Gold", "modular": "Full", "form_factor": "ATX"},
        "ai_tags": ["performance", "reliable"],
        "images": ["https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"]
    },
    {
        "title": "EVGA SuperNOVA 750 G7",
        "brand": "EVGA",
        "price": 109,
        "specs": {"wattage": 750, "efficiency": "80+ Gold", "modular": "Full", "form_factor": "ATX"},
        "ai_tags": ["performance", "value"],
        "images": ["https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"]
    },
    {
        "title": "Corsair CX650M",
        "brand": "Corsair",
        "price": 79,
        "specs": {"wattage": 650, "efficiency": "80+ Bronze", "modular": "Semi", "form_factor": "ATX"},
        "ai_tags": ["budget", "value"],
        "images": ["https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"]
    },
    {
        "title": "be quiet! Pure Power 12 M 550W",
        "brand": "be quiet!",
        "price": 69,
        "specs": {"wattage": 550, "efficiency": "80+ Gold", "modular": "Full", "form_factor": "ATX"},
        "ai_tags": ["budget", "silent", "compact"],
        "images": ["https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"]
    },
    {
        "title": "Corsair SF750 Platinum",
        "brand": "Corsair",
        "price": 179,
        "specs": {"wattage": 750, "efficiency": "80+ Platinum", "modular": "Full", "form_factor": "SFX"},
        "ai_tags": ["compact", "itx", "performance"],
        "images": ["https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"]
    },
]

# Cases
CASES = [
    {
        "title": "Lian Li O11 Dynamic EVO",
        "brand": "Lian Li",
        "price": 169,
        "specs": {"form_factor_support": ["ATX", "Micro-ATX", "Mini-ITX"], "max_gpu_length": 420, "max_cpu_cooler_height": 167, "drive_bays_35": 4, "radiator_support": "360mm"},
        "ai_tags": ["performance", "airflow", "showcase"],
        "images": ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400"]
    },
    {
        "title": "NZXT H7 Flow",
        "brand": "NZXT",
        "price": 129,
        "specs": {"form_factor_support": ["ATX", "Micro-ATX", "Mini-ITX"], "max_gpu_length": 400, "max_cpu_cooler_height": 185, "drive_bays_35": 2, "radiator_support": "360mm"},
        "ai_tags": ["performance", "airflow"],
        "images": ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400"]
    },
    {
        "title": "Fractal Design North",
        "brand": "Fractal Design",
        "price": 139,
        "specs": {"form_factor_support": ["ATX", "Micro-ATX", "Mini-ITX"], "max_gpu_length": 355, "max_cpu_cooler_height": 170, "drive_bays_35": 2, "radiator_support": "280mm"},
        "ai_tags": ["aesthetic", "silent", "wood"],
        "images": ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400"]
    },
    {
        "title": "Corsair 4000D Airflow",
        "brand": "Corsair",
        "price": 104,
        "specs": {"form_factor_support": ["ATX", "Micro-ATX", "Mini-ITX"], "max_gpu_length": 360, "max_cpu_cooler_height": 170, "drive_bays_35": 2, "radiator_support": "360mm"},
        "ai_tags": ["budget", "airflow", "value"],
        "images": ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400"]
    },
    {
        "title": "SSUPD Meshroom S",
        "brand": "SSUPD",
        "price": 139,
        "specs": {"form_factor_support": ["Mini-ITX"], "max_gpu_length": 335, "max_cpu_cooler_height": 73, "drive_bays_35": 0, "radiator_support": "280mm"},
        "ai_tags": ["compact", "itx", "mesh"],
        "images": ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400"]
    },
    {
        "title": "NR200P MAX",
        "brand": "Cooler Master",
        "price": 399,
        "specs": {"form_factor_support": ["Mini-ITX"], "max_gpu_length": 336, "max_cpu_cooler_height": 153, "drive_bays_35": 2, "radiator_support": "280mm", "included_psu": 850, "included_aio": "280mm"},
        "ai_tags": ["compact", "itx", "premium", "all-in-one"],
        "images": ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400"]
    },
]

# Storage
STORAGE = [
    {
        "title": "Samsung 990 Pro 2TB",
        "brand": "Samsung",
        "price": 179,
        "specs": {"type": "NVMe SSD", "capacity_gb": 2000, "interface": "PCIe 4.0", "read_speed": 7450, "write_speed": 6900, "form_factor": "M.2"},
        "ai_tags": ["performance", "flagship"],
        "images": ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400"]
    },
    {
        "title": "WD Black SN850X 1TB",
        "brand": "Western Digital",
        "price": 89,
        "specs": {"type": "NVMe SSD", "capacity_gb": 1000, "interface": "PCIe 4.0", "read_speed": 7300, "write_speed": 6300, "form_factor": "M.2"},
        "ai_tags": ["performance", "gaming"],
        "images": ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400"]
    },
    {
        "title": "Crucial P3 Plus 1TB",
        "brand": "Crucial",
        "price": 59,
        "specs": {"type": "NVMe SSD", "capacity_gb": 1000, "interface": "PCIe 4.0", "read_speed": 5000, "write_speed": 4200, "form_factor": "M.2"},
        "ai_tags": ["budget", "value"],
        "images": ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400"]
    },
]

# Cooling
COOLING = [
    {
        "title": "Noctua NH-D15 chromax.black",
        "brand": "Noctua",
        "price": 109,
        "specs": {"type": "Air Cooler", "height": 165, "tdp_support": 250, "fan_size": 140, "noise_level": 24.6},
        "ai_tags": ["performance", "silent", "flagship"],
        "images": ["https://images.unsplash.com/photo-1591799265444-d66432b91588?w=400"]
    },
    {
        "title": "be quiet! Dark Rock Pro 5",
        "brand": "be quiet!",
        "price": 89,
        "specs": {"type": "Air Cooler", "height": 168, "tdp_support": 270, "fan_size": 135, "noise_level": 24.3},
        "ai_tags": ["performance", "silent"],
        "images": ["https://images.unsplash.com/photo-1591799265444-d66432b91588?w=400"]
    },
    {
        "title": "Thermalright Peerless Assassin 120 SE",
        "brand": "Thermalright",
        "price": 35,
        "specs": {"type": "Air Cooler", "height": 155, "tdp_support": 200, "fan_size": 120, "noise_level": 25.6},
        "ai_tags": ["budget", "value"],
        "images": ["https://images.unsplash.com/photo-1591799265444-d66432b91588?w=400"]
    },
    {
        "title": "ARCTIC Liquid Freezer III 360",
        "brand": "ARCTIC",
        "price": 109,
        "specs": {"type": "AIO Liquid", "radiator_size": 360, "tdp_support": 350, "pump_noise": 22.0},
        "ai_tags": ["performance", "liquid", "silent"],
        "images": ["https://images.unsplash.com/photo-1591799265444-d66432b91588?w=400"]
    },
    {
        "title": "Corsair iCUE H150i Elite",
        "brand": "Corsair",
        "price": 189,
        "specs": {"type": "AIO Liquid", "radiator_size": 360, "tdp_support": 350, "pump_noise": 25.0, "rgb": True},
        "ai_tags": ["performance", "liquid", "rgb"],
        "images": ["https://images.unsplash.com/photo-1591799265444-d66432b91588?w=400"]
    },
]


# Test users for activity simulation
TEST_USERS = [
    {"username": "tech_enthusiast", "email": "tech@test.com"},
    {"username": "budget_gamer", "email": "budget@test.com"},
    {"username": "pc_builder_pro", "email": "builder@test.com"},
    {"username": "silent_seeker", "email": "silent@test.com"},
    {"username": "rgb_lover", "email": "rgb@test.com"},
    {"username": "itx_master", "email": "itx@test.com"},
    {"username": "workstation_user", "email": "work@test.com"},
    {"username": "first_time_buyer", "email": "newbie@test.com"},
    {"username": "upgrade_hunter", "email": "upgrade@test.com"},
    {"username": "deal_finder", "email": "deals@test.com"},
]


async def seed_database():
    """Main seeding function"""
    print("🚀 Starting Glassy.Tech Database Seeder...")
    print(f"📦 Connecting to: {MONGO_URL}")
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing data (optional)
    print("\n🧹 Clearing existing data...")
    await db.products.delete_many({})
    await db.categories.delete_many({})
    await db.view_history.delete_many({})
    # Don't delete users - they might have real accounts
    
    # 1. Seed Categories
    print("\n📁 Seeding categories...")
    for cat in CATEGORIES:
        await db.categories.update_one(
            {"id": cat["id"]},
            {"$set": cat},
            upsert=True
        )
    print(f"   ✅ {len(CATEGORIES)} categories")
    
    # 2. Seed Products
    print("\n📦 Seeding products...")
    all_products = []
    product_id_map = {}
    
    product_groups = [
        ("cpu", CPUS),
        ("gpu", GPUS),
        ("motherboard", MOTHERBOARDS),
        ("ram", RAMS),
        ("psu", PSUS),
        ("case", CASES),
        ("storage", STORAGE),
        ("cooling", COOLING),
    ]
    
    for category_id, products in product_groups:
        for product in products:
            doc = {
                "title": product["title"],
                "brand": product["brand"],
                "price": product["price"],
                "original_price": int(product["price"] * 1.15),  # 15% "discount"
                "category": category_id,
                "category_id": category_id,
                "specs": product["specs"],
                "ai_tags": product.get("ai_tags", []),
                "tags": product.get("ai_tags", []),
                "images": product.get("images", []),
                "stock": random.randint(5, 50),
                "rating": round(random.uniform(4.0, 5.0), 1),
                "reviews_count": random.randint(10, 500),
                "views": random.randint(100, 5000),
                "description": f"High-quality {category_id} from {product['brand']}. {product['title']}.",
                "created_at": datetime.now(timezone.utc),
                "is_active": True,
            }
            result = await db.products.insert_one(doc)
            product_id_map[product["title"]] = str(result.inserted_id)
            all_products.append({"id": str(result.inserted_id), **doc})
    
    print(f"   ✅ {len(all_products)} products seeded")
    
    # 3. Seed Test Users
    print("\n👥 Seeding test users...")
    user_ids = []
    for user_data in TEST_USERS:
        existing = await db.users.find_one({"email": user_data["email"]})
        if existing:
            user_ids.append(str(existing["_id"]))
        else:
            doc = {
                "username": user_data["username"],
                "email": user_data["email"],
                "password_hash": "test_hash_not_for_login",
                "xp": random.randint(100, 5000),
                "level": random.randint(1, 10),
                "created_at": datetime.now(timezone.utc) - timedelta(days=random.randint(30, 365)),
                "is_test_user": True,
            }
            result = await db.users.insert_one(doc)
            user_ids.append(str(result.inserted_id))
    print(f"   ✅ {len(user_ids)} test users")
    
    # 4. Generate View History (for Rules Engine testing)
    print("\n👁️ Generating view history for Rules Engine...")
    view_count = 0
    
    for user_id in user_ids:
        # Random viewing behavior
        num_views = random.randint(5, 25)
        
        # Some users focus on specific categories (for "hesitation" rule)
        focused = random.random() > 0.5
        focused_category = random.choice(["gpu", "cpu", "motherboard"]) if focused else None
        
        for _ in range(num_views):
            if focused and random.random() > 0.3:
                # 70% chance to view focused category
                category_products = [p for p in all_products if p["category"] == focused_category]
            else:
                category_products = all_products
            
            product = random.choice(category_products)
            
            view_doc = {
                "user_id": user_id,
                "product_id": product["id"],
                "product_title": product["title"],
                "category": product["category"],
                "price": product["price"],
                "timestamp": datetime.now(timezone.utc) - timedelta(
                    hours=random.randint(1, 72),
                    minutes=random.randint(0, 59)
                ),
                "duration_seconds": random.randint(10, 300),
            }
            await db.view_history.insert_one(view_doc)
            view_count += 1
    
    print(f"   ✅ {view_count} view history records")
    
    # 5. Generate some carts (for "big_spender" and "cart_abandonment" rules)
    print("\n🛒 Generating cart data...")
    cart_count = 0
    for user_id in user_ids[:5]:  # First 5 users have carts
        cart_items = random.sample(all_products, random.randint(1, 4))
        cart_total = sum(p["price"] for p in cart_items)
        
        cart_doc = {
            "user_id": user_id,
            "items": [
                {
                    "product_id": p["id"],
                    "title": p["title"],
                    "price": p["price"],
                    "quantity": 1,
                    "category": p["category"],
                }
                for p in cart_items
            ],
            "total": cart_total,
            "created_at": datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 24)),
            "updated_at": datetime.now(timezone.utc),
        }
        await db.carts.update_one(
            {"user_id": user_id},
            {"$set": cart_doc},
            upsert=True
        )
        cart_count += 1
    print(f"   ✅ {cart_count} carts with items")
    
    # 6. Summary
    print("\n" + "=" * 50)
    print("🎉 SEEDING COMPLETE!")
    print("=" * 50)
    print(f"   📁 Categories: {len(CATEGORIES)}")
    print(f"   📦 Products: {len(all_products)}")
    print(f"   👥 Test Users: {len(user_ids)}")
    print(f"   👁️ View History: {view_count}")
    print(f"   🛒 Carts: {cart_count}")
    print("\n💡 Test accounts (password won't work, use for API testing):")
    for u in TEST_USERS[:3]:
        print(f"   - {u['email']}")
    print("\n🧪 Ready for Rules Engine testing!")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
