import React from "react";
import "./App.css";
import "./styles/glassmorphism.css";
import "./styles/minimalMod.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import CategoryPage from "./components/CategoryPage";
import ProductPage from "./components/ProductPage";
import MarketplacePage from "./components/MarketplacePage";
import PCBuilderPage from "./components/PCBuilderPage";
import ModPage from "./components/ModPage";
import ProductDetailPage from "./components/ProductDetailPage";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import ChatFullPage from "./components/ChatFullPage";
import FloatingChatWidget from "./components/FloatingChatWidget";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <div className="App">
              <BrowserRouter>
              <Header />
              <FloatingChatWidget />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/pc-builder" element={<PCBuilderPage />} />
                <Route path="/mod" element={<ModPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/chat" element={<ChatFullPage />} />
                <Route path="/chat/:conversationId" element={<ChatFullPage />} />
                
                {/* Placeholder routes for navigation links */}
                <Route path="/catalog" element={<PlaceholderPage title="CATALOG" />} />
                <Route path="/pro-gamer" element={<PlaceholderPage title="PRO GAMER" />} />
                <Route path="/creator" element={<PlaceholderPage title="CREATOR" />} />
                <Route path="/user" element={<PlaceholderPage title="USER" />} />
                <Route path="/restock" element={<PlaceholderPage title="RESTOCK" />} />
                <Route path="/best-products" element={<PlaceholderPage title="BEST PRODUCTS" />} />
                <Route path="/builds" element={<PlaceholderPage title="BUILDS" />} />
                <Route path="/team" element={<PlaceholderPage title="TEAM" />} />
                <Route path="/join-guild" element={<PlaceholderPage title="JOIN GUILD" />} />
                <Route path="/developments" element={<PlaceholderPage title="PERSONAL DEVELOPMENTS" />} />
                <Route path="/contact" element={<PlaceholderPage title="CONTACT INFORMATION" />} />
                <Route path="/support" element={<PlaceholderPage title="SUPPORT" />} />
                <Route path="/suggest" element={<PlaceholderPage title="SUGGEST AN IDEA" />} />
                <Route path="/news" element={<PlaceholderPage title="NEWS" />} />
                <Route path="/downloads" element={<PlaceholderPage title="DOWNLOADS" />} />
                <Route path="/privacy" element={<PlaceholderPage title="PRIVACY POLICY" />} />
                <Route path="/cookies" element={<PlaceholderPage title="COOKIE POLICY" />} />
                <Route path="/accessibility" element={<PlaceholderPage title="ACCESSIBILITY" />} />
                <Route path="/ads" element={<PlaceholderPage title="ADVERTISING INFO" />} />
              </Routes>
              <Footer />
            </BrowserRouter>
          </div>
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
      <div className="glass" style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '4rem 3rem',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          marginBottom: '1rem',
          letterSpacing: '1px'
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: '1.125rem',
          marginBottom: '2rem',
          lineHeight: '1.6',
          opacity: 0.7
        }}>
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
