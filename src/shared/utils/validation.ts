/**
 * Validate Indian phone number (10 digits)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate positive number
 */
export const isPositiveNumber = (value: number): boolean => {
  return value > 0;
};

/**
 * Validate minimum value
 */
export const isMinValue = (value: number, min: number): boolean => {
  return value >= min;
};

/**
 * Validate maximum value
 */
export const isMaxValue = (value: number, max: number): boolean => {
  return value <= max;
};

/**
 * Validate string length
 */
export const isValidLength = (
  value: string,
  min: number = 0,
  max: number = Infinity
): boolean => {
  return value.length >= min && value.length <= max;
};
