// Frontend validation utilities

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateUsername(username) {
  // 3-50 characters, only letters, numbers, underscore, hyphen
  if (!username || username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 50) {
    return { valid: false, error: 'Username must be less than 50 characters' };
  }
  
  const re = /^[a-zA-Z0-9_-]+$/;
  if (!re.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, _ and -' };
  }
  
  // Forbidden words
  const forbidden = ['admin', 'root', 'moderator', 'glassy', 'official', 'support', 'system'];
  if (forbidden.some(word => username.toLowerCase().includes(word))) {
    return { valid: false, error: 'Username contains forbidden word' };
  }
  
  return { valid: true };
}

export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (password.length > 100) {
    return { valid: false, error: 'Password too long (max 100 characters)' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain an uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain a lowercase letter' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must contain a number' };
  }
  
  // Optional: special character requirement
  // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  //   return { valid: false, error: 'Password must contain a special character' };
  // }
  
  return { valid: true };
}

export function sanitizeInput(input) {
  if (!input) return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script attempts
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+=/gi, '');
  
  // Trim
  sanitized = sanitized.trim();
  
  return sanitized;
}

export function validateUrl(url) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validatePostContent(content) {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Content cannot be empty' };
  }
  
  if (content.length > 5000) {
    return { valid: false, error: 'Content too long (max 5000 characters)' };
  }
  
  return { valid: true };
}

export function validateArticleContent(content) {
  if (!content || content.trim().length < 100) {
    return { valid: false, error: 'Article must be at least 100 characters' };
  }
  
  if (content.length > 50000) {
    return { valid: false, error: 'Article too long (max 50000 characters)' };
  }
  
  return { valid: true };
}

export function getPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/\d/.test(password)) strength += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
  
  if (strength < 40) return { level: 'weak', color: '#ff6b6b' };
  if (strength < 70) return { level: 'medium', color: '#ffa94d' };
  return { level: 'strong', color: '#51cf66' };
}
