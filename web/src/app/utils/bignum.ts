import BN from 'bn.js';

/**
 * 安全除法函数，将两个数值字符串表示的数进行大数除法
 * @param value - 被除数
 * @param divisor - 除数
 * @returns {BN} - 结果
 */
export function safeDivide(value: string, divisor: string): BN {
  const bnValue = new BN(value);
  const bnDivisor = new BN(divisor);
  return bnValue.div(bnDivisor);
}

/**
 * 安全乘法函数，将两个数值字符串表示的数进行大数乘法
 * @param value - 乘数1
 * @param multiplier - 乘数2
 * @returns {BN} - 结果
 */
export function safeMultiply(value: string, multiplier: string): BN {
  const bnValue = new BN(value);
  const bnMultiplier = new BN(multiplier);
  return bnValue.mul(bnMultiplier);
}
