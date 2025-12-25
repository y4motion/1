import React from 'react';
import HeroSection from './home/HeroSection';
import LiveActivityFeed from './home/LiveActivityFeed';
import TrendingChips from './home/TrendingChips';
import QuickAccessGrid from './home/QuickAccessGrid';
import TestimonialsCarousel from './TestimonialsCarousel';
import FeaturedCategories from './home/FeaturedCategories';
import TrendingSection from './home/TrendingSection';
import LatestArticles from './home/LatestArticles';
import '../styles/glassmorphism.css';

const HomePage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* Hero Section */}
      <HeroSection />

      {/* Live Activity Feed - FOMO effect */}
      <LiveActivityFeed />

      {/* Trending Chips - Hot searches */}
      <TrendingChips />

      {/* Quick Access Grid - Navigation cards */}
      <QuickAccessGrid />

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* Content Sections */}
      <div style={{ padding: '0 2rem' }}>
        {/* Featured Categories */}
        <FeaturedCategories />

        {/* Trending Products */}
        <TrendingSection />

        {/* Latest Articles */}
        <LatestArticles />
      </div>
    </div>
  );
};

export default HomePage;
