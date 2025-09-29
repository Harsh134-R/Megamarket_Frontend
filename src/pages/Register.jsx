import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ UPDATED: Enhanced handleSubmit with redirect handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      alert('Registration successful! Please log in.');
      
      // Check if there's a redirect URL from the register flow
      const redirectUrl = localStorage.getItem('redirectAfterRegister');
      
      if (redirectUrl) {
        // Move the redirect URL back to login flow
        localStorage.setItem('redirectAfterLogin', redirectUrl);
        localStorage.removeItem('redirectAfterRegister');
      }
      
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            placeholder='Enter Name'
            value={form.name}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            placeholder='Enter Email'
            value={form.email}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            placeholder='Enter Password'
            value={form.password}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="
            bg-gray-900 text-white px-5 py-3 rounded-md
            transition duration-300 ease-in-out
            hover:bg-gray-100 hover:text-gray-900 
            hover:shadow-lg
            focus:outline-none focus:ring-2 focus:ring-gray-400
          "
        >
          Register
        </button>
      </form>
      
      {/* ✅ NEW: Link back to login */}
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-800 font-semibold underline"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;