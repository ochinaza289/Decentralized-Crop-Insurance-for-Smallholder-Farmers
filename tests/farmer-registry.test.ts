import { describe, it, expect, beforeEach } from 'vitest';

// Mock implementation for testing Clarity contracts
// In a real environment, you would use actual Clarity testing tools

// Simple mock for the farmer registry contract
const mockFarmerRegistry = {
  lastFarmerId: 0,
  farmers: new Map(),
  
  registerFarmer(name, location, cropType, farmSize) {
    const farmerId = this.lastFarmerId + 1;
    this.lastFarmerId = farmerId;
    
    this.farmers.set(farmerId, {
      name,
      location,
      cropType,
      farmSize,
      registeredAt: 123 // Mock block height
    });
    
    return { success: true, value: farmerId };
  },
  
  getFarmer(farmerId) {
    return this.farmers.get(farmerId) || null;
  },
  
  getFarmerCount() {
    return this.lastFarmerId;
  }
};

describe('Farmer Registry Contract', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockFarmerRegistry.lastFarmerId = 0;
    mockFarmerRegistry.farmers = new Map();
  });
  
  it('should register a new farmer', () => {
    const result = mockFarmerRegistry.registerFarmer(
        'John Doe',
        'Kenya, Nairobi',
        'Maize',
        5 // 5 acres
    );
    
    expect(result.success).toBe(true);
    expect(result.value).toBe(1);
    expect(mockFarmerRegistry.getFarmerCount()).toBe(1);
  });
  
  it('should retrieve farmer information', () => {
    mockFarmerRegistry.registerFarmer('John Doe', 'Kenya, Nairobi', 'Maize', 5);
    const farmer = mockFarmerRegistry.getFarmer(1);
    
    expect(farmer).not.toBeNull();
    expect(farmer.name).toBe('John Doe');
    expect(farmer.location).toBe('Kenya, Nairobi');
    expect(farmer.cropType).toBe('Maize');
    expect(farmer.farmSize).toBe(5);
  });
  
  it('should return null for non-existent farmer', () => {
    const farmer = mockFarmerRegistry.getFarmer(999);
    expect(farmer).toBeNull();
  });
  
  it('should register multiple farmers', () => {
    mockFarmerRegistry.registerFarmer('John Doe', 'Kenya, Nairobi', 'Maize', 5);
    mockFarmerRegistry.registerFarmer('Jane Smith', 'Tanzania, Arusha', 'Beans', 3);
    mockFarmerRegistry.registerFarmer('Bob Johnson', 'Uganda, Kampala', 'Rice', 7);
    
    expect(mockFarmerRegistry.getFarmerCount()).toBe(3);
    
    const farmer2 = mockFarmerRegistry.getFarmer(2);
    expect(farmer2.name).toBe('Jane Smith');
    expect(farmer2.cropType).toBe('Beans');
  });
});
