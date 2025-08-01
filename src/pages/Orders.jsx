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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white shadow rounded-lg p-6 border">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <div>
                  <div className="text-lg font-semibold">Order #{order.id}</div>
                  <div className="text-gray-500 text-sm">Date: {order.date ? new Date(order.date).toLocaleString() : ''}</div>
                  <div className="text-gray-700 mt-2">Shipping: {order.shippingAddress}</div>
                </div>
                <div className="mt-4 md:mt-0 text-right flex flex-col gap-2 items-end">
                  <div className="text-xl font-bold text-green-600">${order.total}</div>
                  <button
                    className="bg-yellow-400 px-3 py-1 rounded text-sm mt-2"
                    onClick={() => handleEditAddress(order)}
                  >Edit Address</button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm mt-2"
                    onClick={() => handleCancelOrder(order.id)}
                  >Cancel Order</button>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center bg-gray-50 rounded p-3 shadow-sm">
                      {item.product && item.product.image && (
                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-contain rounded mr-4 border bg-white" style={{ display: 'block', background: '#fff' }} />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item.product ? item.product.name : `Product #${item.productId}`}</div>
                        <div className="text-gray-500 text-sm">Qty: {item.quantity}</div>
                        <div className="text-gray-700 text-sm">Price: ${item.price}</div>
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
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Shipping Address</h3>
            <textarea
              className="border p-2 rounded w-full mb-4"
              rows={3}
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleUpdateAddress}
              >Save</button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;