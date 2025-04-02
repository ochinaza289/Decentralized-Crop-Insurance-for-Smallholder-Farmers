import { describe, it, expect, beforeEach } from 'vitest';

// Mock implementation for testing Clarity contracts
const mockPremiumCalculator = {
  owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Mock principal
  locationRiskFactors: new Map(),
  cropRiskFactors: new Map(),
  basePremiumRate: 500, // 5% in basis points
  
  setLocationRiskFactor(sender, location, riskFactor) {
    if (sender !== this.owner) {
      return { success: false, error: 403 };
    }
    
    this.locationRiskFactors.set(location, riskFactor);
    return { success: true };
  },
  
  setCropRiskFactor(sender, cropType, riskFactor) {
    if (sender !== this.owner) {
      return { success: false, error: 403 };
    }
    
    this.cropRiskFactors.set(cropType, riskFactor);
    return { success: true };
  },
  
  setBasePremiumRate(sender, rate) {
    if (sender !== this.owner) {
      return { success: false, error: 403 };
    }
    
    this.basePremiumRate = rate;
    return { success: true };
  },
  
  calculatePremium(location, cropType, coverageAmount) {
    const locationFactor = this.locationRiskFactors.get(location) || 100;
    const cropFactor = this.cropRiskFactors.get(cropType) || 100;
    
    // Formula: base-rate * location-risk * crop-risk * coverage-amount / 1000000
    return (this.basePremiumRate * locationFactor * cropFactor * coverageAmount) / 1000000;
  }
};

describe('Premium Calculator Contract', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockPremiumCalculator.locationRiskFactors = new Map();
    mockPremiumCalculator.cropRiskFactors = new Map();
    mockPremiumCalculator.basePremiumRate = 500; // 5%
    mockPremiumCalculator.owner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  });
  
  it('should set location risk factors', () => {
    const result = mockPremiumCalculator.setLocationRiskFactor(
        mockPremiumCalculator.owner,
        'Kenya, Nairobi',
        120 // 20% higher risk
    );
    
    expect(result.success).toBe(true);
    expect(mockPremiumCalculator.locationRiskFactors.get('Kenya, Nairobi')).toBe(120);
  });
  
  it('should set crop risk factors', () => {
    const result = mockPremiumCalculator.setCropRiskFactor(
        mockPremiumCalculator.owner,
        'Maize',
        80 // 20% lower risk
    );
    
    expect(result.success).toBe(true);
    expect(mockPremiumCalculator.cropRiskFactors.get('Maize')).toBe(80);
  });
  
  it('should reject unauthorized risk factor changes', () => {
    const unauthorizedSender = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    
    const result = mockPremiumCalculator.setLocationRiskFactor(
        unauthorizedSender,
        'Kenya, Nairobi',
        120
    );
    
    expect(result.success).toBe(false);
    expect(result.error).toBe(403);
    expect(mockPremiumCalculator.locationRiskFactors.get('Kenya, Nairobi')).toBeUndefined();
  });
});
