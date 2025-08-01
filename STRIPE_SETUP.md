# Stripe Payment Integration Setup

This guide will help you set up Stripe payment integration for your e-commerce application.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Your Stripe API keys

## Backend Setup

### 1. Update Application Properties

Edit `/Backend/CursorEcomm/src/main/resources/application.properties`:

```properties
# Replace with your actual Stripe keys
stripe.secret.key=sk_test_your_secret_key_here
stripe.publishable.key=pk_test_your_publishable_key_here
```

### 2. Get Your Stripe Keys

1. Log in to your Stripe Dashboard
2. Go to Developers → API Keys
3. Copy your **Publishable key** and **Secret key**
4. Replace the placeholder values in `application.properties`

## Frontend Setup

### 1. Update Stripe Publishable Key

Edit `/Ecom/Frontend/src/components/StripePayment.jsx`:

```javascript
// Replace with your actual publishable key
const stripePromise = loadStripe('pk_test_your_publishable_key_here');
```

### 2. Install Dependencies

Make sure you have the Stripe package installed:

```bash
npm install @stripe/stripe-js
```

## Testing

### Test Card Numbers

Use these test card numbers for testing:

- **Visa**: 4242424242424242
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005

### Test CVC and Expiry

- **CVC**: Any 3 digits (e.g., 123)
- **Expiry**: Any future date (e.g., 12/25)

## Features Implemented

1. **Payment Intent Creation**: Backend creates payment intents via Stripe API
2. **Secure Payment Processing**: Frontend handles payment confirmation securely
3. **Order Integration**: Successful payments automatically create orders
4. **Address Management**: Users can select saved addresses or enter new ones
5. **Payment Success Page**: Dedicated page for successful payments
6. **Error Handling**: Comprehensive error handling for failed payments

## Flow

1. User adds items to cart
2. User clicks "Proceed to Checkout" from cart
3. User selects/enters shipping address
4. User clicks "Continue to Payment"
5. Stripe payment form loads
6. User enters payment details
7. Payment is processed securely
8. User is redirected to success page
9. Order is created in the system

## Security Notes

- Never expose your Stripe secret key in frontend code
- Always use HTTPS in production
- Implement webhook handling for production use
- Add proper error logging and monitoring

## Production Considerations

1. **Webhooks**: Implement webhook handling for payment status updates
2. **Error Logging**: Add comprehensive error logging
3. **Monitoring**: Set up payment monitoring and alerts
4. **PCI Compliance**: Ensure your implementation meets PCI requirements
5. **Testing**: Thoroughly test with Stripe's test mode before going live

## Troubleshooting

### Common Issues

1. **"Stripe failed to load"**: Check your publishable key
2. **"Payment intent creation failed"**: Check your secret key and amount format
3. **CORS errors**: Ensure backend CORS is configured correctly
4. **Payment declined**: Use valid test card numbers

### Debug Steps

1. Check browser console for JavaScript errors
2. Check backend logs for API errors
3. Verify API keys are correct
4. Ensure amounts are in cents (multiply by 100)
5. Check network tab for failed requests 