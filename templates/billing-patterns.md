# Billing Patterns

This template provides patterns for implementing billing, payments, and subscription management in web applications.

## Payment Processing Patterns

### 1. Basic Payment Processing
```javascript
// services/paymentService.js
class PaymentService {
  async processPayment(paymentDetails) {
    const {
      amount,
      currency = 'USD',
      customerId,
      paymentMethodId,
      description
    } = paymentDetails;

    // Validate amount
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    try {
      // Call payment gateway (Stripe example)
      const payment = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        description: description
      });

      // Log transaction
      await this.logTransaction({
        type: 'payment',
        status: payment.status,
        amount,
        currency,
        externalId: payment.id,
        customerId
      });

      return {
        success: true,
        transactionId: payment.id,
        status: payment.status,
        amount
      };
    } catch (error) {
      // Log error without exposing sensitive info
      console.error('Payment processing error:', error.message);
      
      await this.logTransaction({
        type: 'payment_failed',
        amount,
        currency,
        customerId,
        error: error.message
      });

      throw new Error('Payment processing failed. Please try again.');
    }
  }

  async logTransaction(transaction) {
    return await Transaction.create(transaction);
  }
}

export default new PaymentService();
```

### 2. Payment Validation
```javascript
// utils/paymentValidation.js
export const validatePaymentDetails = (details) => {
  const errors = [];

  // Validate amount
  if (!details.amount || details.amount <= 0) {
    errors.push('Invalid amount');
  }

  if (details.amount > 999999.99) {
    errors.push('Amount exceeds maximum limit');
  }

  // Validate currency
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  if (!validCurrencies.includes(details.currency)) {
    errors.push('Invalid currency');
  }

  // Validate customer ID
  if (!details.customerId || typeof details.customerId !== 'string') {
    errors.push('Invalid customer ID');
  }

  // Validate payment method
  if (!details.paymentMethodId) {
    errors.push('Payment method required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCardDetails = (card) => {
  const errors = [];

  // Validate card number (basic Luhn check)
  if (!card.number || !/^\d{13,19}$/.test(card.number)) {
    errors.push('Invalid card number');
  }

  // Validate expiry
  if (!card.expiry || !/^\d{2}\/\d{2}$/.test(card.expiry)) {
    errors.push('Invalid expiry date');
  }

  const [month, year] = card.expiry.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month));
  if (expiry < new Date()) {
    errors.push('Card expired');
  }

  // Validate CVV
  if (!card.cvv || !/^\d{3,4}$/.test(card.cvv)) {
    errors.push('Invalid CVV');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

## Subscription Management Patterns

### 1. Subscription Service
```javascript
// services/subscriptionService.js
class SubscriptionService {
  async createSubscription(subscriptionData) {
    const {
      customerId,
      planId,
      paymentMethodId,
      billingCycle = 'monthly'
    } = subscriptionData;

    try {
      // Create subscription with payment gateway
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: planId }],
        default_payment_method: paymentMethodId,
        collection_method: 'charge_automatically'
      });

      // Store subscription in database
      const dbSubscription = await Subscription.create({
        externalId: subscription.id,
        customerId,
        planId,
        status: subscription.status,
        billingCycle,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        autoRenew: true
      });

      return dbSubscription;
    } catch (error) {
      console.error('Subscription creation failed:', error.message);
      throw new Error('Failed to create subscription');
    }
  }

  async cancelSubscription(subscriptionId, immediate = false) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Cancel with payment gateway
      const cancelOptions = immediate 
        ? { proration_behavior: 'create_prorations' }
        : { proration_behavior: 'none' };

      await stripe.subscriptions.del(subscription.externalId, cancelOptions);

      // Update in database
      await Subscription.findByIdAndUpdate(subscriptionId, {
        status: 'canceled',
        canceledAt: new Date(),
        autoRenew: false
      });

      return { success: true };
    } catch (error) {
      console.error('Subscription cancellation failed:', error.message);
      throw new Error('Failed to cancel subscription');
    }
  }

  async updateSubscriptionPlan(subscriptionId, newPlanId) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Update with payment gateway
      const updated = await stripe.subscriptions.update(
        subscription.externalId,
        {
          items: [{
            id: subscription.externalItemId,
            price: newPlanId
          }],
          proration_behavior: 'create_prorations'
        }
      );

      // Update in database
      await Subscription.findByIdAndUpdate(subscriptionId, {
        planId: newPlanId
      });

      return { success: true };
    } catch (error) {
      console.error('Plan update failed:', error.message);
      throw new Error('Failed to update subscription plan');
    }
  }
}

