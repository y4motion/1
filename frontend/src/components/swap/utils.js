import { API_URL } from './constants';

export const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price) + ' ₽';

export const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/400?text=No+Image';
  return url.startsWith('/') ? `${API_URL}${url}` : url;
};

export const getConditionLabel = (condition, t) => {
  const map = {
    new: t('swap.conditionNew'),
    like_new: t('swap.conditionLikeNew'),
    excellent: t('swap.conditionExcellent'),
    good: t('swap.conditionGood'),
    fair: t('swap.conditionFair'),
    parts: t('swap.conditionParts')
  };
  return map[condition] || condition;
};

export const getTimeAgo = (dateStr, t) => {
  const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (days === 0) return t('swap.today');
  if (days === 1) return t('swap.yesterday');
  return `${days}${t('swap.daysAgo')}`;
};
