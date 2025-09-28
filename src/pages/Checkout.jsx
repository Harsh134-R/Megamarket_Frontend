import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getAddresses, addAddress } from '../services/api';
import StripePayment from '../components/StripePayment';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress] = useState({
    label: '', street: '', city: '', state: '', postalCode: '', country: ''
  });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartResponse, addressesResponse] = await Promise.all([
          api.get('/cart'),
          getAddresses()
        ]);
        setCart(cartResponse.data);
        setAddresses(addressesResponse.data);
      } catch (err) {
        setError('Failed to load checkout data');
      }
    };
    fetchData();
  }, []);

  const handleAddressSubmit = async () => {
    if (!useNewAddress && !selectedAddressId) {
      setError('Please select or enter an address');
      return;
    }

    if (useNewAddress) {
      const requiredFields = ['label', 'street', 'city', 'state', 'postalCode', 'country'];
      const missingFields = requiredFields.filter(field => !newAddress[field]);
      if (missingFields.length > 0) {
        setError('Please fill in all address fields');
        return;
      }
    }

    setPaymentStep(true);
    setError('');
  };

  const handlePaymentSuccess = async () => {
    try {
      let shippingAddress = '';
      if (useNewAddress) {
        const res = await addAddress(newAddress);
        shippingAddress = `${res.data.label}: ${res.data.street}, ${res.data.city}, ${res.data.state}, ${res.data.postalCode}, ${res.data.country}`;
      } else {
        const addr = addresses.find(a => a.id === Number(selectedAddressId));
        shippingAddress = `${addr.label}: ${addr.street}, ${addr.city}, ${addr.state}, ${addr.postalCode}, ${addr.country}`;
      }

      const orderItems = cart.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const total = cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      await api.post('/orders', {
        items: orderItems,
        shippingAddress,
        total,
        paymentStatus: 'PAID'
      });

      navigate('/payment-success');
    } catch (err) {
      setError('Failed to place order');
    }
  };

  const handlePaymentError = (errorMessage) => {
    setError(`Payment failed: ${errorMessage}`);
  };

  const handleAddressChange = e => {
    setSelectedAddressId(e.target.value);
    setUseNewAddress(false);
  };

  const handleNewAddressChange = e => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    setUseNewAddress(true);
    setSelectedAddressId('');
  };

  const saveOrderDetailsToStorage = async () => {
    let shippingAddress = '';
    if (useNewAddress) {
      const res = await addAddress(newAddress);
      shippingAddress = `${res.data.label}: ${res.data.street}, ${res.data.city}, ${res.data.state}, ${res.data.postalCode}, ${res.data.country}`;
    } else {
      const addr = addresses.find(a => a.id === Number(selectedAddressId));
      shippingAddress = `${addr.label}: ${addr.street}, ${addr.city}, ${addr.state}, ${addr.postalCode}, ${addr.country}`;
    }
    const orderItems = cart.items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));
    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    localStorage.setItem('pendingOrder', JSON.stringify({
      items: orderItems,
      shippingAddress,
      total
    }));
  };

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!cart) return <div className="text-center p-4">Loading...</div>;

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto p-6 max-w-5xl bg-gray-50 rounded-2xl shadow-xl">
  <h2 className="text-3xl font-extrabold mb-8 text-gray-900">Checkout</h2>

  {!paymentStep ? (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Order Summary Card */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Order Summary</h3>
        <div className="space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b border-gray-200 pb-3 last:border-none">
              <div>
                <p className="font-medium text-gray-800">{item.product.name}</p>
                <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <hr className="my-6" />
          <div className="flex justify-between items-center text-lg font-extrabold text-gray-900">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address Card */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Shipping Address</h3>

        {addresses.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select saved address:</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedAddressId}
              onChange={handleAddressChange}
              disabled={useNewAddress}
            >
              <option value="">Choose an address</option>
              {addresses.map(addr => (
                <option key={addr.id} value={addr.id}>
                  {addr.label}: {addr.street}, {addr.city}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Or enter a new address:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="label"
              value={newAddress.label || ""}
              onChange={handleNewAddressChange}
              placeholder="Label (Home, Work)"
              className="border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required={useNewAddress}
            />
            <input
              name="street"
              value={newAddress.street || ""}
              onChange={handleNewAddressChange}
              placeholder="Street"
              className="border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required={useNewAddress}
            />
            <input
              name="city"
              value={newAddress.city || ""}
              onChange={handleNewAddressChange}
              placeholder="City"
              className="border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required={useNewAddress}
            />
            <input
              name="state"
              value={newAddress.state || ""}
              onChange={handleNewAddressChange}
              placeholder="State"
              className="border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required={useNewAddress}
            />
            <input
              name="postalCode"
              value={newAddress.postalCode || ""}
              onChange={handleNewAddressChange}
              placeholder="Postal Code"
              className="border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required={useNewAddress}
            />
            <input
              name="country"
              value={newAddress.country || ""}
              onChange={handleNewAddressChange}
              placeholder="Country"
              className="border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required={useNewAddress}
            />
          </div>
        </div>

        <button
          onClick={handleAddressSubmit}
          className="
            mt-8 w-full 
            bg-gradient-to-r from-gray-900 via-black to-gray-900 
            text-white py-3 rounded-lg font-semibold 
            shadow-lg 
            hover:from-gray-800 hover:via-gray-900 hover:to-gray-800 
            transition 
            focus:outline-none focus:ring-4 focus:ring-indigo-400/70
          "
        >
          Continue to Payment
        </button>
      </div>
    </div>
  ) : (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4">Payment</h3>
        <StripePayment
          amount={total}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          beforePayment={saveOrderDetailsToStorage}
        />
      </div>

      <button
        onClick={() => setPaymentStep(false)}
        className="text-indigo-600 hover:text-indigo-800 font-semibold"
      >
        ← Back to Address
      </button>
    </div>
  )}
</div>


  );
};

export default Checkout; 