export default new SubscriptionService();
```

### 2. Billing Cycle Management
```javascript
// services/billingCycleService.js
class BillingCycleService {
  async processBillingCycles() {
    const today = new Date();

    // Find subscriptions ending today
    const subscriptionsToRenew = await Subscription.find({
      currentPeriodEnd: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      status: 'active',
      autoRenew: true
    });

    for (const subscription of subscriptionsToRenew) {
      try {
        await this.renewSubscription(subscription);
      } catch (error) {
        console.error(`Failed to renew subscription ${subscription.id}:`, error.message);
        await this.notifyRenewalFailure(subscription.customerId, subscription.id);
      }
    }
  }

  async renewSubscription(subscription) {
    const nextPeriodStart = subscription.currentPeriodEnd;
    const nextPeriodEnd = this.getNextBillingDate(nextPeriodStart, subscription.billingCycle);

    // Update subscription period
    await Subscription.findByIdAndUpdate(subscription._id, {
      currentPeriodStart: nextPeriodStart,
      currentPeriodEnd: nextPeriodEnd,
      lastRenewalDate: new Date()
    });

    // Create invoice for renewal
    await this.createRenewalInvoice(subscription);
  }

  getNextBillingDate(currentDate, billingCycle) {
    const nextDate = new Date(currentDate);
    
    switch (billingCycle) {
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        throw new Error('Invalid billing cycle');
    }
    
    return nextDate;
  }

  async createRenewalInvoice(subscription) {
    const plan = await Plan.findById(subscription.planId);
    
    return await Invoice.create({
      customerId: subscription.customerId,
      subscriptionId: subscription._id,
      type: 'renewal',
      amount: plan.price,
      currency: plan.currency,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }

  async notifyRenewalFailure(customerId, subscriptionId) {
    // Send notification to customer
    await NotificationService.send({
      customerId,
      type: 'subscription_renewal_failed',
      subscriptionId,
      retryUrl: `/billing/retry/${subscriptionId}`
    });
  }
}

export default new BillingCycleService();
```

## Invoicing Patterns

### 1. Invoice Generation
```javascript
// services/invoiceService.js
class InvoiceService {
  async createInvoice(invoiceData) {
    const {
      customerId,
      items,
      taxRate = 0,
      discountCode = null
    } = invoiceData;

    try {
      // Calculate totals
      const subtotal = items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );

      const discount = discountCode 
        ? await this.calculateDiscount(discountCode, subtotal)
        : 0;

      const taxableAmount = subtotal - discount;
      const tax = taxableAmount * (taxRate / 100);
      const total = taxableAmount + tax;

      // Create invoice
      const invoice = await Invoice.create({
        invoiceNumber: await this.generateInvoiceNumber(),
        customerId,
        items,
        subtotal,
        discount,
        tax,
        total,
        taxRate,
        status: 'draft',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      return invoice;
    } catch (error) {
      console.error('Invoice creation failed:', error.message);
      throw new Error('Failed to create invoice');
    }
  }

  async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const latestInvoice = await Invoice.findOne()
      .sort({ createdAt: -1 })
      .limit(1);

    const sequence = latestInvoice 
      ? parseInt(latestInvoice.invoiceNumber.split('-')[1]) + 1
      : 1;

    return `INV-${String(sequence).padStart(6, '0')}-${year}`;
  }

  async calculateDiscount(code, amount) {
    const discount = await Discount.findOne({ code, active: true });
    
    if (!discount) {
      throw new Error('Invalid discount code');
    }

    if (discount.type === 'percentage') {
      return amount * (discount.value / 100);
    } else if (discount.type === 'fixed') {
      return Math.min(discount.value, amount);
    }

    return 0;
  }

  async sendInvoice(invoiceId) {
    const invoice = await Invoice.findById(invoiceId);
    const customer = await Customer.findById(invoice.customerId);

    const pdf = await this.generatePDF(invoice);

    // Send via email
    await EmailService.send({
      to: customer.email,
      subject: `Invoice ${invoice.invoiceNumber}`,
      html: await this.renderTemplate(invoice),
      attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdf }]
    });

    await Invoice.findByIdAndUpdate(invoiceId, {
      status: 'sent',
      sentAt: new Date()
    });
  }

  async generatePDF(invoice) {
    // Implementation depends on PDF library (e.g., pdfkit, puppeteer)
    // This is a placeholder
    return Buffer.from('PDF content');
  }

  async renderTemplate(invoice) {
    // Render invoice HTML template
    return `<html><!-- Invoice template --></html>`;
  }
}

