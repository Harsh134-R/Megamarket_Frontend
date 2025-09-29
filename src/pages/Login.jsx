import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✅ ADDED: Link import
import api from '../services/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ UPDATED: Enhanced handleSubmit with redirect functionality
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', form);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      
      // Check if there's a redirect URL stored
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      
      if (redirectUrl) {
        // Clear the redirect URL and go back to where user was
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        // Default redirect based on role
        if (response.data.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/products');
        }
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  // ✅ NEW: Function to handle register redirect
  const handleRegisterRedirect = () => {
    // Preserve the redirect URL for after registration
    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
      localStorage.setItem('redirectAfterRegister', redirectUrl);
    }
    navigate('/register');
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            placeholder='Enter Valid Email'
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
            placeholder='Enter Valid Password'
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
          Login
        </button>
      </form>
      
      {/* ✅ NEW: Link to register page with redirect handling */}
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={handleRegisterRedirect}
            className="text-blue-600 hover:text-blue-800 font-semibold underline"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
