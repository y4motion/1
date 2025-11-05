# Extended Marketplace Catalog Structure
# Gaming & Tech focused e-commerce categories

MARKETPLACE_CATALOG = {
    "gaming_pcs": {
        "id": "gaming_pcs",
        "name_en": "Gaming PCs",
        "name_ru": "Игровые ПК",
        "icon": "Monitor",
        "subcategories": {
            "pre_built": {
                "name_en": "Pre-Built PCs",
                "name_ru": "Готовые сборки",
                "items": ["Entry Gaming", "Mid-Range Gaming", "High-End Gaming", "Streaming PCs", "VR Ready"]
            },
            "custom_builds": {
                "name_en": "Custom Builds",
                "name_ru": "Кастомные сборки",
                "items": ["Mini-ITX", "Micro-ATX", "ATX", "E-ATX", "Open Frame"]
            },
            "workstations": {
                "name_en": "Workstations",
                "name_ru": "Рабочие станции",
                "items": ["Creator PCs", "3D Rendering", "AI/ML Stations"]
            }
        }
    },
    
    "pc_components": {
        "id": "pc_components",
        "name_en": "PC Components",
        "name_ru": "Комплектующие для ПК",
        "icon": "Cpu",
        "subcategories": {
            "main_components": {
                "name_en": "Main Components",
                "name_ru": "Основные комплектующие",
                "items": [
                    "Processors (CPU)",
                    "Graphics Cards (GPU)",
                    "Motherboards",
                    "RAM Memory",
                    "SSD Drives",
                    "HDD Drives",
                    "Power Supplies (PSU)",
                    "PC Cases",
                    "Cooling Systems"
                ]
            },
            "expansion_devices": {
                "name_en": "Expansion Devices",
                "name_ru": "Устройства расширения",
                "items": [
                    "Sound Cards",
                    "Network Cards",
                    "Capture Cards",
                    "USB/PCIe Controllers",
                    "Storage Adapters"
                ]
            },
            "modding_maintenance": {
                "name_en": "Modding & Maintenance",
                "name_ru": "Моддинг и обслуживание",
                "items": [
                    "RGB Lighting",
                    "Case Fans",
                    "Cable Management",
                    "GPU Brackets",
                    "Thermal Paste",
                    "Dust Filters"
                ]
            },
            "server_components": {
                "name_en": "Server Components",
                "name_ru": "Серверные комплектующие",
                "items": [
                    "Server CPUs",
                    "Server Motherboards",
                    "Server RAM",
                    "Server Cases",
                    "RAID Controllers"
                ]
            }
        }
    },
    
    "peripherals": {
        "id": "peripherals",
        "name_en": "Peripherals",
        "name_ru": "Периферия",
        "icon": "Keyboard",
        "subcategories": {
            "keyboards": {
                "name_en": "Keyboards",
                "name_ru": "Клавиатуры",
                "items": ["Mechanical", "Membrane", "Wireless", "Custom Keycaps", "Numpad"]
            },
            "mice": {
                "name_en": "Mice",
                "name_ru": "Мыши",
                "items": ["Wired Gaming", "Wireless Gaming", "Ergonomic", "Vertical", "Mouse Pads"]
            },
            "headsets": {
                "name_en": "Headsets",
                "name_ru": "Наушники",
                "items": ["Gaming Headsets", "Wireless", "Studio", "In-Ear", "Microphones"]
            },
            "monitors": {
                "name_en": "Monitors",
                "name_ru": "Мониторы",
                "items": ["1080p 144Hz+", "1440p 144Hz+", "4K", "Ultrawide", "Curved", "Monitor Arms"]
            },
            "controllers": {
                "name_en": "Controllers",
                "name_ru": "Контроллеры",
                "items": ["Xbox Controllers", "PlayStation", "Third-Party", "Racing Wheels", "Flight Sticks"]
            },
            "webcams_streaming": {
                "name_en": "Webcams & Streaming",
                "name_ru": "Вебкамеры и стриминг",
                "items": ["Webcams", "Capture Cards", "Stream Decks", "Ring Lights", "Green Screens"]
            }
        }
    },
    
    "gaming_consoles": {
        "id": "gaming_consoles",
        "name_en": "Gaming Consoles",
        "name_ru": "Игровые консоли",
        "icon": "Gamepad2",
        "subcategories": {
            "current_gen": {
                "name_en": "Current Generation",
                "name_ru": "Текущее поколение",
                "items": ["PlayStation 5", "Xbox Series X/S", "Nintendo Switch"]
            },
            "retro_classic": {
                "name_en": "Retro & Classic",
                "name_ru": "Ретро и классика",
                "items": ["PlayStation 4", "Xbox One", "Nintendo 3DS", "Retro Handhelds"]
            },
            "accessories": {
                "name_en": "Console Accessories",
                "name_ru": "Аксессуары для консолей",
                "items": ["Controllers", "Charging Stations", "Headsets", "Storage", "Protective Cases"]
            }
        }
    },
    
    "gaming_laptops": {
        "id": "gaming_laptops",
        "name_en": "Gaming Laptops",
        "name_ru": "Игровые ноутбуки",
        "icon": "Laptop",
        "subcategories": {
            "by_performance": {
                "name_en": "By Performance",
                "name_ru": "По производительности",
                "items": ["Budget Gaming", "Mid-Range Gaming", "High-Performance", "Ultraportable Gaming"]
            },
            "by_brand": {
                "name_en": "By Brand",
                "name_ru": "По бренду",
                "items": ["ASUS ROG", "MSI", "Alienware", "Razer", "Lenovo Legion", "HP Omen"]
            },
            "laptop_accessories": {
                "name_en": "Laptop Accessories",
                "name_ru": "Аксессуары для ноутбуков",
                "items": ["Cooling Pads", "Laptop Stands", "External GPUs", "Docking Stations"]
            }
        }
    },
    
    "mobile_gaming": {
        "id": "mobile_gaming",
        "name_en": "Mobile Gaming",
        "name_ru": "Мобильный гейминг",
        "icon": "📱",
        "subcategories": {
            "gaming_phones": {
                "name_en": "Gaming Smartphones",
                "name_ru": "Игровые смартфоны",
                "items": ["ASUS ROG Phone", "Red Magic", "Lenovo Legion", "High-Performance Phones"]
            },
            "mobile_accessories": {
                "name_en": "Mobile Accessories",
                "name_ru": "Аксессуары",
                "items": ["Gaming Controllers", "Cooling Fans", "Triggers", "Power Banks", "Fast Chargers"]
            },
            "handheld_consoles": {
                "name_en": "Handheld Consoles",
                "name_ru": "Портативные консоли",
                "items": ["Steam Deck", "ASUS ROG Ally", "Lenovo Legion Go", "Retro Handhelds"]
            }
        }
    },
    
    "vr_ar": {
        "id": "vr_ar",
        "name_en": "VR & AR",
        "name_ru": "VR и AR",
        "icon": "🥽",
        "subcategories": {
            "vr_headsets": {
                "name_en": "VR Headsets",
                "name_ru": "VR-шлемы",
                "items": ["Meta Quest", "PlayStation VR", "Valve Index", "HTC Vive", "Standalone VR"]
            },
            "vr_accessories": {
                "name_en": "VR Accessories",
                "name_ru": "VR-аксессуары",
                "items": ["Controllers", "Base Stations", "Prescription Lenses", "Face Cushions", "Cable Management"]
            },
            "ar_devices": {
                "name_en": "AR Devices",
                "name_ru": "AR-устройства",
                "items": ["AR Glasses", "Mixed Reality", "Smart Glasses"]
            }
        }
    },
    
    "networking": {
        "id": "networking",
        "name_en": "Networking",
        "name_ru": "Сетевое оборудование",
        "icon": "🌐",
        "subcategories": {
            "routers_modems": {
                "name_en": "Routers & Modems",
                "name_ru": "Роутеры и модемы",
                "items": ["Gaming Routers", "Mesh Systems", "Wi-Fi 6/6E", "Wi-Fi 7", "Cable Modems"]
            },
            "network_adapters": {
                "name_en": "Network Adapters",
                "name_ru": "Сетевые адаптеры",
                "items": ["PCIe Wi-Fi Cards", "USB Wi-Fi Adapters", "Ethernet Cards", "Powerline Adapters"]
            },
            "switches_hubs": {
                "name_en": "Switches & Hubs",
                "name_ru": "Коммутаторы",
                "items": ["Gigabit Switches", "10GbE Switches", "PoE Switches", "USB Hubs"]
            },
            "cables": {
                "name_en": "Cables",
                "name_ru": "Кабели",
                "items": ["Ethernet Cables", "HDMI 2.1", "DisplayPort", "USB-C", "Fiber Optic"]
            }
        }
    },
    
    "storage": {
        "id": "storage",
        "name_en": "Storage",
        "name_ru": "Накопители",
        "icon": "💾",
        "subcategories": {
            "internal_storage": {
                "name_en": "Internal Storage",
                "name_ru": "Внутренние накопители",
                "items": ["NVMe Gen4/Gen5", "SATA SSD", "HDD 3.5\"", "HDD 2.5\"", "M.2 Drives"]
            },
            "external_storage": {
                "name_en": "External Storage",
                "name_ru": "Внешние накопители",
                "items": ["External SSDs", "External HDDs", "USB Flash Drives", "SD Cards"]
            },
            "nas_storage": {
                "name_en": "NAS & Servers",
                "name_ru": "NAS и серверы",
                "items": ["NAS Units", "NAS HDDs", "DAS Units", "Storage Enclosures"]
            }
        }
    },
    
    "audio_video": {
        "id": "audio_video",
        "name_en": "Audio & Video",
        "name_ru": "Аудио и видео",
        "icon": "🎧",
        "subcategories": {
            "audio_systems": {
                "name_en": "Audio Systems",
                "name_ru": "Аудиосистемы",
                "items": ["Speakers 2.0/2.1", "5.1/7.1 Systems", "Soundbars", "DAC/AMP", "Audio Interfaces"]
            },
            "video_equipment": {
                "name_en": "Video Equipment",
                "name_ru": "Видеооборудование",
                "items": ["Capture Cards", "Video Switchers", "Cameras", "Tripods", "Gimbals"]
            },
            "studio_equipment": {
                "name_en": "Studio Equipment",
                "name_ru": "Студийное оборудование",
                "items": ["Microphones", "Audio Mixers", "Boom Arms", "Pop Filters", "Acoustic Foam"]
            }
        }
    },
    
    "chairs_desks": {
        "id": "chairs_desks",
        "name_en": "Chairs & Desks",
        "name_ru": "Кресла и столы",
        "icon": "🪑",
        "subcategories": {
            "gaming_chairs": {
                "name_en": "Gaming Chairs",
                "name_ru": "Игровые кресла",
                "items": ["Racing Style", "Ergonomic", "Bean Bags", "Rockers", "Chair Accessories"]
            },
            "gaming_desks": {
                "name_en": "Gaming Desks",
                "name_ru": "Игровые столы",
                "items": ["Standard Desks", "L-Shaped", "Standing Desks", "Corner Desks", "Desk Accessories"]
            },
            "ergonomics": {
                "name_en": "Ergonomics",
                "name_ru": "Эргономика",
                "items": ["Monitor Arms", "Keyboard Trays", "Footrests", "Cable Management"]
            }
        }
    },
    
    "smart_home": {
        "id": "smart_home",
        "name_en": "Smart Home",
        "name_ru": "Умный дом",
        "icon": "🏠",
        "subcategories": {
            "smart_lighting": {
                "name_en": "Smart Lighting",
                "name_ru": "Умное освещение",
                "items": ["RGB LED Strips", "Smart Bulbs", "Light Panels", "Bias Lighting"]
            },
            "smart_devices": {
                "name_en": "Smart Devices",
                "name_ru": "Умные устройства",
                "items": ["Smart Speakers", "Smart Displays", "Smart Plugs", "Security Cameras"]
            },
            "automation": {
                "name_en": "Automation",
                "name_ru": "Автоматизация",
                "items": ["Hubs", "Sensors", "Smart Switches", "Remotes"]
            }
        }
    },
    
    "software_services": {
        "id": "software_services",
        "name_en": "Software & Services",
        "name_ru": "ПО и услуги",
        "icon": "⚙️",
        "subcategories": {
            "operating_systems": {
                "name_en": "Operating Systems",
                "name_ru": "Операционные системы",
                "items": ["Windows", "Game Pass", "Xbox Live", "PlayStation Plus"]
            },
            "productivity": {
                "name_en": "Productivity",
                "name_ru": "Продуктивность",
                "items": ["Office Suites", "Antivirus", "VPN Services", "Cloud Storage"]
            },
            "services": {
                "name_en": "Services",
                "name_ru": "Услуги",
                "items": ["PC Building Service", "Tech Support", "Installation", "Overclocking", "Custom Mods"]
            }
        }
    },
    
    "merch_collectibles": {
        "id": "merch_collectibles",
        "name_en": "Merch & Collectibles",
        "name_ru": "Мерч и коллекционное",
        "icon": "🎁",
        "subcategories": {
            "apparel": {
                "name_en": "Apparel",
                "name_ru": "Одежда",
                "items": ["T-Shirts", "Hoodies", "Hats", "Socks", "Gaming Jerseys"]
            },
            "figures_toys": {
                "name_en": "Figures & Toys",
                "name_ru": "Фигурки и игрушки",
                "items": ["Action Figures", "Statues", "Funko Pop", "LEGO Sets"]
            },
            "posters_art": {
                "name_en": "Posters & Art",
                "name_ru": "Постеры и арт",
                "items": ["Posters", "Canvas Prints", "Neon Signs", "Wall Decals"]
            }
        }
    }
}
