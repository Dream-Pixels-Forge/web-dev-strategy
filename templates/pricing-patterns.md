# Pricing Patterns

This template provides patterns for implementing pricing models, pricing tiers, usage-based billing, and pricing strategies.

## Pricing Tier Patterns

### 1. Basic Pricing Tiers
```javascript
// config/pricingTiers.js
const pricingTiers = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: {
      users: 1,
      projects: 3,
      storage: 1, // GB
      apiCalls: 1000,
      support: 'community'
    },
    limits: {
      maxUsers: 1,
      maxProjects: 3,
      maxStorageGB: 1,
      maxApiCallsPerMonth: 1000
    }
  },
  
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: {
      users: 5,
      projects: 10,
      storage: 10,
      apiCalls: 10000,
      support: 'email'
    },
    limits: {
      maxUsers: 5,
      maxProjects: 10,
      maxStorageGB: 10,
      maxApiCallsPerMonth: 10000
    }
  },
  
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 99,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: {
      users: 20,
      projects: 50,
      storage: 100,
      apiCalls: 100000,
      support: 'priority'
    },
    limits: {
      maxUsers: 20,
      maxProjects: 50,
      maxStorageGB: 100,
      maxApiCallsPerMonth: 100000
    }
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: {
      users: 'unlimited',
      projects: 'unlimited',
      storage: 1000,
      apiCalls: 'unlimited',
      support: 'dedicated'
    },
    limits: {
      maxUsers: null,
      maxProjects: null,
      maxStorageGB: 1000,
      maxApiCallsPerMonth: null
    }
  }
};

module.exports = pricingTiers;
```

### 2. Pricing Service
```javascript
// services/pricingService.js
const pricingTiers = require('../config/pricingTiers');

class PricingService {
  getTier(tierId) {
    return pricingTiers[tierId];
  }

  getAllTiers() {
    return Object.values(pricingTiers);
  }

  calculatePrice(tierId, billingPeriod = 'monthly') {
    const tier = this.getTier(tierId);
    
    if (!tier) {
      throw new Error('Invalid pricing tier');
    }

    const multipliers = {
      monthly: 1,
      quarterly: 2.7, // 10% discount
      annually: 10 // 17% discount
    };

    return {
      basePrice: tier.price,
      billingPeriod,
      totalPrice: tier.price * multipliers[billingPeriod],
      savings: tier.price * 12 - (tier.price * multipliers[billingPeriod])
    };
  }

  canUpgrade(currentTier, newTier) {
    const tiers = ['free', 'starter', 'professional', 'enterprise'];
    const currentIndex = tiers.indexOf(currentTier);
    const newIndex = tiers.indexOf(newTier);
    
    return newIndex > currentIndex;
  }

  getUpgradePrice(currentTier, newTier, daysRemaining) {
    const current = this.getTier(currentTier);
    const next = this.getTier(newTier);
    
    const proratedCredit = (current.price / 30) * daysRemaining;
    const upgradePrice = next.price - proratedCredit;
    
    return Math.max(0, upgradePrice);
  }
}

module.exports = new PricingService();
```

## Usage-Based Billing

