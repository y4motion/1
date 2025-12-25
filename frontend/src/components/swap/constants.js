export const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export const CONDITIONS = ['new', 'like_new', 'excellent', 'good', 'fair', 'parts'];

export const WIZARD_STEPS = [
  { num: 1, key: 'category' },
  { num: 2, key: 'photos' },
  { num: 3, key: 'details' },
  { num: 4, key: 'done' },
];
