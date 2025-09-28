import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import api from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC);

const CheckoutForm = ({ clientSecret, amount, onPaymentSuccess, onPaymentError, beforePayment }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 const handleSubmit = async (event) => {
  event.preventDefault();
  setLoading(true);
  setError('');
  
  if (beforePayment) {
    await beforePayment();
  }
  
  if (!stripe || !elements) {
    setError('Stripe has not loaded yet.');
    setLoading(false);
    return;
  }
  
  const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
    elements,
    redirect: 'if_required',
  });
  
  if (stripeError) {
    setError(stripeError.message);
    onPaymentError?.(stripeError.message);
  } else if (paymentIntent && paymentIntent.status === 'succeeded') {
    onPaymentSuccess?.();
  }
  
  setLoading(false);
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="p-4 border border-gray-300 rounded bg-gray-50 mt-4">
        <p className="text-sm text-gray-600 mb-2">Total Amount:</p>
        <p className="text-xl font-bold">${amount.toFixed(2)}</p>
      </div>
      {error && <div className="text-red-500 p-2 border border-red-300 rounded">{error}</div>}
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const StripePayment = ({ amount, onPaymentSuccess, onPaymentError, beforePayment }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (amount > 0) {
      createPaymentIntent();
    }
    // eslint-disable-next-line
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const response = await api.post('/payment/create-payment-intent', {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
      });
      if (response.data.error) {
        setError(response.data.error);
        return;
      }
      setClientSecret(response.data.clientSecret);
    } catch (err) {
      setError('Failed to create payment intent');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !clientSecret) {
    return <div className="text-center p-4">Loading payment form...</div>;
  }
  if (error) {
    return <div className="text-red-500 p-4 border border-red-300 rounded">{error}</div>;
  }
  if (!clientSecret) {
    return null;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        clientSecret={clientSecret}
        amount={amount}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        beforePayment={beforePayment}
      />
    </Elements>
  );
};

export default StripePayment; 