### 1. Metered Billing Service
```javascript
// services/meteredBillingService.js
class MeteredBillingService {
  async recordUsage(customerId, metric, quantity) {
    const usage = await Usage.create({
      customerId,
      metric,
      quantity,
      timestamp: new Date()
    });

    // Check if usage exceeds limits
    await this.checkUsageLimits(customerId, metric);

    return usage;
  }

  async getUsage(customerId, metric, startDate, endDate) {
    const usage = await Usage.aggregate([
      {
        $match: {
          customerId,
          metric,
          timestamp: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantity' }
        }
      }
    ]);

    return usage[0]?.total || 0;
  }

  async checkUsageLimits(customerId, metric) {
    const customer = await Customer.findById(customerId);
    const tier = pricingTiers[customer.tier];
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const currentUsage = await this.getUsage(
      customerId,
      metric,
      startOfMonth,
      new Date()
    );

    const limit = tier.limits[`max${metric}PerMonth`];

    if (limit && currentUsage >= limit) {
      throw new Error(`Usage limit exceeded for ${metric}`);
    }

    // Warn at 80% usage
    if (limit && currentUsage >= limit * 0.8) {
      await this.sendUsageWarning(customerId, metric, currentUsage, limit);
    }
  }

  async calculateUsageCost(customerId, startDate, endDate) {
    const customer = await Customer.findById(customerId);
    const tier = pricingTiers[customer.tier];

    const metrics = ['apiCalls', 'storage', 'bandwidth'];
    let totalCost = tier.price;

    for (const metric of metrics) {
      const usage = await this.getUsage(customerId, metric, startDate, endDate);
      const limit = tier.limits[`max${metric}PerMonth`];

      if (limit && usage > limit) {
        const overage = usage - limit;
        const overageCost = this.calculateOverageCost(metric, overage);
        totalCost += overageCost;
      }
    }

    return totalCost;
  }

  calculateOverageCost(metric, quantity) {
    const rates = {
      apiCalls: 0.001, // $0.001 per call
      storage: 0.10, // $0.10 per GB
      bandwidth: 0.05 // $0.05 per GB
    };

    return quantity * (rates[metric] || 0);
  }

  async sendUsageWarning(customerId, metric, current, limit) {
    const customer = await Customer.findById(customerId);
    const percentage = Math.round((current / limit) * 100);

    await EmailService.send({
      to: customer.email,
      subject: `Usage Warning: ${percentage}% of ${metric} limit reached`,
      template: 'usage-warning',
      data: { metric, current, limit, percentage }
    });
  }
}

module.exports = new MeteredBillingService();
```

### 2. Usage Tracking Middleware
```javascript
// middleware/usageTracking.js
const meteredBillingService = require('../services/meteredBillingService');

function trackApiUsage(req, res, next) {
  const originalSend = res.send;

  res.send = function(data) {
    // Track API call after response
    if (req.user) {
      meteredBillingService.recordUsage(
        req.user.id,
        'apiCalls',
        1
      ).catch(err => console.error('Usage tracking error:', err));
    }

    originalSend.call(this, data);
  };

  next();
}

function trackStorageUsage(customerId, bytes) {
  const gb = bytes / (1024 * 1024 * 1024);
  
  return meteredBillingService.recordUsage(
    customerId,
    'storage',
    gb
  );
}

module.exports = { trackApiUsage, trackStorageUsage };
```

## Dynamic Pricing

### 1. Dynamic Pricing Engine
```javascript
// services/dynamicPricingService.js
class DynamicPricingService {
  async calculatePrice(basePrice, factors) {
    let finalPrice = basePrice;

    // Volume discount
    if (factors.quantity > 100) {
      finalPrice *= 0.9; // 10% discount
    } else if (factors.quantity > 50) {
      finalPrice *= 0.95; // 5% discount
    }

    // Seasonal pricing
    if (factors.season === 'holiday') {
      finalPrice *= 1.1; // 10% increase
    }

    // Geographic pricing
    const geoMultiplier = this.getGeographicMultiplier(factors.country);
    finalPrice *= geoMultiplier;

    // Customer segment
    if (factors.customerType === 'enterprise') {
      finalPrice *= 0.85; // 15% discount
    }

    return Math.round(finalPrice * 100) / 100;
  }

  getGeographicMultiplier(country) {
    const multipliers = {
      US: 1.0,
      GB: 0.95,
      EU: 0.90,
      IN: 0.70,
      BR: 0.75
    };

    return multipliers[country] || 1.0;
  }

  async getPersonalizedPrice(customerId, productId) {
    const customer = await Customer.findById(customerId);
    const product = await Product.findById(productId);

    const factors = {
      quantity: 1,
      country: customer.country,
      customerType: customer.type,
      season: this.getCurrentSeason(),
      loyaltyYears: this.calculateLoyaltyYears(customer.createdAt)
    };

    let price = await this.calculatePrice(product.basePrice, factors);

    // Loyalty discount
    if (factors.loyaltyYears > 2) {
      price *= 0.95;
    }

    return {
      basePrice: product.basePrice,
      finalPrice: price,
      discount: product.basePrice - price,
      factors
    };
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month === 11 || month === 0) return 'holiday';
    return 'regular';
  }

  calculateLoyaltyYears(joinDate) {
    const years = (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(years);
  }
}

module.exports = new DynamicPricingService();
```

