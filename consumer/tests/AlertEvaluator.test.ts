import { describe, it, expect } from 'vitest'
import { evaluate } from '../src/services/AlertEvaluator'
import { BreachType } from '@tankwatch/shared-infra'

describe('evaluate', () => {

  describe('within range', () => {
    it('returns null for a value strictly between min and max', () => {
      expect(evaluate(50, { minValue: 20, maxValue: 80 })).toBeNull()
    })

    it('returns null when value equals minValue (boundary is inclusive)', () => {
      expect(evaluate(20, { minValue: 20, maxValue: 80 })).toBeNull()
    })

    it('returns null when value equals maxValue (boundary is inclusive)', () => {
      expect(evaluate(80, { minValue: 20, maxValue: 80 })).toBeNull()
    })

    it('returns null when min and max are equal and value matches', () => {
      expect(evaluate(50, { minValue: 50, maxValue: 50 })).toBeNull()
    })
  })

  describe('max breach', () => {
    it('returns BreachType.Max when value is one unit above maxValue', () => {
      expect(evaluate(81, { minValue: 20, maxValue: 80 })).toBe(BreachType.Max)
    })

    it('returns BreachType.Max when value is well above maxValue', () => {
      expect(evaluate(1000, { minValue: 20, maxValue: 80 })).toBe(BreachType.Max)
    })

    it('returns BreachType.Max for a fractional overshoot', () => {
      expect(evaluate(80.1, { minValue: 20, maxValue: 80 })).toBe(BreachType.Max)
    })

    it('returns BreachType.Max when exceeding a negative maxValue', () => {
      expect(evaluate(-4, { minValue: -20, maxValue: -5 })).toBe(BreachType.Max)
    })
  })

  describe('min breach', () => {
    it('returns BreachType.Min when value is one unit below minValue', () => {
      expect(evaluate(19, { minValue: 20, maxValue: 80 })).toBe(BreachType.Min)
    })

    it('returns BreachType.Min when value is well below minValue', () => {
      expect(evaluate(-100, { minValue: 20, maxValue: 80 })).toBe(BreachType.Min)
    })

    it('returns BreachType.Min for a fractional undershoot', () => {
      expect(evaluate(19.9, { minValue: 20, maxValue: 80 })).toBe(BreachType.Min)
    })

    it('returns BreachType.Min when below a negative minValue', () => {
      expect(evaluate(-21, { minValue: -20, maxValue: -5 })).toBe(BreachType.Min)
    })
  })

  describe('negative ranges', () => {
    it('returns null for a value within a fully negative range', () => {
      expect(evaluate(-10, { minValue: -20, maxValue: -5 })).toBeNull()
    })

    it('returns null when value equals the negative minValue boundary', () => {
      expect(evaluate(-20, { minValue: -20, maxValue: -5 })).toBeNull()
    })

    it('returns null when value equals the negative maxValue boundary', () => {
      expect(evaluate(-5, { minValue: -20, maxValue: -5 })).toBeNull()
    })
  })

  describe('zero-width range', () => {
    it('returns BreachType.Max when value is above a zero-width range', () => {
      expect(evaluate(51, { minValue: 50, maxValue: 50 })).toBe(BreachType.Max)
    })

    it('returns BreachType.Min when value is below a zero-width range', () => {
      expect(evaluate(49, { minValue: 50, maxValue: 50 })).toBe(BreachType.Min)
    })
  })

  // Note: This condition is not expected to be hit, but if forever reason it does
  // we'd rather check it outside of consumer threshold checks to avoid flooding logs
  describe('inverted config (maxValue < minValue)', () => {
    // Max breach is evaluated first; any value above maxValue returns Max
    // before the Min check can fire.
    it('returns BreachType.Max for a value above the inverted maxValue', () => {
      expect(evaluate(50, { minValue: 100, maxValue: 0 })).toBe(BreachType.Max)
    })

    it('returns BreachType.Min for a value below the inverted maxValue but above minValue', () => {
      // value(-5) is not > maxValue(0), but value(-5) < minValue(100)
      expect(evaluate(-5, { minValue: 100, maxValue: 0 })).toBe(BreachType.Min)
    })
  })

})
