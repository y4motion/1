import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import OptimizedImage from '../OptimizedImage';
import './FastBuyModal.css';

const FastBuyModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (adding || added) return;
    
    setAdding(true);
    try {
      await onAddToCart(product.id, quantity);
      setAdding(false);
      setAdded(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      setAdding(false);
      console.error('Error adding to cart:', error);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/500x500?text=No+Image';

  return (
    <div className="fast-buy-overlay" onClick={onClose}>
      <div className="fast-buy-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-image">
          <OptimizedImage src={imageUrl} alt={product.title} />
        </div>
        
        <div className="modal-content">
          <h2 className="modal-title">{product.title}</h2>
          
          <div className="modal-price-row">
            <span className="modal-price">${product.price}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="modal-original-price">${product.original_price}</span>
            )}
          </div>
          
          <div className="modal-quantity">
            <span className="quantity-label">Quantity:</span>
            <div className="quantity-controls">
              <button 
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="quantity-btn"
              >
                <Minus size={16} />
              </button>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, Math.min(product.stock, val)));
                }}
                min="1"
                max={product.stock}
                className="quantity-input"
              />
              <button 
                onClick={incrementQuantity}
                disabled={quantity >= product.stock}
                className="quantity-btn"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          <div className="modal-total">
            <span>Total:</span>
            <span className="total-price">${(product.price * quantity).toFixed(2)}</span>
          </div>
          
          <button 
            className={`modal-add-btn ${adding ? 'adding' : ''} ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={adding || added || product.stock === 0}
          >
            {added ? (
              <><Check size={18} /> Added to Cart!</>
            ) : adding ? (
              <>Adding...</>
            ) : (
              <><ShoppingCart size={18} /> Add to Cart</>
            )}
          </button>
          
          <div className="modal-stock">
            {product.stock > 0 ? (
              <span className="in-stock">{product.stock} in stock</span>
            ) : (
              <span className="out-of-stock">Out of stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastBuyModal;
