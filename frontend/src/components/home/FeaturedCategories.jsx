import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Monitor, Keyboard, Headphones, Mouse, Smartphone } from 'lucide-react';

const categories = [
  { id: 'gpu', name: 'Graphics Cards', icon: Cpu, color: '#a855f7', count: 1234 },
  { id: 'monitors', name: 'Monitors', icon: Monitor, color: '#3b82f6', count: 856 },
  { id: 'keyboards', name: 'Keyboards', icon: Keyboard, color: '#10b981', count: 2341 },
  { id: 'audio', name: 'Audio', icon: Headphones, color: '#f59e0b', count: 1567 },
  { id: 'peripherals', name: 'Peripherals', icon: Mouse, color: '#ef4444', count: 3421 },
  { id: 'mobile', name: 'Mobile', icon: Smartphone, color: '#8b5cf6', count: 987 }
];

export default function FeaturedCategories() {
  return (
    <section style={{ margin: '4rem 0' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '2rem', textAlign: 'center' }}>
        Shop by Category
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.5rem'
      }}>
        {categories.map((category, index) => {
          const Icon = category.icon;
          
          return (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '2rem', background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px',
                textDecoration: 'none', transition: 'all 0.3s',
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '80px', height: '80px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', borderRadius: '16px', marginBottom: '1rem',
                background: `${category.color}15`, transition: 'transform 0.3s'
              }}>
                <Icon size={32} style={{ color: category.color }} />
              </div>
              
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', margin: '0 0 0.5rem 0' }}>
                {category.name}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                {category.count.toLocaleString()} products
              </p>
            </Link>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
