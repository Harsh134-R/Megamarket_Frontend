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
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Address Book</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-4 mb-6 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input name="label" value={form.label} onChange={handleChange} placeholder="Label (Home, Work)" className="border p-2 rounded" required />
          <input name="street" value={form.street} onChange={handleChange} placeholder="Street" className="border p-2 rounded" required />
          <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="border p-2 rounded" required />
          <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="border p-2 rounded" required />
          <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Postal Code" className="border p-2 rounded" required />
          <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className="border p-2 rounded" required />
        </div>
        <div className="flex gap-2 mt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Add'} Address</button>
          {editingId && <button type="button" onClick={handleCancel} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>
      <div className="space-y-4">
        {addresses.map(addr => (
          <div key={addr.id} className="bg-gray-50 p-4 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{addr.label}</div>
              <div className="text-gray-700 text-sm">{addr.street}, {addr.city}, {addr.state}, {addr.postalCode}, {addr.country}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(addr)} className="bg-yellow-400 px-3 py-1 rounded">Edit</button>
              <button onClick={() => handleDelete(addr.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressBook; 