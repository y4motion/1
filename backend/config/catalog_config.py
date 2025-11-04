# Catalog Configuration: Categories, Subcategories, Personas, and Specific Filters

# ============================================================================
# PERSONAS CONFIGURATION
# ============================================================================

PERSONAS = {
    "pro_gamer": {
        "id": "pro_gamer",
        "name": "Про-Геймер",
        "name_en": "Pro Gamer",
        "icon": "🎮",
        "description": "Низкая латентность, высокий FPS, конкурентное преимущество",
        "priority_specs": ["refresh_rate_hz", "response_time_ms", "polling_rate_hz", "dpi", "actuation_force_g"]
    },
    "pro_creator": {
        "id": "pro_creator",
        "name": "Про-Криэйтор",
        "name_en": "Pro Creator",
        "icon": "🎨",
        "description": "Производительность, VRAM, цветопередача, качество рендеринга",
        "priority_specs": ["vram_gb", "cuda_cores", "color_gamut", "panel_type", "ram_capacity"]
    },
    "audiophile": {
        "id": "audiophile",
        "name": "Аудиофил",
        "name_en": "Audiophile",
        "icon": "🎧",
        "description": "Качество звука, импеданс, Hi-Res, аналоговый выход",
        "priority_specs": ["driver_type", "impedance_ohm", "hi_res_formats", "dac_chip_model"]
    },
    "smart_home": {
        "id": "smart_home",
        "name": "Умный Дом",
        "name_en": "Smart Home",
        "icon": "🏠",
        "description": "Экосистемы, автоматизация, совместимость устройств",
        "priority_specs": ["smart_protocol", "ecosystem_support", "hub_required"]
    },
    "minimalist": {
        "id": "minimalist",
        "name": "Минималист",
        "name_en": "Minimalist",
        "icon": "✨",
        "description": "Компактность, беспроводное, простота, чистый дизайн",
        "priority_specs": ["connection_type", "form_factor", "weight_g", "cable_management"]
    },
    "rgb_enthusiast": {
        "id": "rgb_enthusiast",
        "name": "RGB Энтузиаст",
        "name_en": "RGB Enthusiast",
        "icon": "🌈",
        "description": "Подсветка, кастомизация, синхронизация RGB",
        "priority_specs": ["rgb_zones", "rgb_sync", "addressable_rgb", "color_support"]
    },
    "next_level": {
        "id": "next_level",
        "name": "Некст Лвл",
        "name_en": "Next Level",
        "icon": "🚀",
        "description": "Новейшие технологии, ранний доступ, передовое железо",
        "priority_specs": ["release_year", "pci_e_version", "wifi_standard", "ddr_generation"]
    },
    "gift_seeker": {
        "id": "gift_seeker",
        "name": "Ищущий Подарок",
        "name_en": "Gift Seeker",
        "icon": "🎁",
        "description": "Популярное, универсальное, готовые наборы, хороший рейтинг",
        "priority_specs": ["average_rating", "purchases_count", "bundle_available"]
    },
    "remote_worker": {
        "id": "remote_worker",
        "name": "Удаленная Работа",
        "name_en": "Remote Worker",
        "icon": "💼",
        "description": "Эргономика, веб-камеры, шумоподавление, комфорт",
        "priority_specs": ["noise_cancelling", "ergonomic_design", "webcam_quality", "microphone_quality"]
    },
    "mobile_setup": {
        "id": "mobile_setup",
        "name": "Портативность",
        "name_en": "Mobile Setup",
        "icon": "🎒",
        "description": "Компактность, батарея, вес, переносимость",
        "priority_specs": ["weight_g", "battery_life_hours", "portable", "screen_diagonal_inch"]
    }
}

# ============================================================================
# MAIN CATEGORIES (100-900)
# ============================================================================

