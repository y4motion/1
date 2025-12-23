import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Heart } from 'lucide-react';
import { products } from '../mockData';
import '../styles/glassmorphism.css';

const ProductPage = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="dark-bg" style={{ minHeight: '100vh', padding: '8rem 3rem' }}>
        <div className="grain-overlay" />
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Product not found</h2>
          <Link to="/" className="text-link">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const productImages = product.images || [product.image];

  return (
    <div className="dark-bg" style={{ minHeight: '100vh', padding: '8rem 3rem 3rem' }}>
      <div className="grain-overlay" />

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Back Button */}
        <Link
          to={`/category/${product.category.toLowerCase()}`}
          className="text-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
          }}
        >
          <ArrowLeft size={16} />
          Back to {product.category}
        </Link>

        {/* Product Content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            marginBottom: '4rem',
          }}
        >
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div
              className="glass"
              style={{
                width: '100%',
                height: '500px',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '1rem',
                background: 'rgba(0, 0, 0, 0.3)',
              }}
            >
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="no-transform-transition"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* Image Thumbnails */}
            {productImages.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                }}
              >
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className="glass-subtle"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border:
                        selectedImage === idx
                          ? '2px solid rgba(255, 255, 255, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.05)',
                      padding: 0,
                    }}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="no-transform-transition"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div>
            {/* Category & Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {product.category}
              </span>
              <div className={`status-badge status-${product.status.split('_')[0]}`}>
                {product.status.replace('_', ' ')}
              </div>
            </div>

            {/* Product Name */}
            <h1
              style={{
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: '800',
                marginBottom: '1rem',
                lineHeight: '1.2',
              }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.floor(product.rating) ? '#FFB800' : 'none'}
                    color={i < Math.floor(product.rating) ? '#FFB800' : 'rgba(255, 255, 255, 0.3)'}
                  />
                ))}
              </div>
              <span
                style={{
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                }}
              >
                {product.rating}
              </span>
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.875rem',
                }}
              >
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Description */}
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.125rem',
                lineHeight: '1.6',
                marginBottom: '2rem',
              }}
            >
              {product.longDescription}
            </p>

            {/* Price */}
            <div
              className="glass"
              style={{
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '1rem',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    color: 'white',
                    fontSize: '3rem',
                    fontWeight: '800',
                  }}
                >
                  ${product.price}
                </div>
                {product.originalPrice && (
                  <div
                    style={{
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontSize: '1.5rem',
                      textDecoration: 'line-through',
                    }}
                  >
                    ${product.originalPrice}
                  </div>
                )}
              </div>
              {product.originalPrice && (
                <div
                  style={{
                    color: '#4CAF50',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                  }}
                >
                  Save ${(product.originalPrice - product.price).toFixed(2)} (
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF)
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <button
                onClick={handleAddToCart}
                className="lvl-button"
                style={{
                  flex: 1,
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  background: addedToCart ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: addedToCart ? '1px solid #4CAF50' : '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <ShoppingCart size={20} />
                  {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </span>
              </button>
              <button
                className="lvl-button"
                style={{
                  padding: '1rem',
                  width: '60px',
                }}
              >
                <Heart size={20} />
              </button>
            </div>

            {/* Specifications */}
            <div
              className="glass"
              style={{
                padding: '1.5rem',
                borderRadius: '12px',
              }}
            >
              <h3
                style={{
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  letterSpacing: '0.5px',
                }}
              >
                Specifications
              </h3>
              <div
                style={{
                  display: 'grid',
                  gap: '0.75rem',
                }}
              >
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <span
                      style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.875rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span
                      style={{
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Moderation Info (for demonstration) */}
        <div
          className="glass-subtle"
          style={{
            padding: '1.5rem',
            borderRadius: '12px',
            marginTop: '2rem',
          }}
        >
          <h4
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.75rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Content Management Info (Demo)
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.75rem',
            }}
          >
            <div>
              Status:{' '}
              <span
                className={`status-badge status-${product.status.split('_')[0]}`}
                style={{ marginLeft: '0.5rem' }}
              >
                {product.status}
              </span>
            </div>
            <div>Submitted by: {product.submittedBy}</div>
            <div>Moderated by: {product.moderatedBy}</div>
            <div>Created: {new Date(product.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
