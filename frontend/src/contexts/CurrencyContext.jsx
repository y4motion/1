import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

// Currency conversion rates (relative to USD)
const EXCHANGE_RATES = {
  USD: 1,
  RUB: 95.5,
  CNY: 7.24,
  EUR: 0.92
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('RUB'); // Default RUB

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Save currency to localStorage when changed
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Convert price from USD to selected currency
  const convertPrice = (priceUSD) => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return Math.round(priceUSD * rate);
  };

  // Format price with currency symbol
  const formatPrice = (priceUSD) => {
    const converted = convertPrice(priceUSD);
    
    switch (currency) {
      case 'USD':
        return `$${converted}`;
      case 'RUB':
        return `${converted}₽`;
      case 'CNY':
        return `¥${converted}`;
      case 'EUR':
        return `€${converted}`;
      default:
        return `$${converted}`;
    }
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'RUB':
        return '₽';
      case 'CNY':
        return '¥';
      case 'EUR':
        return '€';
      default:
        return '$';
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        getCurrencySymbol,
        rates: EXCHANGE_RATES
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
