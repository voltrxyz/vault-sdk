import BN from "bn.js";
import { Decimal } from "decimal.js";

const DECIMAL_FRACTIONAL_BYTES = 6;
const DECIMAL_DIVISOR = new Decimal(2).pow(8 * DECIMAL_FRACTIONAL_BYTES);

export function convertDecimalBitsToDecimal(value: BN): Decimal {
  let decimalValue = new Decimal(value.toString());
  return decimalValue.div(DECIMAL_DIVISOR);
}
