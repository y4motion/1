import React, { Suspense, useEffect, useState } from 'react';
import './App.css';
import './styles/glassmorphism.css';
import './styles/minimalMod.css';
import './styles/layout.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import { GlassyChatBar } from './components/chat';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import Breadcrumbs from './components/Breadcrumbs';
import PageTransition from './components/PageTransition';
import MobileBottomNav from './components/MobileBottomNav';

// Lazy load all page components for code splitting
const HomePage = React.lazy(() => import('./components/HomePage'));
const CategoryPage = React.lazy(() => import('./components/CategoryPage'));
const ProductPage = React.lazy(() => import('./components/ProductPage'));
const MarketplacePage = React.lazy(() => import('./components/MarketplacePage'));
const PCBuilderPage = React.lazy(() => import('./components/PCBuilderPage'));
const ModPage = React.lazy(() => import('./components/ModPage'));
const ProductDetailPage = React.lazy(() => import('./components/ProductDetailPage'));
const CartPage = React.lazy(() => import('./components/CartPage'));
const CheckoutPage = React.lazy(() => import('./components/CheckoutPage'));
const UserProfilePage = React.lazy(() => import('./components/UserProfilePage'));
const NotificationsPage = React.lazy(() => import('./components/NotificationsPage'));
const FeedPage = React.lazy(() => import('./components/FeedPage'));
const ArticlesPage = React.lazy(() => import('./components/ArticlesPage'));
const CreatorsPage = React.lazy(() => import('./components/CreatorsPage'));
const VotingPage = React.lazy(() => import('./components/VotingPage'));
const RatingPage = React.lazy(() => import('./components/RatingPage'));
const GroupBuyPage = React.lazy(() => import('./components/GroupBuyPage'));
const GlassySwapPage = React.lazy(() => import('./components/GlassySwapPage'));

// Redirect component for /chat routes - opens GlassyChatBar on home
const ChatRedirect = () => {
  useEffect(() => {
    // Dispatch custom event to open chat bar
    window.dispatchEvent(new CustomEvent('openGlassyChat', { detail: { tab: 'ai' } }));
  }, []);
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <ToastProvider>
              <ErrorBoundary>
              <div className="App">
                <BrowserRouter>
                  <Header />
                  
                  {/* Main content area */}
                  <main className="main-content">
                    <Breadcrumbs />
                    <GlassyChatBar />
                    
                    <Suspense fallback={<LoadingScreen />}>
                      <PageTransition>
                        <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/pc-builder" element={<PCBuilderPage />} />
                    <Route path="/mod" element={<ModPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/chat" element={<ChatRedirect />} />
                    <Route path="/chat/:conversationId" element={<ChatRedirect />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />

                    {/* New social/community routes */}
                    <Route path="/feed" element={<FeedPage />} />
                    <Route path="/articles" element={<ArticlesPage />} />
                    <Route path="/creators" element={<CreatorsPage />} />
                    <Route path="/voting" element={<VotingPage />} />
                    <Route path="/rating" element={<RatingPage />} />
                    <Route path="/groupbuy" element={<GroupBuyPage />} />

                    <Route path="/bookmarks" element={<PlaceholderPage title="BOOKMARKS" />} />
                    <Route path="/lists" element={<PlaceholderPage title="LISTS" />} />
                    <Route path="/communities" element={<PlaceholderPage title="COMMUNITIES" />} />

                    {/* Placeholder routes for navigation links */}
                    <Route path="/catalog" element={<PlaceholderPage title="CATALOG" />} />
                    <Route path="/pro-gamer" element={<PlaceholderPage title="PRO GAMER" />} />
                    <Route path="/creator" element={<PlaceholderPage title="CREATOR" />} />
                    <Route path="/user" element={<PlaceholderPage title="USER" />} />
                    <Route path="/glassy-swap" element={<GlassySwapPage />} />
                    <Route path="/glassy-swap/:id" element={<GlassySwapPage />} />
                    <Route
                      path="/best-products"
                      element={<PlaceholderPage title="BEST PRODUCTS" />}
                    />
                    <Route path="/builds" element={<PlaceholderPage title="BUILDS" />} />
                    <Route path="/team" element={<PlaceholderPage title="TEAM" />} />
                    <Route path="/join-guild" element={<PlaceholderPage title="JOIN GUILD" />} />
                    <Route
                      path="/developments"
                      element={<PlaceholderPage title="PERSONAL DEVELOPMENTS" />}
                    />
                    <Route
                      path="/contact"
                      element={<PlaceholderPage title="CONTACT INFORMATION" />}
                    />
                    <Route path="/support" element={<PlaceholderPage title="SUPPORT" />} />
                    <Route path="/suggest" element={<PlaceholderPage title="SUGGEST AN IDEA" />} />
                    <Route path="/news" element={<PlaceholderPage title="NEWS" />} />
                    <Route path="/downloads" element={<PlaceholderPage title="DOWNLOADS" />} />
                    <Route path="/privacy" element={<PlaceholderPage title="PRIVACY POLICY" />} />
                    <Route path="/cookies" element={<PlaceholderPage title="COOKIE POLICY" />} />
                    <Route
                      path="/accessibility"
                      element={<PlaceholderPage title="ACCESSIBILITY" />}
                    />
                    <Route path="/ads" element={<PlaceholderPage title="ADVERTISING INFO" />} />
                    </Routes>
                      </PageTransition>
                    </Suspense>
                  </main>
                  
                  <Footer />
                  <MobileBottomNav />
              </BrowserRouter>
            </div>
            </ErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

// Placeholder component for mock pages
const PlaceholderPage = ({ title }) => {
  return (
    <div className="dark-bg" style={{ minHeight: '100vh', padding: '8rem 3rem' }}>
      <div className="grain-overlay" />
      <div
        className="glass"
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '4rem 3rem',
          borderRadius: '12px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '1rem',
            letterSpacing: '1px',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            marginBottom: '2rem',
            lineHeight: '1.6',
            opacity: 0.7,
          }}
        >
          This section is under development. Check back soon for amazing features!
        </p>
        <a href="/" className="text-link">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default App;