## Pricing Comparison

### 1. Pricing Comparison Component
```javascript
// components/PricingTable.jsx
import { useState } from 'react';

function PricingTable({ tiers }) {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const calculatePrice = (tier) => {
    if (tier.price === 0) return 0;

    const multipliers = {
      monthly: 1,
      annually: 10
    };

    return tier.price * multipliers[billingPeriod];
  };

  const calculateSavings = (tier) => {
    if (tier.price === 0) return 0;
    return tier.price * 12 - tier.price * 10;
  };

  return (
    <div className="pricing-table">
      <div className="billing-toggle">
        <button
          className={billingPeriod === 'monthly' ? 'active' : ''}
          onClick={() => setBillingPeriod('monthly')}
        >
          Monthly
        </button>
        <button
          className={billingPeriod === 'annually' ? 'active' : ''}
          onClick={() => setBillingPeriod('annually')}
        >
          Annually
          <span className="badge">Save 17%</span>
        </button>
      </div>

      <div className="tiers">
        {tiers.map(tier => (
          <div key={tier.id} className="tier-card">
            <h3>{tier.name}</h3>
            
            <div className="price">
              <span className="amount">${calculatePrice(tier)}</span>
              <span className="period">/{billingPeriod}</span>
            </div>

            {billingPeriod === 'annually' && tier.price > 0 && (
              <div className="savings">
                Save ${calculateSavings(tier)}/year
              </div>
            )}

            <ul className="features">
              <li>{tier.features.users} users</li>
              <li>{tier.features.projects} projects</li>
              <li>{tier.features.storage}GB storage</li>
              <li>{tier.features.apiCalls} API calls/month</li>
              <li>{tier.features.support} support</li>
            </ul>

            <button className="select-plan">
              {tier.price === 0 ? 'Get Started' : 'Start Free Trial'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PricingTable;
```

## Pricing Calculator

### 1. Interactive Pricing Calculator
```javascript
// components/PricingCalculator.jsx
import { useState, useEffect } from 'react';

function PricingCalculator() {
  const [inputs, setInputs] = useState({
    users: 5,
    storage: 10,
    apiCalls: 10000
  });
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    calculatePricing();
  }, [inputs]);

  const calculatePricing = async () => {
    const response = await fetch('/api/pricing/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    });

    const data = await response.json();
    setPricing(data);
  };

  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseInt(value) }));
  };

  return (
    <div className="pricing-calculator">
      <h2>Calculate Your Price</h2>

      <div className="input-group">
        <label>Number of Users</label>
        <input
          type="range"
          min="1"
          max="100"
          value={inputs.users}
          onChange={(e) => handleChange('users', e.target.value)}
        />
        <span>{inputs.users} users</span>
      </div>

      <div className="input-group">
        <label>Storage (GB)</label>
        <input
          type="range"
          min="1"
          max="1000"
          value={inputs.storage}
          onChange={(e) => handleChange('storage', e.target.value)}
        />
        <span>{inputs.storage} GB</span>
      </div>

      <div className="input-group">
        <label>API Calls per Month</label>
        <input
          type="range"
          min="1000"
          max="1000000"
          step="1000"
          value={inputs.apiCalls}
          onChange={(e) => handleChange('apiCalls', e.target.value)}
        />
        <span>{inputs.apiCalls.toLocaleString()} calls</span>
      </div>

      {pricing && (
        <div className="pricing-result">
          <h3>Estimated Monthly Cost</h3>
          <div className="price">${pricing.total}</div>
          
          <div className="breakdown">
            <div>Base Plan: ${pricing.basePlan}</div>
            <div>Additional Users: ${pricing.additionalUsers}</div>
            <div>Extra Storage: ${pricing.extraStorage}</div>
            <div>API Overages: ${pricing.apiOverages}</div>
          </div>

          <button>Get Started</button>
        </div>
      )}
    </div>
  );
}

export default PricingCalculator;
```

