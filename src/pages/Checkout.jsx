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

      alert('Order placed successfully!');
      navigate('/orders');
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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      
      {!paymentStep ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <hr className="my-4" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Address Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
            
            {addresses.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select saved address:</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
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

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Or enter a new address:</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="label"
                  value={newAddress.label || ""}
                  onChange={handleNewAddressChange}
                  placeholder="Label (Home, Work)"
                  className="border border-gray-300 rounded-md p-2"
                  required={useNewAddress}
                />
                <input
                  name="street"
                  value={newAddress.street || ""}
                  onChange={handleNewAddressChange}
                  placeholder="Street"
                  className="border border-gray-300 rounded-md p-2"
                  required={useNewAddress}
                />
                <input
                  name="city"
                  value={newAddress.city || ""}
                  onChange={handleNewAddressChange}
                  placeholder="City"
                  className="border border-gray-300 rounded-md p-2"
                  required={useNewAddress}
                />
                <input
                  name="state"
                  value={newAddress.state || ""}
                  onChange={handleNewAddressChange}
                  placeholder="State"
                  className="border border-gray-300 rounded-md p-2"
                  required={useNewAddress}
                />
                <input
                  name="postalCode"
                  value={newAddress.postalCode || ""}
                  onChange={handleNewAddressChange}
                  placeholder="Postal Code"
                  className="border border-gray-300 rounded-md p-2"
                  required={useNewAddress}
                />
                <input
                  name="country"
                  value={newAddress.country || ""}
                  onChange={handleNewAddressChange}
                  placeholder="Country"
                  className="border border-gray-300 rounded-md p-2"
                  required={useNewAddress}
                />
              </div>
            </div>

            <button
              onClick={handleAddressSubmit}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Payment</h3>
            <StripePayment
              amount={total}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              beforePayment={saveOrderDetailsToStorage}
            />
          </div>
          
          <button
            onClick={() => setPaymentStep(false)}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Address
          </button>
        </div>
      )}
    </div>
  );
};

export default Checkout; 