MAIN_CATEGORIES = {
    "100": {
        "id": "100",
        "name": "Компьютеры и Комплектующие",
        "name_en": "PC Components",
        "icon": "💻",
        "subcategories": {
            "110": {"id": "110", "name": "Процессоры (CPU)", "name_en": "Processors"},
            "120": {"id": "120", "name": "Видеокарты (GPU)", "name_en": "Graphics Cards"},
            "130": {"id": "130", "name": "Материнские Платы", "name_en": "Motherboards"},
            "140": {"id": "140", "name": "Оперативная Память (RAM)", "name_en": "RAM"},
            "150": {"id": "150", "name": "Накопители (SSD/HDD)", "name_en": "Storage"},
            "160": {"id": "160", "name": "Системы Охлаждения", "name_en": "Cooling"},
            "170": {"id": "170", "name": "Корпуса", "name_en": "Cases"},
            "180": {"id": "180", "name": "Блоки Питания", "name_en": "PSU"}
        }
    },
    "200": {
        "id": "200",
        "name": "Периферия и Устройства Ввода",
        "name_en": "Peripherals",
        "icon": "⌨️",
        "subcategories": {
            "210": {"id": "210", "name": "Мониторы", "name_en": "Monitors"},
            "220": {"id": "220", "name": "Клавиатуры (Готовые)", "name_en": "Keyboards"},
            "222": {"id": "222", "name": "Компоненты Клавиатуры", "name_en": "Keyboard Components"},
            "230": {"id": "230", "name": "Мыши", "name_en": "Mice"},
            "240": {"id": "240", "name": "Коврики", "name_en": "Mouse Pads"},
            "250": {"id": "250", "name": "Графические Планшеты", "name_en": "Drawing Tablets"},
            "260": {"id": "260", "name": "Веб-камеры", "name_en": "Webcams"}
        }
    },
    "300": {
        "id": "300",
        "name": "Аудио и Звуковое Оборудование",
        "name_en": "Audio Equipment",
        "icon": "🎧",
        "subcategories": {
            "310": {"id": "310", "name": "Наушники", "name_en": "Headphones"},
            "320": {"id": "320", "name": "DAC/AMP", "name_en": "DAC/AMP"},
            "330": {"id": "330", "name": "Микрофоны", "name_en": "Microphones"},
            "340": {"id": "340", "name": "Акустические Системы", "name_en": "Speakers"},
            "350": {"id": "350", "name": "Звуковые Карты", "name_en": "Sound Cards"},
            "360": {"id": "360", "name": "Аудиоинтерфейсы", "name_en": "Audio Interfaces"}
        }
    },
    "400": {
        "id": "400",
        "name": "Сетевое Оборудование",
        "name_en": "Network Equipment",
        "icon": "📡",
        "subcategories": {
            "410": {"id": "410", "name": "Роутеры", "name_en": "Routers"},
            "420": {"id": "420", "name": "Mesh-Системы", "name_en": "Mesh Systems"},
            "430": {"id": "430", "name": "Коммутаторы", "name_en": "Switches"},
            "440": {"id": "440", "name": "Сетевые Адаптеры", "name_en": "Network Adapters"}
        }
    },
    "500": {
        "id": "500",
        "name": "Умный Дом и Освещение",
        "name_en": "Smart Home",
        "icon": "💡",
        "subcategories": {
            "510": {"id": "510", "name": "Умное Освещение", "name_en": "Smart Lighting"},
            "520": {"id": "520", "name": "Центры Управления (Хабы)", "name_en": "Smart Hubs"},
            "530": {"id": "530", "name": "Датчики", "name_en": "Sensors"},
            "540": {"id": "540", "name": "Умные Розетки/Выключатели", "name_en": "Smart Outlets"}
        }
    },
    "600": {
        "id": "600",
        "name": "Эргономика и Рабочее Пространство",
        "name_en": "Ergonomics",
        "icon": "🪑",
        "subcategories": {
            "610": {"id": "610", "name": "Эргономичные Кресла", "name_en": "Ergonomic Chairs"},
            "620": {"id": "620", "name": "Столы с Регулировкой", "name_en": "Adjustable Desks"},
            "630": {"id": "630", "name": "Кронштейны VESA", "name_en": "Monitor Arms"},
            "640": {"id": "640", "name": "Подставки для Запястий", "name_en": "Wrist Rests"},
            "650": {"id": "650", "name": "Кабель-Менеджмент", "name_en": "Cable Management"}
        }
    },
    "700": {
        "id": "700",
        "name": "Портативная Техника",
        "name_en": "Portable Tech",
        "icon": "💼",
        "subcategories": {
            "710": {"id": "710", "name": "Ноутбуки", "name_en": "Laptops"},
            "720": {"id": "720", "name": "Мини-ПК", "name_en": "Mini PCs"},
            "730": {"id": "730", "name": "Портативные Мониторы", "name_en": "Portable Monitors"},
            "740": {"id": "740", "name": "Портативные Консоли", "name_en": "Handheld Consoles"}
        }
    },
    "800": {
        "id": "800",
        "name": "Аксессуары",
        "name_en": "Accessories",
        "icon": "🔌",
        "subcategories": {
            "810": {"id": "810", "name": "Кабели", "name_en": "Cables"},
            "820": {"id": "820", "name": "Зарядные Устройства", "name_en": "Chargers"},
            "830": {"id": "830", "name": "Повербанки", "name_en": "Power Banks"},
            "840": {"id": "840", "name": "ИБП", "name_en": "UPS"}
        }
    },
    "900": {
        "id": "900",
        "name": "Готовые Решения",
        "name_en": "Ready Solutions",
        "icon": "📦",
        "subcategories": {
            "910": {"id": "910", "name": "Готовые ПК", "name_en": "Prebuilt PCs"},
            "920": {"id": "920", "name": "Рабочие Станции", "name_en": "Workstations"},
            "930": {"id": "930", "name": "Комплекты", "name_en": "Bundles"}
        }
    }
}

