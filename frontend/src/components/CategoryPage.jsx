import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { products, categories } from '../mockData';
import '../styles/glassmorphism.css';

const CategoryPage = () => {
  const { slug } = useParams();
  const category = categories.find((c) => c.slug === slug);
  const categoryProducts = products.filter((p) => p.category === category?.name);

  if (!category) {
    return (
      <div className="dark-bg" style={{ minHeight: '100vh', padding: '8rem 3rem' }}>
        <div className="grain-overlay" />
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Category not found</h2>
          <Link to="/" className="text-link">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-bg" style={{ minHeight: '100vh', padding: '8rem 3rem 3rem' }}>
      <div className="grain-overlay" />

      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '3rem' }}>
        <Link
          to="/"
          className="text-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
          }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1
          style={{
            color: 'white',
            fontSize: '3rem',
            fontWeight: '800',
            letterSpacing: '1px',
            marginBottom: '0.5rem',
          }}
        >
          {category.name}
        </h1>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.125rem',
          }}
        >
          {categoryProducts.length} products available
        </p>
      </div>

      {/* Products Grid */}
      {categoryProducts.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {categoryProducts.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
              <div className="product-card" style={{ padding: '1.5rem', height: '100%' }}>
                {/* Product Image */}
                <div
                  style={{
                    width: '100%',
                    height: '220px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="no-transform-transition"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {product.originalPrice && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: '#F44336',
                        color: 'white',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                      }}
                    >
                      SALE
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ marginBottom: '1rem' }}>
                  <h3
                    style={{
                      color: 'white',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      lineHeight: '1.3',
                    }}
                  >
                    {product.name}
                  </h3>
                  <p
                    style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.875rem',
                      lineHeight: '1.4',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.125rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < Math.floor(product.rating) ? '#FFB800' : 'none'}
                          color={
                            i < Math.floor(product.rating) ? '#FFB800' : 'rgba(255, 255, 255, 0.3)'
                          }
                        />
                      ))}
                    </div>
                    <span
                      style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>
                </div>

                {/* Price and Status */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginTop: 'auto',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                      }}
                    >
                      ${product.price}
                    </div>
                    {product.originalPrice && (
                      <div
                        style={{
                          color: 'rgba(255, 255, 255, 0.4)',
                          fontSize: '0.875rem',
                          textDecoration: 'line-through',
                        }}
                      >
                        ${product.originalPrice}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      color: product.inStock ? '#4CAF50' : '#F44336',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div
          className="glass"
          style={{
            maxWidth: '600px',
            margin: '4rem auto',
            padding: '3rem',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              color: 'white',
              fontSize: '1.5rem',
              marginBottom: '1rem',
            }}
          >
            No products available yet
          </h3>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '2rem',
            }}
          >
            This category is being stocked. Check back soon!
          </p>
          <Link to="/" className="text-link">
            Explore Other Categories
          </Link>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
