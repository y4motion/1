import React from 'react';
import { useParams } from 'react-router-dom';
import { SwapMainPage, SwapDetailPage } from './swap';
import '../styles/glassmorphism.css';

/**
 * GlassySwapPage - Main entry point for Glassy Swap marketplace
 * 
 * Routes:
 * - /glassy-swap - Main feed with listings
 * - /glassy-swap/:id - Individual listing detail page
 */
const GlassySwapPage = () => {
  const { id } = useParams();
  
  if (id) {
    return <SwapDetailPage id={id} />;
  }
  
  return <SwapMainPage />;
};

export default GlassySwapPage;
