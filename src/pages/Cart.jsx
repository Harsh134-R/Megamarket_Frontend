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
    try {
      let shippingAddress = '';
      if (useNewAddress) {
        const res = await addAddress(newAddress);
        shippingAddress = `${res.data.label}: ${res.data.street}, ${res.data.city}, ${res.data.state}, ${res.data.postalCode}, ${res.data.country}`;
      } else {
        const addr = addresses.find(a => a.id === Number(selectedAddressId));
        if (!addr) return setError('Please select or enter an address');
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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cart.items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div className="grid gap-4">
            {cart.items.map(item => (
              <div key={item.id} className="flex items-center border rounded-lg p-4 shadow-sm bg-white">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 object-contain rounded mr-4 bg-white border"
                  style={{ display: 'block', background: '#fff' }}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600">Price: ${item.product.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >−</button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >+</button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="ml-4 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >Remove</button>
                  </div>
                  <p className="text-gray-800 font-bold mt-2">
                    Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <div className="mb-2">
                {addresses.length > 0 && (
                  <select
                    className="border p-2 rounded w-full"
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
              </div>
              <div className="bg-gray-50 p-4 rounded shadow">
                <div className="mb-2 font-medium">Or enter a new address:</div>
                <div className="grid grid-cols-2 gap-2">
                  <input name="label" value={newAddress.label || ""} onChange={handleNewAddressChange} placeholder="Label (Home, Work)" className="border p-2 rounded" required={useNewAddress} />
                  <input name="street" value={newAddress.street || ""} onChange={handleNewAddressChange} placeholder="Street" className="border p-2 rounded" required={useNewAddress} />
                  <input name="city" value={newAddress.city || ""} onChange={handleNewAddressChange} placeholder="City" className="border p-2 rounded" required={useNewAddress} />
                  <input name="state" value={newAddress.state || ""} onChange={handleNewAddressChange} placeholder="State" className="border p-2 rounded" required={useNewAddress} />
                  <input name="postalCode" value={newAddress.postalCode || ""} onChange={handleNewAddressChange} placeholder="Postal Code" className="border p-2 rounded" required={useNewAddress} />
                  <input name="country" value={newAddress.country || ""} onChange={handleNewAddressChange} placeholder="Country" className="border p-2 rounded" required={useNewAddress} />
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-end items-end">
              <div className="text-xl font-bold mb-2">
                Total: $
                {cart.items
                  .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
                  .toFixed(2)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/checkout')}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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