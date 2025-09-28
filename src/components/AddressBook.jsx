import React, { useEffect, useState } from 'react';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../services/api';

const emptyAddress = {
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  label: '',
};

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyAddress);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data);
    } catch (err) {
      setError('Failed to load addresses');
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await addAddress(form);
      }
      setForm(emptyAddress);
      setEditingId(null);
      fetchAddresses();
    } catch {
      setError('Failed to save address');
    }
  };

  const handleEdit = address => {
    setForm(address);
    setEditingId(address.id);
  };

  const handleDelete = async id => {
    if (window.confirm('Delete this address?')) {
      await deleteAddress(id);
      fetchAddresses();
    }
  };

  const handleCancel = () => {
    setForm(emptyAddress);
    setEditingId(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
  <h2 className="text-3xl font-extrabold mb-6 text-gray-900">Address Book</h2>
  {error && <div className="text-red-600 mb-4 font-semibold">{error}</div>}

  <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-6 mb-8 space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input
        name="label"
        value={form.label}
        onChange={handleChange}
        placeholder="Label (Home, Work)"
        className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
        required
      />
      <input
        name="street"
        value={form.street}
        onChange={handleChange}
        placeholder="Street"
        className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
        required
      />
      <input
        name="city"
        value={form.city}
        onChange={handleChange}
        placeholder="City"
        className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
        required
      />
      <input
        name="state"
        value={form.state}
        onChange={handleChange}
        placeholder="State"
        className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
        required
      />
      <input
        name="postalCode"
        value={form.postalCode}
        onChange={handleChange}
        placeholder="Postal Code"
        className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
        required
      />
      <input
        name="country"
        value={form.country}
        onChange={handleChange}
        placeholder="Country"
        className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
        required
      />
    </div>

    <div className="flex space-x-4">
      <button
        type="submit"
        className="bg-indigo-600 text-white rounded-full px-6 py-3 font-semibold shadow hover:bg-indigo-700 transition focus:outline-none focus:ring-4 focus:ring-indigo-400"
      >
        {editingId ? 'Update' : 'Add'} Address
      </button>
      {editingId && (
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-200 text-gray-700 rounded-full px-6 py-3 font-semibold shadow hover:bg-gray-300 transition focus:outline-none focus:ring-4 focus:ring-gray-300"
        >
          Cancel
        </button>
      )}
    </div>
  </form>

  <div className="space-y-6">
    {addresses.map(addr => (
      <div
        key={addr.id}
        className="bg-white rounded-2xl shadow-md p-5 flex justify-between items-center"
      >
        <div>
          <div className="font-semibold text-gray-900">{addr.label}</div>
          <div className="text-gray-700 text-sm">
            {addr.street}, {addr.city}, {addr.state}, {addr.postalCode}, {addr.country}
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(addr)}
            className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-full font-semibold shadow hover:bg-yellow-500 transition focus:outline-none focus:ring-4 focus:ring-yellow-300"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(addr.id)}
            className="bg-red-600 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-red-700 transition focus:outline-none focus:ring-4 focus:ring-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

  );
};

export default AddressBook; 