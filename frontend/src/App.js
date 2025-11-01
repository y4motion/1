import React from "react";
import "./App.css";
import "./styles/glassmorphism.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import CategoryPage from "./components/CategoryPage";
import ProductPage from "./components/ProductPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          
          {/* Placeholder routes for navigation links */}
          <Route path="/catalog" element={<PlaceholderPage title="CATALOG" />} />
          <Route path="/pro-gamer" element={<PlaceholderPage title="PRO GAMER" />} />
          <Route path="/creator" element={<PlaceholderPage title="CREATOR" />} />
          <Route path="/user" element={<PlaceholderPage title="USER" />} />
          <Route path="/marketplace" element={<PlaceholderPage title="MARKETPLACE" />} />
          <Route path="/restock" element={<PlaceholderPage title="RESTOCK" />} />
          <Route path="/best-products" element={<PlaceholderPage title="BEST PRODUCTS" />} />
          <Route path="/builds" element={<PlaceholderPage title="BUILDS" />} />
          <Route path="/team" element={<PlaceholderPage title="TEAM" />} />
          <Route path="/join-guild" element={<PlaceholderPage title="JOIN GUILD" />} />
          <Route path="/developments" element={<PlaceholderPage title="PERSONAL DEVELOPMENTS" />} />
          <Route path="/contact" element={<PlaceholderPage title="CONTACT INFORMATION" />} />
          <Route path="/support" element={<PlaceholderPage title="SUPPORT" />} />
          <Route path="/suggest" element={<PlaceholderPage title="SUGGEST AN IDEA" />} />
        </Routes>
      </BrowserRouter>
    </div>
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
          color: 'white',
          fontSize: '3rem',
          fontWeight: '800',
          marginBottom: '1rem',
          letterSpacing: '1px'
        }}>
          {title}
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '1.125rem',
          marginBottom: '2rem',
          lineHeight: '1.6'
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
