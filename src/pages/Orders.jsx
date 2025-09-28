import React, { useState, useEffect } from 'react';
import api, { updateOrderAddress, deleteOrder } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newAddress, setNewAddress] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEditAddress = (order) => {
    setEditingOrderId(order.id);
    setNewAddress(order.shippingAddress);
    setShowModal(true);
  };

  const handleUpdateAddress = async () => {
    try {
      await updateOrderAddress(editingOrderId, newAddress);
      setShowModal(false);
      setEditingOrderId(null);
      setNewAddress('');
      fetchOrders();
    } catch {
      setError('Failed to update address');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await deleteOrder(orderId);
      fetchOrders();
    } catch {
      setError('Failed to cancel order');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
  <h2 className="text-3xl font-extrabold mb-8 text-gray-900">Your Orders</h2>
  {error && <p className="text-red-600 mb-6 font-semibold">{error}</p>}
  {orders.length === 0 ? (
    <p className="text-gray-600 text-lg italic">No orders found.</p>
  ) : (
    <div className="space-y-8">
      {orders.map(order => (
        <div key={order.id} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Order #{order.id}</h3>
              <p className="text-gray-500 mt-1 text-sm">
                Date: {order.date ? new Date(order.date).toLocaleString() : ''}
              </p>
              <p className="text-gray-700 mt-3">{order.shippingAddress}</p>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col items-end gap-3">
              <p className="text-2xl font-bold text-green-600">${order.total}</p>
              <button
                onClick={() => handleEditAddress(order)}
                className="bg-yellow-400 text-gray-900 py-2 px-4 rounded-md font-semibold hover:bg-yellow-500 transition"
              >
                Edit Address
              </button>
              <button
                onClick={() => handleCancelOrder(order.id)}
                className="bg-red-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-700 transition"
              >
                Cancel Order
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {order.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center bg-gray-50 rounded-xl p-4 shadow-sm"
                >
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-contain rounded-lg bg-white border border-gray-200 mr-4"
                      style={{ display: 'block' }}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.product ? item.product.name : `Product #${item.productId}`}
                    </p>
                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                    <p className="text-gray-700 text-sm">Price: ${item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  {showModal && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-6 text-gray-900">Edit Shipping Address</h3>
        <textarea
          className="border border-gray-300 p-4 rounded-lg w-full mb-6 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={4}
          value={newAddress}
          onChange={e => setNewAddress(e.target.value)}
        />
        <div className="flex justify-end gap-4">
          <button
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition focus:outline-none focus:ring-4 focus:ring-indigo-400"
            onClick={handleUpdateAddress}
          >
            Save
          </button>
          <button
            className="bg-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition focus:outline-none focus:ring-4 focus:ring-gray-400"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  );
};

export default Orders;