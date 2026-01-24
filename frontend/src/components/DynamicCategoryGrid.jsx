import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

/**
 * DynamicCategoryGrid - Компонент для крупных модульных карточек-категорий
 * Вдохновлен дизайном PMM с наложенными текстами на изображения товаров
 *
 * @param {Array} categories - Массив категорий с полями:
 *   - title: string - Название категории (заглавными буквами)
 *   - image: string - URL изображения
 *   - link: string - Ссылка для навигации
 *   - description?: string - Опциональное описание
 */
function DynamicCategoryGrid({ categories, columns = 4, title }) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full py-12">
      {title && (
        <h2
          className="text-3xl font-bold text-center mb-8"
          style={{
            fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit',
          }}
        >
          {title}
        </h2>
      )}

      {/* Grid of category cards */}
      <div
        className="grid gap-6 w-full px-8"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${columns === 4 ? '280px' : '350px'}, 1fr))`,
        }}
      >
        {categories.map((category, index) => (
          <div
            key={index}
            onClick={() => navigate(category.link)}
            className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105"
            style={{
              height: '320px',
              borderRadius: theme === 'minimal-mod' ? '0' : '16px',
            }}
          >
            {/* Background Image */}
            <img
              src={category.image}
              alt={category.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Dark Overlay */}
            <div
              className="absolute inset-0 bg-black transition-opacity duration-300"
              style={{ opacity: 0.4 }}
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              {/* Category Title */}
              <h3
                className="text-white text-4xl font-bold text-center tracking-wider mb-2"
                style={{
                  textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                  fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit',
                }}
              >
                {category.title}
              </h3>

              {/* Optional Description */}
              {category.description && (
                <p
                  className="text-white/80 text-sm text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {category.description}
                </p>
              )}
            </div>

            {/* Hover Border Effect */}
            <div
              className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-300"
              style={{
                borderRadius: theme === 'minimal-mod' ? '0' : '16px',
              }}
            />
          </div>
        ))}
      </div>

      {/* Optional Quote/Testimonial Section */}
      {categories.length > 0 && (
        <div className="mt-12 w-full px-8">
          <div
            className="relative overflow-hidden"
            style={{
              height: '400px',
              borderRadius: theme === 'minimal-mod' ? '0' : '16px',
            }}
          >
            {/* Hero Background Image */}
            <img
              src={categories[0].image}
              alt="Hero"
              className="w-full h-full object-cover opacity-60"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Quote Content */}
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <blockquote className="text-white text-center max-w-3xl">
                <p
                  className="text-xl md:text-2xl italic mb-4"
                  style={{
                    textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                    fontFamily: theme === 'minimal-mod' ? 'SF Mono, monospace' : 'inherit',
                  }}
                >
                  "Наши продукты - результат бесчисленных часов тестирования, реальных отзывов
                  геймеров и глубокой страсти к тому, что мы делаем."
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DynamicCategoryGrid;
