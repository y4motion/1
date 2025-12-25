import React from 'react';
import HeroSection from './home/HeroSection';
import LiveActivityFeed from './home/LiveActivityFeed';
import TrendingChips from './home/TrendingChips';
import QuickAccessGrid from './home/QuickAccessGrid';
import TestimonialsCarousel from './TestimonialsCarousel';
import ShopByCategory from './home/ShopByCategory';
import HotDealsAndPopular from './home/HotDealsAndPopular';
import LatestArticles from './home/LatestArticles';
import '../styles/glassmorphism.css';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Live Activity Feed */}
      <LiveActivityFeed />

      {/* 3. Trending Chips */}
      <TrendingChips />

      {/* 4. Quick Access Grid */}
      <QuickAccessGrid />

      {/* 5. Testimonials */}
      <TestimonialsCarousel />

      {/* 6. Shop by Category */}
      <ShopByCategory />

      {/* 7. Hot Deals & Popular */}
      <HotDealsAndPopular />

      {/* 8. Latest Articles */}
      <LatestArticles />
    </div>
  );
}