### 2. Pricing Calculator API
```javascript
// routes/pricing.js
const express = require('express');
const router = express.Router();

router.post('/calculate', async (req, res) => {
  const { users, storage, apiCalls } = req.body;

  // Find best matching tier
  const tier = findBestTier(users, storage, apiCalls);
  
  let basePlan = tier.price;
  let additionalUsers = 0;
  let extraStorage = 0;
  let apiOverages = 0;

  // Calculate overages
  if (tier.limits.maxUsers && users > tier.limits.maxUsers) {
    additionalUsers = (users - tier.limits.maxUsers) * 5; // $5 per user
  }

  if (storage > tier.limits.maxStorageGB) {
    extraStorage = (storage - tier.limits.maxStorageGB) * 0.10; // $0.10 per GB
  }

  if (tier.limits.maxApiCallsPerMonth && apiCalls > tier.limits.maxApiCallsPerMonth) {
    const overage = apiCalls - tier.limits.maxApiCallsPerMonth;
    apiOverages = (overage / 1000) * 0.10; // $0.10 per 1000 calls
  }

  const total = basePlan + additionalUsers + extraStorage + apiOverages;

  res.json({
    tier: tier.name,
    basePlan,
    additionalUsers,
    extraStorage,
    apiOverages,
    total: Math.round(total * 100) / 100
  });
});

function findBestTier(users, storage, apiCalls) {
  const tiers = Object.values(pricingTiers);
  
  for (const tier of tiers.reverse()) {
    const meetsUsers = !tier.limits.maxUsers || users <= tier.limits.maxUsers;
    const meetsStorage = storage <= tier.limits.maxStorageGB;
    const meetsApi = !tier.limits.maxApiCallsPerMonth || apiCalls <= tier.limits.maxApiCallsPerMonth;
    
    if (meetsUsers && meetsStorage && meetsApi) {
      return tier;
    }
  }

  return tiers[0]; // Return free tier as fallback
}

module.exports = router;
```

## Pricing Strategies

### 1. Freemium Model
```javascript
// config/freemiumStrategy.js
const freemiumStrategy = {
  free: {
    features: ['basic', 'limited'],
    conversionGoal: 'upgrade',
    limitations: {
      users: 1,
      projects: 3,
      storage: 1
    }
  },
  
  paid: {
    features: ['advanced', 'unlimited'],
    benefits: ['priority_support', 'advanced_analytics']
  },

  conversionTriggers: [
    { type: 'usage_limit', threshold: 0.8 },
    { type: 'feature_request', count: 3 },
    { type: 'time_based', days: 14 }
  ]
};

module.exports = freemiumStrategy;
```

### 2. Value-Based Pricing
```javascript
// services/valuePricingService.js
class ValuePricingService {
  calculateValuePrice(customerProfile) {
    const baseValue = this.estimateCustomerValue(customerProfile);
    const price = baseValue * 0.3; // Capture 30% of value

    return {
      estimatedValue: baseValue,
      recommendedPrice: price,
      roi: (baseValue - price) / price
    };
  }

  estimateCustomerValue(profile) {
    let value = 0;

    // Time savings
    value += profile.hoursSaved * profile.hourlyRate * 12;

    // Revenue increase
    value += profile.revenueIncrease * 12;

    // Cost reduction
    value += profile.costReduction * 12;

    return value;
  }
}

module.exports = new ValuePricingService();
```
