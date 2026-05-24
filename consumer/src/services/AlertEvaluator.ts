/**
 * File: AlertEvaluator.ts
 * Author: Garrett Forsyth
 * Date: May 24th 2026
 * Description: Determines if an alert should be sent based on a reading.
 */
import { BreachType } from '@tankwatch/shared-events';

export type ThresholdConfig = {
  minValue: number
  maxValue: number
}

export function evaluate(value: number, config: ThresholdConfig): BreachType | null {
  if (value > config.maxValue) return BreachType.Max;
  if (value < config.minValue) return BreachType.Min;
  return null;
}