# ============================================================================
# SPECIFIC FILTERS BY SUBCATEGORY
# ============================================================================

SPECIFIC_FILTERS = {
    # PC Components (100)
    "110": {  # CPU
        "socket_type": {"type": "checkbox", "values": ["LGA 1700", "AM5", "LGA 1200", "AM4"]},
        "core_count": {"type": "range", "min": 4, "max": 32},
        "thread_count": {"type": "range", "min": 4, "max": 64},
        "base_clock_ghz": {"type": "range", "min": 2.0, "max": 5.5},
        "integrated_graphics": {"type": "boolean"}
    },
    "120": {  # GPU
        "vram_gb": {"type": "checkbox", "values": [8, 12, 16, 24, 48]},
        "pci_e_version": {"type": "checkbox", "values": ["4.0", "5.0"]},
        "gpu_length_mm": {"type": "range", "min": 170, "max": 350},
        "cuda_cores": {"type": "range", "min": 2000, "max": 18000},
        "ray_tracing": {"type": "boolean"},
        "dlss_version": {"type": "checkbox", "values": ["2.0", "3.0", "3.5"]}
    },
    "130": {  # Motherboard
        "chipset_model": {"type": "checkbox", "values": ["Z790", "B760", "B650", "X670"]},
        "form_factor": {"type": "checkbox", "values": ["ATX", "mATX", "Mini-ITX", "E-ATX"]},
        "ram_type": {"type": "checkbox", "values": ["DDR4", "DDR5"]},
        "m2_slot_count": {"type": "checkbox", "values": [1, 2, 3, 4]},
        "pci_e_5_support": {"type": "boolean"}
    },
    "150": {  # Storage
        "drive_type": {"type": "checkbox", "values": ["NVMe", "SATA SSD", "HDD"]},
        "form_factor": {"type": "checkbox", "values": ["M.2 2280", "M.2 2242", "2.5\"", "3.5\""]},
        "capacity_gb": {"type": "checkbox", "values": [256, 512, 1024, 2048, 4096]},
        "tbw_rating": {"type": "range", "min": 300, "max": 3000},
        "read_speed_mbps": {"type": "range", "min": 500, "max": 7500}
    },
    
    # Peripherals (200)
    "210": {  # Monitors
        "panel_type": {"type": "checkbox", "values": ["OLED", "IPS", "VA", "TN"]},
        "refresh_rate_hz": {"type": "checkbox", "values": [60, 75, 120, 144, 165, 240, 360]},
        "resolution": {"type": "checkbox", "values": ["1920x1080", "2560x1440", "3840x2160", "5120x1440"]},
        "response_time_ms": {"type": "range", "min": 0.1, "max": 5},
        "color_gamut": {"type": "checkbox", "values": ["100% sRGB", "98% DCI-P3", "Adobe RGB"]},
        "hdr_support": {"type": "checkbox", "values": ["HDR10", "HDR400", "HDR600", "HDR1000"]}
    },
    "222": {  # Keyboard Components
        "switch_type": {"type": "checkbox", "values": ["Linear", "Tactile", "Clicky"]},
        "actuation_force_g": {"type": "range", "min": 35, "max": 80},
        "hot_swap_support": {"type": "boolean"},
        "keycap_profile": {"type": "checkbox", "values": ["Cherry", "OEM", "SA", "XDA", "MT3"]},
        "material": {"type": "checkbox", "values": ["ABS", "PBT", "POM"]}
    },
    "230": {  # Mice
        "connection_type": {"type": "checkbox", "values": ["Wired", "Wireless 2.4GHz", "Bluetooth"]},
        "sensor_dpi": {"type": "range", "min": 16000, "max": 30000},
        "polling_rate_hz": {"type": "checkbox", "values": [125, 500, 1000, 2000, 4000, 8000]},
        "weight_g": {"type": "range", "min": 40, "max": 120},
        "programmable_buttons": {"type": "range", "min": 2, "max": 20}
    },
    
    # Audio (300)
    "310": {  # Headphones
        "driver_type": {"type": "checkbox", "values": ["Dynamic", "Planar Magnetic", "Electrostatic"]},
        "acoustic_design": {"type": "checkbox", "values": ["Open-back", "Closed-back", "Semi-open"]},
        "impedance_ohm": {"type": "range", "min": 16, "max": 600},
        "frequency_response": {"type": "text"},
        "virtual_surround": {"type": "checkbox", "values": ["7.1", "Dolby Atmos", "DTS:X", "Tempest 3D"]},
        "wireless": {"type": "boolean"}
    },
    "320": {  # DAC/AMP
        "dac_chip_model": {"type": "checkbox", "values": ["ESS Sabre ES9038", "AKM AK4499", "Cirrus Logic"]},
        "hi_res_formats": {"type": "checkbox", "values": ["DSD", "MQA", "PCM 32-bit"]},
        "output_balanced": {"type": "boolean"},
        "max_output_power_mw": {"type": "range", "min": 100, "max": 2000}
    },
    "330": {  # Microphones
        "polar_pattern": {"type": "checkbox", "values": ["Cardioid", "Omnidirectional", "Bidirectional", "Shotgun"]},
        "connection_type": {"type": "checkbox", "values": ["USB", "XLR", "USB-C"]},
        "noise_cancelling": {"type": "boolean"},
        "frequency_range": {"type": "text"}
    },
    
    # Network (400)
    "410": {  # Routers
        "wifi_standard": {"type": "checkbox", "values": ["Wi-Fi 6", "Wi-Fi 6E", "Wi-Fi 7"]},
        "band_count": {"type": "checkbox", "values": ["Dual-band", "Tri-band"]},
        "ethernet_port_speed": {"type": "checkbox", "values": ["1G", "2.5G", "10G"]},
        "mlo_support": {"type": "boolean"},
        "mesh_support": {"type": "boolean"}
    },
    
    # Smart Home (500)
    "510": {  # Smart Lighting
        "smart_protocol": {"type": "checkbox", "values": ["Zigbee", "Thread", "Wi-Fi", "Bluetooth"]},
        "ecosystem_support": {"type": "checkbox", "values": ["Matter", "HomeKit", "Alexa", "Google Home"]},
        "color_support": {"type": "checkbox", "values": ["RGB", "RGBW", "Tunable White", "White Only"]},
        "brightness_lumens": {"type": "range", "min": 100, "max": 2000}
    },
    
    # Ergonomics (600)
    "610": {  # Chairs
        "armrest_adjustment": {"type": "checkbox", "values": ["2D", "3D", "4D"]},
        "lumbar_support": {"type": "checkbox", "values": ["Fixed", "Adjustable", "Dynamic"]},
        "mechanism_type": {"type": "checkbox", "values": ["Synchronous", "Knee-tilt", "Multi-tilt"]},
        "max_weight_kg": {"type": "range", "min": 100, "max": 200}
    },
    "620": {  # Desks
        "motor_count": {"type": "checkbox", "values": [1, 2]},
        "height_memory": {"type": "boolean"},
        "height_range_cm": {"type": "text"},
        "desktop_width_cm": {"type": "range", "min": 100, "max": 200}
    },
    
    # Portable (700)
    "710": {  # Laptops
        "screen_diagonal_inch": {"type": "checkbox", "values": [13.3, 14, 15.6, 16, 17.3]},
        "processor_type": {"type": "checkbox", "values": ["Intel Core", "AMD Ryzen", "Apple M"]},
        "weight_kg": {"type": "range", "min": 0.9, "max": 3.0},
        "battery_life_hours": {"type": "range", "min": 5, "max": 24},
        "dedicated_gpu": {"type": "boolean"}
    },
    "740": {  # Handheld Consoles
        "os_type": {"type": "checkbox", "values": ["SteamOS", "Windows", "Android", "Custom"]},
        "screen_type": {"type": "checkbox", "values": ["OLED", "LCD"]},
        "storage_gb": {"type": "checkbox", "values": [64, 128, 256, 512, 1024]}
    }
}