export default new InvoiceService();
```

## Refund Processing

### 1. Refund Service
```javascript
// services/refundService.js
class RefundService {
  async processRefund(transactionId, amount = null) {
    try {
      const transaction = await Transaction.findById(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const refundAmount = amount || transaction.amount;

      if (refundAmount > transaction.amount) {
        throw new Error('Refund amount cannot exceed transaction amount');
      }

      // Process refund with payment gateway
      const refund = await stripe.refunds.create({
        payment_intent: transaction.externalId,
        amount: Math.round(refundAmount * 100)
      });

      // Create refund record
      const refundRecord = await Refund.create({
        transactionId,
        externalId: refund.id,
        amount: refundAmount,
        status: refund.status,
        reason: 'customer_request',
        processedAt: new Date()
      });

      // Update transaction
      await Transaction.findByIdAndUpdate(transactionId, {
        refundedAmount: (transaction.refundedAmount || 0) + refundAmount,
        status: refundAmount === transaction.amount ? 'refunded' : 'partially_refunded'
      });

      // Notify customer
      await NotificationService.send({
        customerId: transaction.customerId,
        type: 'refund_processed',
        amount: refundAmount,
        transactionId
      });

      return refundRecord;
    } catch (error) {
      console.error('Refund processing failed:', error.message);
      throw new Error('Failed to process refund');
    }
  }

  async getRefundStatus(refundId) {
    const refund = await Refund.findById(refundId);
    
    if (!refund) {
      throw new Error('Refund not found');
    }

    // Check status with payment gateway
    const stripeRefund = await stripe.refunds.retrieve(refund.externalId);

    // Update status if changed
    if (stripeRefund.status !== refund.status) {
      await Refund.findByIdAndUpdate(refundId, {
        status: stripeRefund.status
      });
    }

    return refund;
  }
}

export default new RefundService();
```

## Tax Calculation

### 1. Tax Service
```javascript
// services/taxService.js
class TaxService {
  async calculateTax(amount, customerLocation, itemType = 'digital') {
    try {
      // Get tax rate for location
      const taxRate = await this.getTaxRate(customerLocation, itemType);
      
      const taxAmount = amount * (taxRate / 100);

      return {
        subtotal: amount,
        tax: parseFloat(taxAmount.toFixed(2)),
        taxRate,
        total: parseFloat((amount + taxAmount).toFixed(2))
      };
    } catch (error) {
      console.error('Tax calculation failed:', error.message);
      throw new Error('Failed to calculate tax');
    }
  }

  async getTaxRate(location, itemType) {
    // Look up tax rate based on location and item type
    const taxRate = await TaxRate.findOne({
      country: location.country,
      state: location.state || null,
      itemType
    });

    return taxRate ? taxRate.rate : 0;
  }

  async isInEU(country) {
    const euCountries = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
    ];

    return euCountries.includes(country.toUpperCase());
  }

  async validateVATNumber(vatNumber, country) {
    // Validate VAT number format
    const vatFormat = /^[A-Z]{2}\d+$/.test(vatNumber);
    
    if (!vatFormat) {
      return false;
    }

    // Optional: verify with VIES service
    return true;
  }
}

export default new TaxService();
```

## Usage and Best Practices

### 1. Complete Billing Flow
```javascript
// controllers/billingController.js
const paymentService = require('../services/paymentService');
const subscriptionService = require('../services/subscriptionService');
const invoiceService = require('../services/invoiceService');

exports.initiatePayment = async (req, res) => {
  try {
    const { amount, customerId, paymentMethodId } = req.body;

    // Validate input
    const validation = validatePaymentDetails({
      amount,
      customerId,
      paymentMethodId,
      currency: 'USD'
    });

    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Process payment
    const result = await paymentService.processPayment({
      amount,
      customerId,
      paymentMethodId,
      description: 'Product purchase'
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const { customerId, planId, paymentMethodId } = req.body;

    const subscription = await subscriptionService.createSubscription({
      customerId,
      planId,
      paymentMethodId,
      billingCycle: 'monthly'
    });

    // Send confirmation email
    await EmailService.send({
      to: customer.email,
      type: 'subscription_created',
      subscription
    });

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## Security Best Practices

### 1. PCI Compliance
- Never store full credit card details - use tokenization
- Use payment gateways that handle PCI compliance
- Implement proper encryption for sensitive data
- Use HTTPS for all payment transactions
- Regular security audits and penetration testing

### 2. Webhook Handling
```javascript
// routes/webhooks.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
    }

    res.json({received: true});
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
```

### 3. Error Handling
- Log billing errors without exposing sensitive data
- Provide meaningful error messages to customers
- Implement retry logic for transient failures
- Monitor for suspicious activity (fraud detection)

## Billing Best Practices

1. **Currency Handling**: Store amounts in the smallest currency unit (cents for USD)
2. **Rounding**: Use consistent rounding for calculations (banker's rounding)
3. **Timezone**: Store all billing dates in UTC
4. **Audit Trail**: Log all billing operations for compliance
5. **Reconciliation**: Regularly reconcile records with payment gateway
6. **Testing**: Use sandbox/test keys in development
7. **Rate Limiting**: Implement rate limits on billing endpoints
8. **Idempotency**: Use idempotency keys to prevent duplicate charges

Following these billing patterns will help create secure, reliable payment and subscription systems in web applications.
