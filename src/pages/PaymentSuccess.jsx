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
          // No pending order means direct flow was used - just show success
          setLoading(false);
          return;
        }
        await api.post('/orders', {
          ...pendingOrder,
          paymentStatus: 'PAID',
          paymentIntentId
        });
        localStorage.removeItem('pendingOrder');
        setLoading(false);
      } catch (err) {
        setError('Failed to create order after payment.');
        setLoading(false);
      }
    };

    // If redirect flow (has payment_intent), handle it
    if (paymentIntentId && paymentStatus === 'succeeded') {
      createOrderAfterPayment();
    } else if (paymentIntentId && paymentStatus !== 'succeeded') {
      navigate('/cart');
    } else {
      // Direct flow - just show success page
      setLoading(false);
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
    <div className="container mx-auto p-6 flex justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="text-green-600 text-7xl mb-6">✓</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Payment Successful!</h2>
        <p className="text-gray-700 mb-8 text-lg leading-relaxed">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition focus:outline-none focus:ring-4 focus:ring-indigo-400"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-gray-200 text-gray-900 py-3 rounded-xl font-semibold shadow hover:bg-gray-300 transition focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
