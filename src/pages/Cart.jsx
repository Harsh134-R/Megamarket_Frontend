import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getAddresses, addAddress } from '../services/api';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress] = useState({
    label: '', street: '', city: '', state: '', postalCode: '', country: ''
  });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get('/cart');
        setCart(response.data);
      } catch (err) {
        setError('Failed to fetch cart');
      }
    };
    const fetchAddressesList = async () => {
      try {
        const res = await getAddresses();
        setAddresses(res.data);
      } catch {}
    };
    fetchCart();
    fetchAddressesList();
  }, []);

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let shippingAddress = '';
      if (useNewAddress) {
        const res = await addAddress(newAddress);
        shippingAddress = `${res.data.label}: ${res.data.street}, ${res.data.city}, ${res.data.state}, ${res.data.postalCode}, ${res.data.country}`;
      } else {
        const addr = addresses.find(a => a.id === Number(selectedAddressId));
        if (!addr) {
          setError('Please select or enter an address');
          setIsSubmitting(false);
          return;
        }
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
        total
      });
      alert('Order placed successfully');
      navigate('/orders');
    } catch (err) {
      setError('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent zero or negative quantities
    try {
      const updatedItems = cart.items.map(item =>
        item.id === itemId
          ? { productId: item.product.id, quantity: newQuantity }
          : { productId: item.product.id, quantity: item.quantity }
      );
      await api.post('/cart', updatedItems);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const updatedItems = cart.items
        .filter(item => item.id !== itemId)
        .map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }));
      await api.post('/cart', updatedItems);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (err) {
      setError('Failed to remove item');
    }
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

  if (error) return <div className="text-red-500">{error}</div>;
  if (!cart) return <div>Loading...</div>;
  if (!Array.isArray(cart.items)) return <div>Your cart is empty</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-white rounded-2xl shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">Your Cart</h2>
      {cart.items.length === 0 ? (
        <p className="text-gray-600 text-lg">Your cart is empty</p>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-start gap-8 mb-10">
            <div className="flex flex-col gap-6 flex-1">
              {cart.items.map(item => (
                <div key={item.id} className="flex items-center gap-6 bg-gray-50 p-6 rounded-xl shadow">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-28 h-28 rounded-xl bg-gray-100 shadow-md"
                    style={{ display: 'block' }}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.product.name}</h3>
                    <p className="text-gray-500 mb-3">Price: ${item.product.price}</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 text-xl font-bold flex items-center justify-center hover:bg-gray-300 transition"
                        disabled={item.quantity === 1}
                      >
                        −
                      </button>
                      <span className="text-lg font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 text-xl font-bold flex items-center justify-center hover:bg-gray-300 transition"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-5 px-4 py-2 rounded-full border border-red-200 text-red-600 font-bold hover:bg-red-50 transition"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-gray-800 font-bold mt-2">
                      Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-end justify-center md:w-1/3 mt-8 md:mt-0 text-2xl font-bold text-gray-900">
              ${cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="bg-gray-50 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Shipping Address</h3>
              {addresses.length > 0 && (
                <select
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-400"
                  value={selectedAddressId}
                  onChange={handleAddressChange}
                  disabled={useNewAddress}
                >
                  <option value="">Select saved address</option>
                  {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.label}: {addr.street}, {addr.city}, {addr.state}, {addr.postalCode}, {addr.country}
                    </option>
                  ))}
                </select>
              )}
              <div className="mt-4 bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="mb-4 font-semibold text-gray-900">Or enter a new address:</div>
                <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="label"
                    value={newAddress.label || ""}
                    onChange={handleNewAddressChange}
                    placeholder="Label (Home, Work)"
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
                    required={useNewAddress}
                  />
                  <input
                    name="street"
                    value={newAddress.street || ""}
                    onChange={handleNewAddressChange}
                    placeholder="Street"
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
                    required={useNewAddress}
                  />
                  <input
                    name="city"
                    value={newAddress.city || ""}
                    onChange={handleNewAddressChange}
                    placeholder="City"
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
                    required={useNewAddress}
                  />
                  <input
                    name="state"
                    value={newAddress.state || ""}
                    onChange={handleNewAddressChange}
                    placeholder="State"
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
                    required={useNewAddress}
                  />
                  <input
                    name="postalCode"
                    value={newAddress.postalCode || ""}
                    onChange={handleNewAddressChange}
                    placeholder="Postal Code"
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
                    required={useNewAddress}
                  />
                  <input
                    name="country"
                    value={newAddress.country || ""}
                    onChange={handleNewAddressChange}
                    placeholder="Country"
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
                    required={useNewAddress}
                  />
                </form>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-md flex flex-col items-end">
              <div className="text-3xl font-bold text-gray-900 mb-6">
                Total: $
                {cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-full font-bold bg-black text-white shadow-md hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-800 w-full md:w-auto transition disabled:opacity-50"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-full font-bold bg-indigo-600 text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 w-full md:w-auto transition disabled:opacity-50"
                >
                  Place Order (Direct)
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
