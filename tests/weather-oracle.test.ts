import { describe, it, expect, beforeEach } from 'vitest';

// Mock implementation for testing Clarity contracts
const mockWeatherOracle = {
  owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Mock principal
  authorizedProviders: new Map(),
  weatherData: new Map(),
  weatherEvents: new Map(),
  lastEventId: 0,
  
  authorizeProvider(provider) {
    if (this.owner !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
      return { success: false, error: 403 };
    }
    this.authorizedProviders.set(provider, true);
    return { success: true };
  },
  
  submitWeatherData(sender, location, temperature, rainfall, humidity, windSpeed) {
    if (!this.authorizedProviders.get(sender)) {
      return { success: false, error: 403 };
    }
    
    const key = `${location}-${Date.now()}`;
    this.weatherData.set(key, {
      temperature,
      rainfall,
      humidity,
      windSpeed,
      reportedBy: sender
    });
    
    return { success: true };
  },
  
  reportWeatherEvent(sender, location, eventType, severity, startTime, endTime) {
    if (!this.authorizedProviders.get(sender)) {
      return { success: false, error: 403 };
    }
    
    const eventId = this.lastEventId + 1;
    this.lastEventId = eventId;
    
    this.weatherEvents.set(`${location}-${eventId}`, {
      eventType,
      severity,
      startTime,
      endTime,
      confirmed: false
    });
    
    return { success: true, value: eventId };
  },
  
  confirmWeatherEvent(sender, location, eventId) {
    if (!this.authorizedProviders.get(sender)) {
      return { success: false, error: 403 };
    }
    
    const key = `${location}-${eventId}`;
    const event = this.weatherEvents.get(key);
    
    if (!event) {
      return { success: false, error: 404 };
    }
    
    this.weatherEvents.set(key, {
      ...event,
      confirmed: true
    });
    
    return { success: true };
  },
  
  getWeatherEvent(location, eventId) {
    return this.weatherEvents.get(`${location}-${eventId}`) || null;
  }
};

describe('Weather Oracle Contract', () => {
  const provider1 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const provider2 = 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC';
  
  beforeEach(() => {
    // Reset the mock before each test
    mockWeatherOracle.authorizedProviders = new Map();
    mockWeatherOracle.weatherData = new Map();
    mockWeatherOracle.weatherEvents = new Map();
    mockWeatherOracle.lastEventId = 0;
    mockWeatherOracle.owner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  });
  
  it('should authorize a provider', () => {
    const result = mockWeatherOracle.authorizeProvider(provider1);
    expect(result.success).toBe(true);
    expect(mockWeatherOracle.authorizedProviders.get(provider1)).toBe(true);
  });
  
  it('should reject unauthorized weather data submission', () => {
    const result = mockWeatherOracle.submitWeatherData(
        provider1,
        'Kenya, Nairobi',
        25, // temperature
        100, // rainfall
        65, // humidity
        10 // wind speed
    );
    
    expect(result.success).toBe(false);
    expect(result.error).toBe(403);
  });
  
  it('should accept weather data from authorized provider', () => {
    mockWeatherOracle.authorizeProvider(provider1);
    
    const result = mockWeatherOracle.submitWeatherData(
        provider1,
        'Kenya, Nairobi',
        25, // temperature
        100, // rainfall
        65, // humidity
        10 // wind speed
    );
    
    expect(result.success).toBe(true);
  });
  
  it('should report and confirm weather events', () => {
    mockWeatherOracle.authorizeProvider(provider1);
    
    const reportResult = mockWeatherOracle.reportWeatherEvent(
        provider1,
        'Kenya, Nairobi',
        'drought',
        3, // severity
        1000, // start time
        2000 // end time
    );
    
    expect(reportResult.success).toBe(true);
    const eventId = reportResult.value;
    
    const confirmResult = mockWeatherOracle.confirmWeatherEvent(
        provider1,
        'Kenya, Nairobi',
        eventId
    );
    
    expect(confirmResult.success).toBe(true);
    
    const event = mockWeatherOracle.getWeatherEvent('Kenya, Nairobi', eventId);
    expect(event).not.toBeNull();
    expect(event.eventType).toBe('drought');
    expect(event.confirmed).toBe(true);
  });
});