# ============================================================================
# PERSONA FILTER PRESETS
# Automatic filter adjustments when a persona is selected
# ============================================================================

PERSONA_FILTER_PRESETS = {
    "pro_gamer": {
        "210": {  # Monitors
            "refresh_rate_hz": {"min": 144},
            "response_time_ms": {"max": 1}
        },
        "222": {  # Keyboard Components
            "switch_type": ["Linear"],
            "actuation_force_g": {"min": 35, "max": 50}
        },
        "230": {  # Mice
            "polling_rate_hz": {"min": 1000},
            "weight_g": {"max": 80}
        }
    },
    "pro_creator": {
        "120": {  # GPU
            "vram_gb": {"min": 16}
        },
        "210": {  # Monitors
            "color_gamut": ["98% DCI-P3", "Adobe RGB"],
            "panel_type": ["OLED", "IPS"]
        }
    },
    "audiophile": {
        "310": {  # Headphones
            "driver_type": ["Planar Magnetic", "Electrostatic"],
            "impedance_ohm": {"min": 100}
        },
        "320": {  # DAC/AMP
            "hi_res_formats": ["DSD", "PCM 32-bit"]
        }
    },
    "next_level": {
        "120": {  # GPU
            "pci_e_version": ["5.0"]
        },
        "130": {  # Motherboard
            "pci_e_5_support": True
        },
        "410": {  # Routers
            "wifi_standard": ["Wi-Fi 7", "Wi-Fi 6E"]
        }
    }
}
