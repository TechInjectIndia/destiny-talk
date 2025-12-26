/**
 * DestinyAI Core Numerology Engine
 * Implements strict mathematical rules for Moolank, Bhagyank, Loshu Grid, and Kua Number.
 */

// Helper: Reduces a number to a single digit (1-9).
// Example: 29 -> 11 -> 2.
export const reduceToSingleDigit = (n: number): number => {
  if (n === 0) return 0;
  return (n - 1) % 9 + 1;
};

// Helper: Sums digits of a number without full reduction (needed for intermediate steps sometimes).
// Example: 1990 -> 19
const sumDigitsRaw = (n: number): number => {
  return n
    .toString()
    .split('')
    .reduce((acc, curr) => acc + parseInt(curr), 0);
};

// --- CORE CALCULATORS ---

/**
 * Calculates Moolank (Driver Number)
 * Derived from the Day of Birth.
 * @param day - Day of the month (1-31)
 */
export const calculateMoolank = (day: number): number => {
  return reduceToSingleDigit(day);
};

/**
 * Calculates Bhagyank (Conductor/Destiny Number)
 * Derived from the full Date of Birth.
 * @param day
 * @param month
 * @param year
 */
export const calculateBhagyank = (day: number, month: number, year: number): number => {
  // Strategy: Sum all digits directly? Or sum components?
  // Standard Numerology: Sum all digits of the date string.
  const fullString = `${day}${month}${year}`;
  const totalSum = fullString.split('').reduce((acc, c) => acc + parseInt(c), 0);
  return reduceToSingleDigit(totalSum);
};

/**
 * Calculates Kua Number
 * Derived from Year of Birth and Gender.
 * @param year - Full year (e.g., 1990)
 * @param gender - 'male' | 'female'
 */
export const calculateKuaNumber = (year: number, gender: 'male' | 'female'): number => {
  let sumYear = reduceToSingleDigit(year); // 1990 -> 1+9+9+0 = 19 -> 10 -> 1

  if (gender === 'male') {
    // Formula: 11 - YearSum
    let result = 11 - sumYear;
    return reduceToSingleDigit(result);
  } else {
    // Formula: YearSum + 4
    let result = sumYear + 4;
    return reduceToSingleDigit(result);
  }
};

/**
 * Calculates Loshu Grid
 * A 3x3 Grid mapping frequencies of numbers 1-9 in the DOB.
 * 
 * Grid Layout (Standard Loshu):
 * 4 9 2
 * 3 5 7
 * 8 1 6
 * 
 * @param day 
 * @param month 
 * @param year 
 * @returns Record<number, number> - Map of digit to frequency (e.g. {1: 2, 9: 1...})
 */
export const calculateLoshuGrid = (day: number, month: number, year: number): Record<number, number> => {
  const digits = `${day}${month}${year}`.split('').map(d => parseInt(d));
  
  const grid: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  };

  digits.forEach(d => {
    if (d >= 1 && d <= 9) {
      grid[d] = (grid[d] || 0) + 1;
    }
  });

  return grid;
};

// --- TYPES ---

export type NumerologyReport = {
  moolank: number;
  bhagyank: number;
  kua: number;
  loshuGrid: Record<number, number>;
  missingNumbers: number[];
};

/**
 * Generates the full mathematical profile.
 */
export const generateNumerologyProfile = (day: number, month: number, year: number, gender: 'male' | 'female'): NumerologyReport => {
  const moolank = calculateMoolank(day);
  const bhagyank = calculateBhagyank(day, month, year);
  const kua = calculateKuaNumber(year, gender);
  const loshuGrid = calculateLoshuGrid(day, month, year);

  const missingNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => loshuGrid[n] === 0);

  return {
    moolank,
    bhagyank,
    kua,
    loshuGrid,
    missingNumbers
  };
};
