import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    const paymentStatus = searchParams.get('redirect_status');

    const createOrderAfterPayment = async () => {
      try {
        const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
        if (!pendingOrder) {
          setError('Order details not found.');
          setLoading(false);
          return;
        }
        await api.post('/orders', {
          ...pendingOrder,
          paymentStatus: 'PAID',
          paymentIntentId
        });
        localStorage.removeItem('pendingOrder');
        // Optionally clear cart here if you want
        setLoading(false);
      } catch (err) {
        setError('Failed to create order after payment.');
        setLoading(false);
      }
    };

    if (paymentStatus === 'succeeded') {
      createOrderAfterPayment();
    } else {
      navigate('/cart');
    }
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4">Processing payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">{error}</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 